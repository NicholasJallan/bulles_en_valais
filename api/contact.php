<?php
declare(strict_types=1);

// Contact form relay: validates the JSON request, then sends one plain-text
// e-mail through an authenticated SMTP session (STARTTLS + AUTH LOGIN).
// Must stay compatible with PHP 7.4 (the version PHP-FPM runs in production).
// Credentials live in mail-config.php, on the server only (never committed).

const ALLOWED_ORIGINS = [
    'https://dive.bullesenvalais.ch',
    'https://bullesenvalais.ch',
    'https://www.bullesenvalais.ch',
];
const ALLOWED_INTERESTS = [
    'baptism', 'sdi-owd', 'sdi-aowd', 'sdi-rescue', 'tdi', 'padi-owd', 'padi-aowd',
    'padi-rescue', 'padi-dm', 'ffessm', 'specialty', 'refresher', 'other',
];
const ALLOWED_LOCALES = ['fr', 'en', 'de'];

const MAX_BODY_BYTES = 32768;
const MAX_JSON_DEPTH = 4;
const MAX_NAME_CHARS = 100;
const MAX_EMAIL_CHARS = 254;
const MAX_MESSAGE_CHARS = 5000;
const MIN_ELAPSED_MS = 3000;
const PHONE_PATTERN = '#^[0-9 +()./\-]{0,40}$#D'; // "/" as in 079/436 81 12
// Unquoted local part only: FILTER_VALIDATE_EMAIL alone accepts quoted parts
// that smuggle LF or NUL into headers.
const EMAIL_PATTERN = '/^[A-Za-z0-9.!#$%&\'*+\/=?^_`{|}~-]+@[A-Za-z0-9.-]+$/D';

const HEADER_CHUNK_BYTES = 36; // encoded word = 60 chars, fits after "Subject: "
const SITE_NAME = 'Bulles en Valais';
const SMTP_HELO = 'localhost';
const SMTP_TIMEOUT_S = 10;
const SMTP_MAX_REPLY_LINES = 50;

// ---------------------------------------------------------------------------
// Text and header encoding
// ---------------------------------------------------------------------------

function normalize_newlines(string $text): string
{
    return (string) preg_replace('/\r\n|\r|\n/', "\r\n", $text);
}

function sanitize_header(string $value): string
{
    return trim((string) preg_replace('/[\x00-\x1F\x7F]+/', ' ', $value));
}

function strip_control_chars(string $text): string
{
    return (string) preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $text);
}

function is_valid_utf8(string $text): bool
{
    return preg_match('//u', $text) === 1;
}

function char_length(string $text): int
{
    return (int) preg_match_all('/./su', $text);
}

// RFC 2047 "B" encoded words, folded so that no line exceeds 76 characters.
function encode_header(string $value): string
{
    if ($value === '') {
        return '';
    }
    $chars = preg_split('//u', $value, -1, PREG_SPLIT_NO_EMPTY);
    $chunks = [''];
    foreach ($chars === false ? str_split($value) : $chars as $char) {
        $last = count($chunks) - 1;
        if ($chunks[$last] !== '' && strlen($chunks[$last]) + strlen($char) > HEADER_CHUNK_BYTES) {
            $chunks[] = $char;
        } else {
            $chunks[$last] .= $char;
        }
    }
    $words = array_map(static function (string $chunk): string {
        return '=?UTF-8?B?' . base64_encode($chunk) . '?=';
    }, $chunks);
    return implode("\r\n ", $words);
}

// Base64 leaves no room for a "." line or a stray CRLF inside the DATA phase.
function encode_body(string $text): string
{
    return chunk_split(base64_encode(normalize_newlines($text)), 76, "\r\n");
}

function dot_stuff(string $message): string
{
    return (string) preg_replace('/^\./m', '..', $message);
}

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

function origin_allowed(string $origin): bool
{
    return in_array($origin, ALLOWED_ORIGINS, true);
}

function is_json_content_type(string $contentType): bool
{
    return preg_match('#^application/json\s*(;|$)#i', trim($contentType)) === 1;
}

function is_spam(array $data): bool
{
    $website = $data['website'] ?? '';
    if (!is_string($website) || trim($website) !== '') {
        return true;
    }
    $elapsed = $data['elapsed'] ?? null;
    return !is_numeric($elapsed) || (float) $elapsed < MIN_ELAPSED_MS;
}

/** Trimmed string value, '' when absent, null when the type is wrong. */
function string_field(array $data, string $key): ?string
{
    $value = $data[$key] ?? '';
    return is_string($value) ? trim($value) : null;
}

function is_valid_name(?string $name): bool
{
    if ($name === null || !is_valid_utf8($name)) {
        return false;
    }
    $length = char_length(sanitize_header($name));
    return $length >= 1 && $length <= MAX_NAME_CHARS;
}

function is_valid_email(?string $email): bool
{
    return $email !== null
        && strlen($email) <= MAX_EMAIL_CHARS
        && preg_match(EMAIL_PATTERN, $email) === 1
        && filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function is_valid_phone(?string $phone): bool
{
    return $phone !== null && preg_match(PHONE_PATTERN, $phone) === 1;
}

function is_valid_message(?string $message): bool
{
    return $message !== null && is_valid_utf8($message) && char_length($message) <= MAX_MESSAGE_CHARS;
}

function allowed_value($value, array $allowed, string $fallback): string
{
    return is_string($value) && in_array($value, $allowed, true) ? $value : $fallback;
}

/** @return array{errors: string[], data: array<string, string>} */
function validate_payload(array $data): array
{
    $name = string_field($data, 'name');
    $email = string_field($data, 'email');
    $phone = string_field($data, 'phone');
    $message = string_field($data, 'message');
    $checks = [
        'name' => is_valid_name($name),
        'email' => is_valid_email($email),
        'phone' => is_valid_phone($phone),
        'message' => is_valid_message($message),
    ];
    return [
        'errors' => array_keys(array_filter($checks, static function (bool $valid): bool {
            return !$valid;
        })),
        'data' => [
            'name' => sanitize_header((string) $name),
            'email' => $checks['email'] ? (string) $email : '',
            'phone' => sanitize_header((string) $phone),
            'interest' => allowed_value($data['interest'] ?? null, ALLOWED_INTERESTS, 'other'),
            'message' => strip_control_chars((string) $message),
            'locale' => allowed_value($data['locale'] ?? null, ALLOWED_LOCALES, ''),
        ],
    ];
}

function response(int $status, ?array $body): array
{
    return ['status' => $status, 'body' => $body, 'send' => null];
}

// Checks run in a fixed order; 'send' carries the validated fields when the
// message must actually be delivered.
function evaluate_request(string $method, string $contentType, string $origin, string $raw): array
{
    if ($method === 'OPTIONS') {
        return response(204, null);
    }
    if ($method !== 'POST') {
        return response(405, ['ok' => false, 'error' => 'method']);
    }
    if (!is_json_content_type($contentType) || !origin_allowed($origin)) {
        return response(403, ['ok' => false, 'error' => 'forbidden']);
    }
    if (strlen($raw) > MAX_BODY_BYTES) {
        return response(413, ['ok' => false, 'error' => 'too_large']);
    }
    $data = json_decode($raw, true, MAX_JSON_DEPTH);
    if (!is_array($data)) {
        return response(400, ['ok' => false, 'error' => 'json']);
    }
    if (is_spam($data)) {
        return response(200, ['ok' => true]); // bots get no hint
    }
    $result = validate_payload($data);
    if ($result['errors'] !== []) {
        return response(400, ['ok' => false, 'error' => 'validation', 'fields' => $result['errors']]);
    }
    return ['status' => 200, 'body' => ['ok' => true], 'send' => $result['data']];
}

// ---------------------------------------------------------------------------
// Message
// ---------------------------------------------------------------------------

function build_body(array $fields): string
{
    $lines = [
        'Nom / Name : ' . $fields['name'],
        'Email      : ' . $fields['email'],
        'Téléphone  : ' . $fields['phone'],
        'Intérêt    : ' . $fields['interest'],
    ];
    $localeLine = $fields['locale'] !== '' ? ['Langue     : ' . $fields['locale']] : [];
    return implode("\n", array_merge($lines, $localeLine)) . "\n\n" . $fields['message'];
}

function build_message(array $cfg, array $fields): string
{
    $replyTo = is_valid_email($fields['email']) ? ['Reply-To: <' . $fields['email'] . '>'] : [];
    $headers = array_merge([
        'Date: ' . date('r'),
        'From: ' . encode_header(SITE_NAME) . ' <' . $cfg['from'] . '>',
        'To: <' . $cfg['to'] . '>',
    ], $replyTo, [
        'Subject: ' . encode_header('Contact ' . SITE_NAME . ' — ' . sanitize_header($fields['name'])),
        'Message-ID: <' . bin2hex(random_bytes(16)) . '@bullesenvalais.ch>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
    ]);
    return implode("\r\n", $headers) . "\r\n\r\n" . encode_body(build_body($fields));
}

// ---------------------------------------------------------------------------
// SMTP client
// ---------------------------------------------------------------------------

/** @param resource $sock */
function smtp_read($sock): string
{
    $reply = '';
    for ($i = 0; $i < SMTP_MAX_REPLY_LINES; $i++) {
        $line = fgets($sock, 1024);
        if ($line === false) {
            break;
        }
        $reply .= $line;
        if (strlen($line) < 4 || $line[3] !== '-') {
            break;
        }
    }
    return $reply;
}

/** @param resource $sock */
function smtp_write($sock, string $data): bool
{
    $written = 0;
    $total = strlen($data);
    while ($written < $total) {
        $count = fwrite($sock, substr($data, $written));
        if ($count === false || $count === 0) {
            return false;
        }
        $written += $count;
    }
    return true;
}

/**
 * Sends one command (or none, to read a greeting) and checks the reply code.
 * Errors carry the stage and the reply code only: no personal data in logs.
 *
 * @param resource $sock
 */
function smtp_step($sock, ?string $command, string $expect, string $stage): ?string
{
    if ($command !== null && !smtp_write($sock, $command . "\r\n")) {
        return $stage . ' (write)';
    }
    $reply = smtp_read($sock);
    if (strncmp($reply, $expect, 3) === 0) {
        return null;
    }
    return $stage . ' (' . (preg_match('/^\d{3}/', $reply, $m) === 1 ? $m[0] : 'no reply') . ')';
}

/** @param resource $sock */
function smtp_run($sock, array $steps): ?string
{
    foreach ($steps as [$command, $expect, $stage]) {
        $error = smtp_step($sock, $command, $expect, $stage);
        if ($error !== null) {
            return $error;
        }
    }
    return null;
}

/** @param resource $sock */
function smtp_starttls($sock): ?string
{
    $error = smtp_step($sock, 'STARTTLS', '220', 'starttls');
    if ($error !== null) {
        return $error;
    }
    // Bytes already buffered arrived in clear text: once TLS is up they would
    // be read as trusted replies (response injection, RFC 3207 section 4.2).
    if (stream_get_meta_data($sock)['unread_bytes'] > 0) {
        return 'starttls (unexpected data)';
    }
    if (stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT) !== true) {
        return 'tls (handshake)';
    }
    return smtp_step($sock, 'EHLO ' . SMTP_HELO, '250', 'ehlo');
}

/** @param resource $sock */
function smtp_send_data($sock, string $message): ?string
{
    $stuffed = dot_stuff($message);
    $payload = substr($stuffed, -2) === "\r\n" ? $stuffed : $stuffed . "\r\n";
    if (!smtp_write($sock, $payload . ".\r\n")) {
        return 'message (write)';
    }
    return smtp_step($sock, null, '250', 'message');
}

/**
 * One SMTP transaction: envelope addresses come from the configuration only.
 *
 * @param resource $sock
 */
function smtp_dialogue($sock, array $cfg, string $message): ?string
{
    $error = smtp_run($sock, [[null, '220', 'greeting'], ['EHLO ' . SMTP_HELO, '250', 'ehlo']]);
    if ($error === null && ($cfg['starttls'] ?? true)) {
        $error = smtp_starttls($sock);
    }
    if ($error === null) {
        $error = smtp_run($sock, [
            ['AUTH LOGIN', '334', 'auth'],
            [base64_encode($cfg['user']), '334', 'auth'],
            [base64_encode($cfg['pass']), '235', 'auth'],
            ['MAIL FROM:<' . $cfg['from'] . '>', '250', 'mail'],
            ['RCPT TO:<' . $cfg['to'] . '>', '250', 'rcpt'],
            ['DATA', '354', 'data'],
        ]);
    }
    return $error ?? smtp_send_data($sock, $message);
}

function smtp_send(array $cfg, string $message): ?string
{
    $errno = 0;
    $errstr = '';
    $sock = @fsockopen($cfg['host'], $cfg['port'], $errno, $errstr, SMTP_TIMEOUT_S);
    if ($sock === false) {
        return 'connect (' . $errno . ')';
    }
    stream_set_timeout($sock, SMTP_TIMEOUT_S);
    try {
        return smtp_dialogue($sock, $cfg, $message);
    } finally {
        @fwrite($sock, "QUIT\r\n");
        fclose($sock);
    }
}

// ---------------------------------------------------------------------------
// Configuration and HTTP entry point
// ---------------------------------------------------------------------------

function mail_config_path(): string
{
    // CONTACT_CONFIG_PATH is only defined by tests/php/router.php.
    return defined('CONTACT_CONFIG_PATH') ? (string) constant('CONTACT_CONFIG_PATH') : __DIR__ . '/mail-config.php';
}

/** Normalized configuration, or null when a key is missing or invalid. */
function load_mail_config(string $path): ?array
{
    $raw = is_file($path) ? require $path : null;
    if (!is_array($raw)) {
        return null;
    }
    foreach (['host', 'user', 'pass', 'from', 'to'] as $key) {
        if (!isset($raw[$key]) || !is_scalar($raw[$key]) || (string) $raw[$key] === '') {
            return null;
        }
    }
    $port = (int) ($raw['port'] ?? 0);
    $cfg = [
        'host' => (string) $raw['host'],
        'port' => $port,
        'user' => (string) $raw['user'],
        'pass' => (string) $raw['pass'],
        'from' => (string) $raw['from'],
        'to' => (string) $raw['to'],
        'starttls' => (bool) ($raw['starttls'] ?? true),
    ];
    $valid = $port > 0 && $port <= 65535 && is_valid_email($cfg['from']) && is_valid_email($cfg['to']);
    return $valid ? $cfg : null;
}

function deliver(array $fields): array
{
    $cfg = load_mail_config(mail_config_path());
    if ($cfg === null) {
        error_log('contact: mail configuration missing or invalid');
        return response(500, ['ok' => false, 'error' => 'delivery']);
    }
    $error = smtp_send($cfg, build_message($cfg, $fields));
    if ($error !== null) {
        error_log('contact: delivery failed at ' . $error);
        return response(500, ['ok' => false, 'error' => 'delivery']);
    }
    return response(200, ['ok' => true]);
}

function respond(int $status, ?array $body): void
{
    http_response_code($status);
    header('Cache-Control: no-store');
    if ($status === 405) {
        header('Allow: POST, OPTIONS');
    }
    if ($body !== null) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($body);
    }
}

function handle_request(): void
{
    $raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
    $result = evaluate_request(
        (string) ($_SERVER['REQUEST_METHOD'] ?? ''),
        (string) ($_SERVER['CONTENT_TYPE'] ?? ''),
        (string) ($_SERVER['HTTP_ORIGIN'] ?? ''),
        $raw === false ? '' : $raw
    );
    $final = $result['send'] !== null ? deliver($result['send']) : $result;
    respond($final['status'], $final['body']);
}

if (!defined('CONTACT_NO_AUTORUN')) {
    handle_request();
}

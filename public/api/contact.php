<?php
declare(strict_types=1);

// Contact form relay: validates the JSON request, then sends one plain-text
// e-mail through an authenticated SMTP session (STARTTLS + AUTH LOGIN).
// Must stay compatible with PHP 7.4 (the version PHP-FPM runs in production).
// Credentials live in mail-config.php, on the server only (never committed), in the shared
// folder that every release reads (plans/refonte-la-descente/02-architecture.md §16).

// Outside the docroot and kept across releases: 750 root:www-data, state/ 700 www-data.
const SHARED_DIR = '/var/www/bullesenvalais/shared';
const MAIL_CONFIG_FILE = SHARED_DIR . '/mail-config.php';

const ALLOWED_ORIGINS = [
    'https://dive.bullesenvalais.ch',
    'https://bullesenvalais.ch',
    'https://www.bullesenvalais.ch',
    // other names served by the same nginx block
    'https://dive.bullesenvalais.com',
    'https://dive.bulleenvalais.ch',
    'https://dive.bulleenvalais.com',
];
const ALLOWED_INTERESTS = [
    'baptism', 'sdi-owd', 'sdi-aowd', 'sdi-rescue', 'tdi', 'padi-owd', 'padi-aowd',
    'padi-rescue', 'padi-dm', 'ffessm', 'specialty', 'refresher', 'gift', 'other',
];
const ALLOWED_LOCALES = ['fr', 'en', 'de'];

const MAX_BODY_BYTES = 32768;
const MAX_JSON_DEPTH = 4;
const MAX_NAME_CHARS = 100;
const MAX_EMAIL_CHARS = 254;
const MAX_MESSAGE_CHARS = 5000;
const MAX_PHONE_CHARS = 40;
const MIN_ELAPSED_MS = 3000;
// Daily cap of e-mails (Gmail quota): a robot with rotating addresses gets past the nginx
// limit per address. The counter holds no personal data.
const DAILY_LIMIT = 50;
const QUOTA_FILE = SHARED_DIR . '/state/contact-quota';
// Unquoted local part only: FILTER_VALIDATE_EMAIL alone accepts quoted parts
// that smuggle LF or NUL into headers.
const EMAIL_PATTERN = '/^[A-Za-z0-9.!#$%&\'*+\/=?^_`{|}~-]+@[A-Za-z0-9.-]+$/D';
const LOOPBACK_HOSTS = ['127.0.0.1', '::1', 'localhost'];

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

/** 'honeypot' or 'too_fast' when the submission must be dropped, null otherwise. */
function spam_reason(array $data): ?string
{
    $website = $data['website'] ?? '';
    if (!is_string($website) || trim($website) !== '') {
        return 'honeypot';
    }
    $elapsed = $data['elapsed'] ?? null; // every client sends it since S10
    return is_numeric($elapsed) && (float) $elapsed >= MIN_ELAPSED_MS ? null : 'too_fast';
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
        && strpos($email, '=?') === false // no RFC 2047 encoded-word lookalike
        && filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Free text (notes such as "(soir)" are fine): it only reaches the base64 body.
function is_valid_phone(?string $phone): bool
{
    return $phone !== null
        && is_valid_utf8($phone)
        && preg_match('/[\x00-\x1F\x7F]/', $phone) === 0
        && char_length($phone) <= MAX_PHONE_CHARS;
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

/**
 * Outcome of a request: 'send' carries the validated fields to deliver,
 * 'dropped' the reason why a spam submission was silently ignored.
 */
function result(int $status, ?array $body, ?array $send = null, ?string $dropped = null): array
{
    return ['status' => $status, 'body' => $body, 'send' => $send, 'dropped' => $dropped];
}

// Checks run in a fixed order.
function evaluate_request(string $method, string $contentType, string $origin, string $raw): array
{
    if ($method === 'OPTIONS') {
        return result(204, null);
    }
    if ($method !== 'POST') {
        return result(405, ['ok' => false, 'error' => 'method']);
    }
    if (!is_json_content_type($contentType) || !origin_allowed($origin)) {
        return result(403, ['ok' => false, 'error' => 'forbidden']);
    }
    if (strlen($raw) > MAX_BODY_BYTES) {
        return result(413, ['ok' => false, 'error' => 'too_large']);
    }
    $data = json_decode($raw, true, MAX_JSON_DEPTH);
    if (!is_array($data)) {
        return result(400, ['ok' => false, 'error' => 'json']);
    }
    $spam = spam_reason($data);
    if ($spam !== null) {
        return result(200, ['ok' => true], null, $spam); // bots get no hint
    }
    $validation = validate_payload($data);
    if ($validation['errors'] !== []) {
        return result(400, ['ok' => false, 'error' => 'validation', 'fields' => $validation['errors']]);
    }
    return result(200, ['ok' => true], $validation['data']);
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
 * Code of a complete reply whose lines all carry the same code; null for an
 * empty, malformed or truncated reply.
 */
function smtp_reply_code(string $reply): ?string
{
    $lines = (array) preg_split('/\r?\n/', rtrim($reply, "\r\n"));
    $code = (string) substr((string) $lines[0], 0, 3);
    if (preg_match('/^\d{3}$/', $code) !== 1) {
        return null;
    }
    $last = count($lines) - 1;
    foreach ($lines as $index => $line) {
        $separator = (string) substr((string) $line, 3, 1);
        $allowed = $index === $last ? [' ', ''] : ['-'];
        if (strncmp((string) $line, $code, 3) !== 0 || !in_array($separator, $allowed, true)) {
            return null;
        }
    }
    return $code;
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
    $code = smtp_reply_code($reply);
    if ($code === $expect) {
        return null;
    }
    return $stage . ' (' . ($code ?? ($reply === '' ? 'no reply' : 'bad reply')) . ')';
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
        return 'connect (' . $errno . ' ' . sanitize_header($errstr) . ')';
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
    return defined('CONTACT_CONFIG_PATH') ? (string) constant('CONTACT_CONFIG_PATH') : MAIL_CONFIG_FILE;
}

/**
 * Normalized configuration, or null when a key is missing or invalid.
 * STARTTLS can only be turned off towards a loopback host (tests).
 *
 * @param mixed $raw
 */
function normalize_mail_config($raw): ?array
{
    if (!is_array($raw)) {
        return null;
    }
    foreach (['host', 'port', 'user', 'pass', 'from', 'to'] as $key) {
        if (!isset($raw[$key]) || !is_scalar($raw[$key]) || (string) $raw[$key] === '') {
            return null;
        }
    }
    $cfg = [
        'host' => (string) $raw['host'],
        'port' => (int) $raw['port'],
        'user' => (string) $raw['user'],
        'pass' => (string) $raw['pass'],
        'from' => (string) $raw['from'],
        'to' => (string) $raw['to'],
        'starttls' => (bool) ($raw['starttls'] ?? true),
    ];
    $valid = $cfg['port'] > 0 && $cfg['port'] <= 65535
        && is_valid_email($cfg['from']) && is_valid_email($cfg['to'])
        && ($cfg['starttls'] || in_array($cfg['host'], LOOPBACK_HOSTS, true));
    return $valid ? $cfg : null;
}

function load_mail_config(string $path): ?array
{
    return normalize_mail_config(is_file($path) ? require $path : null);
}

// ---------------------------------------------------------------------------
// Daily limit
// ---------------------------------------------------------------------------

/** Outside the docroot; CONTACT_QUOTA_PATH is only defined by tests/php/router.php. */
function quota_path(): string
{
    return defined('CONTACT_QUOTA_PATH') ? (string) constant('CONTACT_QUOTA_PATH') : QUOTA_FILE;
}

/** E-mails already counted today, from a counter "YYYY-MM-DD count" (0 if it is another day or unreadable). */
function parse_quota(string $raw, string $today): int
{
    if (preg_match('/^(\d{4}-\d{2}-\d{2}) (\d{1,9})\s*$/D', $raw, $match) !== 1) {
        return 0;
    }
    return $match[1] === $today ? (int) $match[2] : 0;
}

/**
 * Counts one more e-mail for today, under an exclusive lock: true when it may be sent, false when
 * the limit is reached (not counted), null when the counter cannot be used (never a symbolic link).
 */
function take_daily_quota(string $path, string $today, int $limit): ?bool
{
    if (is_link($path)) {
        return null;
    }
    $handle = @fopen($path, 'c+'); // a failure is logged by the caller
    if ($handle === false) {
        return null;
    }
    try {
        // A shared temporary directory: only a plain file of our own making, never a hard link.
        $stat = fstat($handle);
        if ($stat === false || ($stat['mode'] & 0170000) !== 0100000 || $stat['nlink'] !== 1) {
            return null;
        }
        if (!flock($handle, LOCK_EX)) {
            return null;
        }
        $count = parse_quota((string) stream_get_contents($handle), $today);
        if ($count >= $limit) {
            return false;
        }
        $written = rewind($handle) && ftruncate($handle, 0)
            && fwrite($handle, $today . ' ' . ($count + 1)) !== false && fflush($handle);
        return $written ? true : null;
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

/** Sends within the daily limit; a counter that cannot be used never loses a real message. */
function deliver_within_quota(array $fields, string $quotaPath, string $today): array
{
    $allowed = take_daily_quota($quotaPath, $today, DAILY_LIMIT);
    if ($allowed === false) {
        error_log('contact: daily limit reached');
        return result(503, ['ok' => false, 'error' => 'busy']);
    }
    if ($allowed === null) {
        error_log('contact: daily counter unavailable, sent anyway');
    }
    return deliver($fields);
}

function deliver(array $fields): array
{
    $path = mail_config_path();
    $cfg = load_mail_config($path);
    if ($cfg === null) {
        error_log(is_file($path) ? 'contact: mail configuration invalid' : 'contact: mail configuration missing at ' . $path);
        return result(500, ['ok' => false, 'error' => 'delivery']);
    }
    $error = smtp_send($cfg, build_message($cfg, $fields));
    if ($error !== null) {
        error_log('contact: delivery failed at ' . $error);
        return result(500, ['ok' => false, 'error' => 'delivery']);
    }
    return result(200, ['ok' => true]);
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
    $outcome = evaluate_request(
        (string) ($_SERVER['REQUEST_METHOD'] ?? ''),
        (string) ($_SERVER['CONTENT_TYPE'] ?? ''),
        (string) ($_SERVER['HTTP_ORIGIN'] ?? ''),
        $raw === false ? '' : $raw
    );
    if ($outcome['dropped'] !== null) {
        error_log('contact: dropped (' . $outcome['dropped'] . ')'); // reason only, to spot false positives
    }
    $final = $outcome['send'] !== null
        ? deliver_within_quota($outcome['send'], quota_path(), date('Y-m-d'))
        : $outcome;
    respond($final['status'], $final['body']);
}

if (!defined('CONTACT_NO_AUTORUN')) {
    handle_request();
}

<?php
declare(strict_types=1);

// Unit tests for public/api/contact.php — dependency-free, runs on PHP 7.4+.
// Usage: php tests/php/contact_test.php  (exit code 1 on failure)

if (PHP_SAPI !== 'cli') {
    exit; // never through a web server
}

$GLOBALS['results'] = ['pass' => 0, 'fail' => 0, 'done' => false];

register_shutdown_function(static function (): void {
    if (!$GLOBALS['results']['done']) {
        fwrite(STDERR, "\nFAIL: test run aborted before completion\n");
        exit(1);
    }
});

define('CONTACT_CONFIG_PATH', __DIR__ . '/no-such-config.php'); // never the real mail-config.php
define('CONTACT_NO_AUTORUN', true);
require __DIR__ . '/../../public/api/contact.php';

function check(string $label, bool $condition): void
{
    $key = $condition ? 'pass' : 'fail';
    $GLOBALS['results'][$key]++;
    echo ($condition ? '  ok   ' : '  FAIL ') . $label . "\n";
}

function section(string $title): void
{
    echo "\n" . $title . "\n";
}

function valid_payload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Élodie Martin',
        'email' => 'elodie@example.com',
        'phone' => '+41 79 000 00 00',
        'interest' => 'sdi-owd',
        'message' => "Bonjour,\nje voudrais plonger.",
        'website' => '',
        'elapsed' => 12000,
    ], $overrides);
}

function lines_of(string $text): array
{
    return explode("\r\n", $text);
}

function decode_encoded_words(string $header): string
{
    $words = preg_split('/\r\n /', $header);
    $decoded = '';
    foreach ($words as $word) {
        if (preg_match('/^=\?UTF-8\?B\?([A-Za-z0-9+\/=]+)\?=$/', $word, $m) !== 1) {
            return "\0invalid-word\0";
        }
        $decoded .= base64_decode($m[1], true);
    }
    return $decoded;
}

// ---------------------------------------------------------------------------
section('normalize_newlines');
check('LF, CRLF and CR all become CRLF', normalize_newlines("a\nb\r\nc\rd") === "a\r\nb\r\nc\r\nd");
check('text without newline is unchanged', normalize_newlines('abc') === 'abc');

// ---------------------------------------------------------------------------
section('sanitize_header');
$sanitized = sanitize_header("Bob\r\nBcc: x@y.z");
check('removes CR and LF', strpos($sanitized, "\r") === false && strpos($sanitized, "\n") === false);
check('removes every control character', preg_match('/[\x00-\x1F\x7F]/', sanitize_header("a\x00b\tc\x1Fd\x7Fe")) === 0);
check('keeps printable UTF-8 text', sanitize_header('Élodie Martin') === 'Élodie Martin');

// ---------------------------------------------------------------------------
section('encode_header');
foreach (['Contact — Élodie', str_repeat('Àé€ 😀 ', 30), 'ascii only'] as $index => $input) {
    $encoded = encode_header($input);
    $label = 'input #' . ($index + 1);
    check("[{$label}] only =?UTF-8?B?…?= words", decode_encoded_words($encoded) !== "\0invalid-word\0");
    check("[{$label}] decodes to the original", decode_encoded_words($encoded) === $input);
    check("[{$label}] no line longer than 76 chars", max(array_map('strlen', lines_of($encoded))) <= 76);
    check("[{$label}] every continuation line starts with a space", count(array_filter(
        array_slice(lines_of($encoded), 1),
        static function (string $line): bool {
            return $line === '' || $line[0] !== ' ';
        }
    )) === 0);
}
check('empty string stays empty', encode_header('') === '');
check('first line fits after "Subject: "', strlen('Subject: ' . lines_of(encode_header(str_repeat('é', 80)))[0]) <= 76);

// ---------------------------------------------------------------------------
section('encode_body');
$bodyInput = "l1\r\n.\r\nMAIL FROM:<x@y.z>";
$encodedBody = encode_body($bodyInput);
check('only base64 characters and CRLF', preg_match('/^[A-Za-z0-9+\/=\r\n]*$/', $encodedBody) === 1);
check('no line equal to "."', !in_array('.', lines_of($encodedBody), true));
check('decodes to the original', base64_decode(str_replace("\r\n", '', $encodedBody), true) === $bodyInput);
check('lines are at most 76 chars', max(array_map('strlen', lines_of($encodedBody))) <= 76);
check('ends with CRLF', substr($encodedBody, -2) === "\r\n");
check('bare LF is normalized before encoding', base64_decode(str_replace("\r\n", '', encode_body("a\nb")), true) === "a\r\nb");

// ---------------------------------------------------------------------------
section('validate_payload');
$ok = validate_payload(valid_payload());
check('valid payload has no error', $ok['errors'] === []);
check('valid payload keeps the name', $ok['data']['name'] === 'Élodie Martin');
check('valid payload keeps the interest', $ok['data']['interest'] === 'sdi-owd');

$fieldErrors = static function (array $overrides): array {
    return validate_payload(valid_payload($overrides))['errors'];
};
$missingName = valid_payload();
unset($missingName['name']);
check('missing name → error', in_array('name', validate_payload($missingName)['errors'], true));
check('blank name → error', in_array('name', $fieldErrors(['name' => '   ']), true));
check('name of 101 chars → error', in_array('name', $fieldErrors(['name' => str_repeat('é', 101)]), true));
check('name of 100 multibyte chars → ok', $fieldErrors(['name' => str_repeat('é', 100)]) === []);
check('non-string name → error', in_array('name', $fieldErrors(['name' => ['x']]), true));
check('invalid email → error', in_array('email', $fieldErrors(['email' => 'not-an-email']), true));
$longEmail = str_repeat('a', 64) . '@' . implode('.', array_fill(0, 4, str_repeat('b', 46))) . '.com';
check('email over 254 chars → error', strlen($longEmail) === 256 && in_array('email', $fieldErrors(['email' => $longEmail]), true));
check('quoted local part with LF → error', in_array('email', $fieldErrors(['email' => "\"a\\\nb\"@example.com"]), true));
check('quoted local part with NUL → error', in_array('email', $fieldErrors(['email' => "\"a\\\x00b\"@example.com"]), true));
check('quoted local part with <> → error', in_array('email', $fieldErrors(['email' => '"a<b>c"@example.com']), true));
check('encoded-word lookalike in e-mail → error', in_array('email', $fieldErrors(['email' => '=?utf-8?q?v=40x.y=3e?=@example.com']), true));
check('phone of 41 chars → error', in_array('phone', $fieldErrors(['phone' => str_repeat('1', 41)]), true));
check('phone with a line feed → error', in_array('phone', $fieldErrors(['phone' => "079\n123 45 67"]), true));
check('empty phone → ok', $fieldErrors(['phone' => '']) === []);
check('phone with ( ) . - → ok', $fieldErrors(['phone' => '+41 (79) 436.81-12']) === []);
check('Swiss phone with a slash → ok', $fieldErrors(['phone' => '079/436 81 12']) === []);
check('phone with a note → ok', $fieldErrors(['phone' => '079 123 45 67 (soir)']) === []);
check('phone with a no-break space → ok', $fieldErrors(['phone' => "079\u{00A0}123 45 67"]) === []);
check('phone of 40 multibyte chars → ok', $fieldErrors(['phone' => str_repeat('é', 40)]) === []);
check('message over 5000 chars → error', in_array('message', $fieldErrors(['message' => str_repeat('é', 5001)]), true));
check('message of 5000 chars → ok', $fieldErrors(['message' => str_repeat('é', 5000)]) === []);
check('invalid UTF-8 message → error', in_array('message', $fieldErrors(['message' => "abc\xC3\x28"]), true));
check('gift voucher interest is kept', validate_payload(valid_payload(['interest' => 'gift']))['data']['interest'] === 'gift');
check('unknown interest → other', validate_payload(valid_payload(['interest' => 'hack\r\n']))['data']['interest'] === 'other');
check('non-string interest → other', validate_payload(valid_payload(['interest' => 42]))['data']['interest'] === 'other');
check('known locale is kept', validate_payload(valid_payload(['locale' => 'en']))['data']['locale'] === 'en');
check('unknown locale is dropped', validate_payload(valid_payload(['locale' => 'xx']))['data']['locale'] === '');

// ---------------------------------------------------------------------------
section('spam_reason');
check('honeypot filled → honeypot', spam_reason(valid_payload(['website' => 'http://spam.example'])) === 'honeypot');
check('non-string honeypot → honeypot', spam_reason(valid_payload(['website' => ['x']])) === 'honeypot');
check('elapsed < 3000 → too_fast', spam_reason(valid_payload(['elapsed' => 2999])) === 'too_fast');
check('non-numeric elapsed → too_fast', spam_reason(valid_payload(['elapsed' => 'soon'])) === 'too_fast');
check('negative elapsed → too_fast', spam_reason(valid_payload(['elapsed' => -5])) === 'too_fast');
check('missing elapsed → too_fast (every client sends it since S10)', spam_reason(array_diff_key(valid_payload(), ['elapsed' => 0])) === 'too_fast');
check('normal submission → accepted', spam_reason(valid_payload()) === null);
check('elapsed exactly 3000 → accepted', spam_reason(valid_payload(['elapsed' => 3000])) === null);

// ---------------------------------------------------------------------------
section('origin_allowed');
$allowedOrigins = [
    'https://dive.bullesenvalais.ch', 'https://bullesenvalais.ch', 'https://www.bullesenvalais.ch',
    'https://dive.bullesenvalais.com', 'https://dive.bulleenvalais.ch', 'https://dive.bulleenvalais.com',
];
foreach ($allowedOrigins as $origin) {
    check("{$origin} → allowed", origin_allowed($origin) === true);
}
foreach (['', 'null', 'http://dive.bullesenvalais.ch', 'https://dive.bullesenvalais.ch.evil.com', 'https://evil.com'] as $origin) {
    check("'{$origin}' → refused", origin_allowed($origin) === false);
}

// ---------------------------------------------------------------------------
section('evaluate_request');
$json = json_encode(valid_payload());
$site = 'https://dive.bullesenvalais.ch';
$statusOf = static function (string $method, string $type, string $origin, string $raw): int {
    return evaluate_request($method, $type, $origin, $raw)['status'];
};
check('OPTIONS → 204', $statusOf('OPTIONS', '', '', '') === 204);
check('GET → 405', $statusOf('GET', '', $site, '') === 405);
check('text/plain → 403', $statusOf('POST', 'text/plain', $site, $json) === 403);
check('form-urlencoded → 403', $statusOf('POST', 'application/x-www-form-urlencoded', $site, $json) === 403);
check('application/json; charset=utf-8 accepted', $statusOf('POST', 'application/json; charset=utf-8', $site, $json) === 200);
check('missing Origin → 403', $statusOf('POST', 'application/json', '', $json) === 403);
check('foreign Origin → 403', $statusOf('POST', 'application/json', 'https://evil.com', $json) === 403);
check('body over 32 KB → 413', $statusOf('POST', 'application/json', $site, str_repeat('a', 32 * 1024 + 1)) === 413);
check('invalid JSON → 400', $statusOf('POST', 'application/json', $site, '{"name":') === 400);
check('JSON scalar → 400', $statusOf('POST', 'application/json', $site, '"hello"') === 400);
$spam = evaluate_request('POST', 'application/json', $site, json_encode(valid_payload(['website' => 'x'])));
check('spam → 200 ok without sending, with its reason', $spam['status'] === 200 && $spam['send'] === null && $spam['dropped'] === 'honeypot');
$invalid = evaluate_request('POST', 'application/json', $site, json_encode(valid_payload(['email' => 'nope'])));
check('validation error → 400 with fields', $invalid['status'] === 400 && $invalid['body']['fields'] === ['email']);
$accepted = evaluate_request('POST', 'application/json', $site, $json);
check('valid request → data to send', $accepted['send'] !== null && $accepted['send']['email'] === 'elodie@example.com' && $accepted['dropped'] === null);
$noElapsed = evaluate_request('POST', 'application/json', $site, json_encode(array_diff_key(valid_payload(), ['elapsed' => 0])));
check('request without elapsed → 200 ok without sending (too_fast)', $noElapsed['status'] === 200 && $noElapsed['send'] === null && $noElapsed['dropped'] === 'too_fast');

// ---------------------------------------------------------------------------
section('daily limit');
check('the limit is 50 e-mails a day', DAILY_LIMIT === 50);
check('quota of today is read', parse_quota('2026-10-02 12', '2026-10-02') === 12);
check('quota of another day starts again at 0', parse_quota('2026-10-01 50', '2026-10-02') === 0);
check('empty counter → 0', parse_quota('', '2026-10-02') === 0);
check('malformed counter → 0', parse_quota("2026-10-02 lots\n", '2026-10-02') === 0);
check('counter with a trailing newline is read', parse_quota("2026-10-02 7\n", '2026-10-02') === 7);
$previousLog = ini_set('error_log', '/dev/null');
check('counter in a missing directory → unknown (null)', @take_daily_quota(sys_get_temp_dir() . '/no-such-dir/quota', '2026-10-02', 2) === null);
$unknown = deliver_within_quota(validate_payload(valid_payload())['data'], sys_get_temp_dir() . '/no-such-dir/quota', '2026-10-02');
check('counter unavailable → sent anyway (here 500: no configuration in the tests)', $unknown['status'] === 500 && $unknown['body']['error'] === 'delivery');
// These write a counter in the temporary directory: skipped on the Pi (run_unit_php74.sh).
if (!defined('CONTACT_TEST_NO_FILES')) {
    $quotaFile = (string) tempnam(sys_get_temp_dir(), 'bev-quota-');
    check('first e-mail of the day → allowed', take_daily_quota($quotaFile, '2026-10-02', 2) === true);
    check('the counter holds the day and the count', file_get_contents($quotaFile) === '2026-10-02 1');
    check('second e-mail → allowed', take_daily_quota($quotaFile, '2026-10-02', 2) === true);
    check('past the limit → refused', take_daily_quota($quotaFile, '2026-10-02', 2) === false);
    check('a refused e-mail is not counted', file_get_contents($quotaFile) === '2026-10-02 2');
    check('next day → allowed again', take_daily_quota($quotaFile, '2026-10-03', 2) === true && file_get_contents($quotaFile) === '2026-10-03 1');
    $quotaLink = $quotaFile . '-link';
    @symlink($quotaFile, $quotaLink);
    check('counter behind a symbolic link → unknown (null), never followed', take_daily_quota($quotaLink, '2026-10-02', 2) === null);
    @unlink($quotaLink);
    file_put_contents($quotaFile, '2026-10-02 50');
    $busy = deliver_within_quota(validate_payload(valid_payload())['data'], $quotaFile, '2026-10-02');
    check('limit reached → 503 busy, nothing sent', $busy['status'] === 503 && $busy['body'] === ['ok' => false, 'error' => 'busy']);
    file_put_contents($quotaFile, '2026-10-02 3');
    $counted = deliver_within_quota(validate_payload(valid_payload())['data'], $quotaFile, '2026-10-02');
    check('under the limit → counted and sent', $counted['status'] === 500 && file_get_contents($quotaFile) === '2026-10-02 4');
    @unlink($quotaFile);
}
ini_set('error_log', (string) $previousLog);
check('quota_path is outside the docroot (temporary directory by default)', strpos(quota_path(), sys_get_temp_dir()) === 0);

// ---------------------------------------------------------------------------
section('build_message');
$cfg = ['host' => 'localhost', 'port' => 25, 'user' => 'u', 'pass' => 'p', 'from' => 'site@example.test', 'to' => 'owner@example.test'];
$fields = validate_payload(valid_payload(['name' => "Bob\r\nBcc: victim@example.com", 'message' => "l1\r\n.\r\nMAIL FROM:<a@b.c>"]))['data'];
$message = build_message($cfg, $fields);
[$head, $body] = explode("\r\n\r\n", $message, 2);
$headerNames = array_map(static function (string $line): string {
    return strtolower((string) strstr($line, ':', true));
}, array_filter(lines_of($head), static function (string $line): bool {
    return $line !== '' && $line[0] !== ' ';
}));
check('no Bcc header injected', !in_array('bcc', $headerNames, true));
check('exactly one To header', count(array_keys($headerNames, 'to', true)) === 1);
check('To is the configured recipient', strpos($head, "\r\nTo: <owner@example.test>\r\n") !== false);
check('Reply-To is the visitor email', strpos($head, "\r\nReply-To: <elodie@example.com>\r\n") !== false);
check('declares base64 transfer encoding', strpos($head, "Content-Transfer-Encoding: base64") !== false);
check('declares UTF-8 plain text', strpos($head, 'Content-Type: text/plain; charset=UTF-8') !== false);
check('only CRLF line endings', preg_match('/(?<!\r)\n|\r(?!\n)/', $message) === 0);
check('no line equal to "."', !in_array('.', lines_of($message), true));
check('ends with CRLF', substr($message, -2) === "\r\n");
preg_match('/^Subject: (.*?)\r\n(?! )/ms', $head . "\r\n", $subjectMatch);
check('subject decodes with the sanitized name', decode_encoded_words($subjectMatch[1] ?? '') === 'Contact Bulles en Valais — Bob Bcc: victim@example.com');
$decodedBody = base64_decode(str_replace("\r\n", '', $body), true);
check('body keeps the literal message', strpos((string) $decodedBody, "l1\r\n.\r\nMAIL FROM:<a@b.c>") !== false);
check('body lists the interest', strpos((string) $decodedBody, 'sdi-owd') !== false);
$noReply = build_message($cfg, array_merge($fields, ['email' => '']));
check('no Reply-To without a valid email', stripos($noReply, 'Reply-To:') === false);

// ---------------------------------------------------------------------------
section('smtp_reply_code');
check('single-line reply → its code', smtp_reply_code("250 ok\r\n") === '250');
check('bare code line → its code', smtp_reply_code("250\r\n") === '250');
check('multi-line reply with one code → that code', smtp_reply_code("250-a\r\n250-b\r\n250 c\r\n") === '250');
check('multi-line reply with mixed codes → invalid', smtp_reply_code("250-a\r\n554 no\r\n") === null);
check('truncated multi-line reply → invalid', smtp_reply_code("250-a\r\n250-b\r\n") === null);
check('code-only last line after continuations → its code', smtp_reply_code("250-a\r\n250\r\n") === '250');
check('LF-only line endings → accepted', smtp_reply_code("250-a\n250 b\n") === '250');
check('mismatch on a middle line → invalid', smtp_reply_code("250-a\r\n251-b\r\n250 c\r\n") === null);
check('four-digit code → invalid', smtp_reply_code("2500 x\r\n") === null);
check('code glued to text → invalid', smtp_reply_code("250x\r\n") === null);
check('garbage → invalid', smtp_reply_code("hello\r\n") === null);
check('empty reply → invalid', smtp_reply_code('') === null);

// ---------------------------------------------------------------------------
section('mail configuration');
$baseConfig = ['host' => 'smtp.example.test', 'port' => '587', 'user' => 'u', 'pass' => 'p', 'from' => 'site@example.test', 'to' => 'owner@example.test'];
$normalized = normalize_mail_config($baseConfig);
check('port is cast to int and STARTTLS defaults to on', $normalized !== null && $normalized['port'] === 587 && $normalized['starttls'] === true);
check('missing password → rejected', normalize_mail_config(array_diff_key($baseConfig, ['pass' => 0])) === null);
check('port out of range → rejected', normalize_mail_config(array_merge($baseConfig, ['port' => 70000])) === null);
check('invalid sender address → rejected', normalize_mail_config(array_merge($baseConfig, ['from' => 'not an address'])) === null);
check('STARTTLS off towards a remote host → rejected', normalize_mail_config(array_merge($baseConfig, ['starttls' => false])) === null);
$loopback = normalize_mail_config(array_merge($baseConfig, ['host' => '127.0.0.1', 'starttls' => false]));
check('STARTTLS off towards loopback (tests) → allowed', $loopback !== null && $loopback['starttls'] === false);
check('configuration that is not an array → rejected', normalize_mail_config('nope') === null);
check('missing configuration file → rejected', load_mail_config(__DIR__ . '/no-such-config.php') === null);

// ---------------------------------------------------------------------------
section('smtp_dialogue (in-memory socket pair)');
$pair = stream_socket_pair(STREAM_PF_UNIX, STREAM_SOCK_STREAM, STREAM_IPPROTO_IP);
[$client, $server] = $pair;
fwrite($server, implode("\r\n", [
    '220 fake ESMTP', '250-fake', '250-PIPELINING', '250 AUTH LOGIN', '334 VXNlcm5hbWU6', '334 UGFzc3dvcmQ6',
    '235 ok', '250 sender ok', '250 rcpt ok', '354 go ahead', '250 queued', '',
]));
$error = smtp_dialogue($client, array_merge($cfg, ['starttls' => false]), "Subject: t\r\n\r\nbody\r\n.\r\n");
stream_set_blocking($server, false);
$sent = (string) stream_get_contents($server);
fclose($client);
fclose($server);
check('dialogue succeeds', $error === null);
check('exactly one MAIL FROM', substr_count($sent, "MAIL FROM:") === 1);
check('exactly one RCPT TO, to the configured recipient', substr_count($sent, 'RCPT TO:') === 1 && strpos($sent, "RCPT TO:<owner@example.test>\r\n") !== false);
check('exactly one DATA command', substr_count($sent, "\r\nDATA\r\n") === 1);
check('data terminator sent exactly once', substr_count($sent, "\r\n.\r\n") === 1);
check('leading dots are stuffed', strpos($sent, "\r\n..\r\n") !== false);

$pair = stream_socket_pair(STREAM_PF_UNIX, STREAM_SOCK_STREAM, STREAM_IPPROTO_IP);
[$client, $server] = $pair;
fwrite($server, "220 fake\r\n250 fake\r\n334 x\r\n334 x\r\n535 bad credentials\r\n");
$error = smtp_dialogue($client, array_merge($cfg, ['starttls' => false]), "x\r\n");
fclose($client);
fclose($server);
check('authentication failure is reported with stage and code only', $error === 'auth (535)');

$pair = stream_socket_pair(STREAM_PF_UNIX, STREAM_SOCK_STREAM, STREAM_IPPROTO_IP);
[$client, $server] = $pair;
fwrite($server, "220 ready to start TLS\r\n250 injected before the handshake\r\n");
$error = smtp_starttls($client);
fclose($client);
fclose($server);
check('clear-text data buffered after STARTTLS aborts before the handshake', $error === 'starttls (unexpected data)');

$pair = stream_socket_pair(STREAM_PF_UNIX, STREAM_SOCK_STREAM, STREAM_IPPROTO_IP);
[$client, $server] = $pair;
fwrite($server, "220 fake\r\n250 fake\r\n454 TLS not available\r\n");
$error = smtp_dialogue($client, array_merge($cfg, ['starttls' => true]), "x\r\n");
stream_set_blocking($server, false);
$sent = (string) stream_get_contents($server);
fclose($client);
fclose($server);
check('STARTTLS refused → abort without AUTH in clear text', $error === 'starttls (454)' && strpos($sent, 'AUTH') === false);

$pair = stream_socket_pair(STREAM_PF_UNIX, STREAM_SOCK_STREAM, STREAM_IPPROTO_IP);
[$client, $server] = $pair;
fwrite($server, str_repeat("250-x\r\n", 60) . "250 end\r\n");
$error = smtp_step($client, null, '250', 'ehlo');
fclose($client);
fclose($server);
check('reply longer than the line cap → error', $error === 'ehlo (bad reply)');

$pair = stream_socket_pair(STREAM_PF_UNIX, STREAM_SOCK_STREAM, STREAM_IPPROTO_IP);
[$client, $server] = $pair;
fclose($server);
$error = smtp_step($client, null, '220', 'greeting');
fclose($client);
check('no reply at all (closed or timed out) → "no reply"', $error === 'greeting (no reply)');

// ---------------------------------------------------------------------------
section('entry points (no network, no file written)');
$previousErrorLog = ini_set('error_log', '/dev/null');
$probe = stream_socket_server('tcp://127.0.0.1:0');
$freePort = (int) substr((string) strrchr((string) stream_socket_get_name($probe, false), ':'), 1);
fclose($probe);
$connectError = (string) smtp_send(array_merge($cfg, ['host' => '127.0.0.1', 'port' => $freePort, 'starttls' => false]), "x\r\n");
check('smtp_send reports a refused connection', strpos($connectError, 'connect (') === 0);
check('mail_config_path uses CONTACT_CONFIG_PATH when defined', mail_config_path() === CONTACT_CONFIG_PATH);
$delivery = deliver(validate_payload(valid_payload())['data']);
check('deliver without a configuration → 500 delivery', $delivery['status'] === 500 && $delivery['body'] === ['ok' => false, 'error' => 'delivery']);
ob_start();
@respond(405, ['ok' => false, 'error' => 'method']); // @: CLI output already started, headers cannot be set
check('respond prints the JSON body', ob_get_clean() === '{"ok":false,"error":"method"}');
$_SERVER['REQUEST_METHOD'] = 'OPTIONS';
ob_start();
@handle_request();
check('handle_request answers OPTIONS without a body', ob_get_clean() === '');
$_SERVER['REQUEST_METHOD'] = 'GET';
ob_start();
@handle_request();
check('handle_request refuses GET', ob_get_clean() === '{"ok":false,"error":"method"}');
ini_set('error_log', (string) $previousErrorLog);

// ---------------------------------------------------------------------------
$GLOBALS['results']['done'] = true;
$pass = $GLOBALS['results']['pass'];
$fail = $GLOBALS['results']['fail'];
echo "\n{$pass} passed, {$fail} failed\n";
exit($fail === 0 ? 0 : 1);

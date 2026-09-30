<?php
declare(strict_types=1);

// Unit tests for api/contact.php — dependency-free, runs on PHP 7.4+.
// Usage: php tests/php/contact_test.php  (exit code 1 on failure)

$GLOBALS['results'] = ['pass' => 0, 'fail' => 0, 'done' => false];

register_shutdown_function(static function (): void {
    if (!$GLOBALS['results']['done']) {
        fwrite(STDERR, "\nFAIL: test run aborted before completion\n");
        exit(1);
    }
});

define('CONTACT_NO_AUTORUN', true);
require __DIR__ . '/../../api/contact.php';

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
check('phone with letters → error', in_array('phone', $fieldErrors(['phone' => '+41 79 abc']), true));
check('phone of 41 chars → error', in_array('phone', $fieldErrors(['phone' => str_repeat('1', 41)]), true));
check('empty phone → ok', $fieldErrors(['phone' => '']) === []);
check('phone with ( ) . - → ok', $fieldErrors(['phone' => '+41 (79) 436.81-12']) === []);
check('Swiss phone with a slash → ok', $fieldErrors(['phone' => '079/436 81 12']) === []);
check('message over 5000 chars → error', in_array('message', $fieldErrors(['message' => str_repeat('é', 5001)]), true));
check('message of 5000 chars → ok', $fieldErrors(['message' => str_repeat('é', 5000)]) === []);
check('invalid UTF-8 message → error', in_array('message', $fieldErrors(['message' => "abc\xC3\x28"]), true));
check('unknown interest → other', validate_payload(valid_payload(['interest' => 'hack\r\n']))['data']['interest'] === 'other');
check('non-string interest → other', validate_payload(valid_payload(['interest' => 42]))['data']['interest'] === 'other');
check('known locale is kept', validate_payload(valid_payload(['locale' => 'en']))['data']['locale'] === 'en');
check('unknown locale is dropped', validate_payload(valid_payload(['locale' => 'xx']))['data']['locale'] === '');

// ---------------------------------------------------------------------------
section('is_spam');
check('honeypot filled → spam', is_spam(valid_payload(['website' => 'http://spam.example'])) === true);
check('elapsed < 3000 → spam', is_spam(valid_payload(['elapsed' => 2999])) === true);
check('missing elapsed → spam', is_spam(array_diff_key(valid_payload(), ['elapsed' => 0])) === true);
check('non-numeric elapsed → spam', is_spam(valid_payload(['elapsed' => 'soon'])) === true);
check('normal submission → not spam', is_spam(valid_payload()) === false);
check('elapsed exactly 3000 → not spam', is_spam(valid_payload(['elapsed' => 3000])) === false);

// ---------------------------------------------------------------------------
section('origin_allowed');
foreach (['https://dive.bullesenvalais.ch', 'https://bullesenvalais.ch', 'https://www.bullesenvalais.ch'] as $origin) {
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
check('spam → 200 ok without sending', $spam['status'] === 200 && $spam['send'] === null);
$invalid = evaluate_request('POST', 'application/json', $site, json_encode(valid_payload(['email' => 'nope'])));
check('validation error → 400 with fields', $invalid['status'] === 400 && $invalid['body']['fields'] === ['email']);
$accepted = evaluate_request('POST', 'application/json', $site, $json);
check('valid request → data to send', $accepted['send'] !== null && $accepted['send']['email'] === 'elodie@example.com');

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

// ---------------------------------------------------------------------------
$GLOBALS['results']['done'] = true;
$pass = $GLOBALS['results']['pass'];
$fail = $GLOBALS['results']['fail'];
echo "\n{$pass} passed, {$fail} failed\n";
exit($fail === 0 ? 0 : 1);

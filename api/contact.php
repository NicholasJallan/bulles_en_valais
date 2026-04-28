<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

$name     = strip_tags(trim($data['name']     ?? ''));
$email    = filter_var(trim($data['email']    ?? ''), FILTER_VALIDATE_EMAIL);
$phone    = strip_tags(trim($data['phone']    ?? ''));
$interest = strip_tags(trim($data['interest'] ?? ''));
$message  = strip_tags(trim($data['message']  ?? ''));

if (!$name || !$email) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing name or email']);
    exit;
}

$cfg = require __DIR__ . '/mail-config.php';

$subject = "Contact Bulles en Valais — {$name}";
$body    = "Nom / Name : {$name}\n"
         . "Email      : {$email}\n"
         . "Téléphone  : {$phone}\n"
         . "Intérêt    : {$interest}\n"
         . "\n"
         . $message;

$err = smtp_send(
    $cfg['host'], $cfg['port'],
    $cfg['user'], $cfg['pass'],
    $cfg['from'], $cfg['to'],
    $subject, $body, $email
);

if ($err !== null) {
    error_log("contact smtp error: {$err}");
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Mail delivery failed']);
    exit;
}

echo json_encode(['ok' => true]);

// ---------------------------------------------------------------------------
// Minimal SMTP client — STARTTLS, AUTH LOGIN, no external dependencies
// ---------------------------------------------------------------------------
function smtp_send(
    string $host, int $port,
    string $user, string $pass,
    string $from, string $to,
    string $subject, string $body,
    string $replyTo = ''
): ?string {
    $sock = @fsockopen($host, $port, $errno, $errstr, 10);
    if (!$sock) return "connect: {$errstr} ({$errno})";

    stream_set_timeout($sock, 10);

    $read = function () use ($sock): string {
        $r = '';
        while ($line = fgets($sock, 512)) {
            $r .= $line;
            if ($line[3] === ' ') break; // last line of multi-line reply
        }
        return $r;
    };

    $cmd = function (string $c) use ($sock, $read): string {
        fwrite($sock, $c . "\r\n");
        return $read();
    };

    $ok = function (string $r, string $expect): ?string {
        return strncmp($r, $expect, strlen($expect)) === 0 ? null : "unexpected: {$r}";
    };

    // Greeting
    $r = $read();
    if ($e = $ok($r, '220')) return $e;

    // EHLO
    $r = $cmd("EHLO localhost");
    if ($e = $ok($r, '250')) return $e;

    // STARTTLS
    $r = $cmd("STARTTLS");
    if ($e = $ok($r, '220')) return $e;

    if (!stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
        fclose($sock);
        return "TLS handshake failed";
    }

    // Re-EHLO after TLS
    $r = $cmd("EHLO localhost");
    if ($e = $ok($r, '250')) return $e;

    // AUTH LOGIN
    $r = $cmd("AUTH LOGIN");
    if ($e = $ok($r, '334')) return $e;

    $r = $cmd(base64_encode($user));
    if ($e = $ok($r, '334')) return $e;

    $r = $cmd(base64_encode($pass));
    if ($e = $ok($r, '235')) return $e;

    // MAIL FROM / RCPT TO / DATA
    $r = $cmd("MAIL FROM:<{$from}>");
    if ($e = $ok($r, '250')) return $e;

    $r = $cmd("RCPT TO:<{$to}>");
    if ($e = $ok($r, '250')) return $e;

    $r = $cmd("DATA");
    if ($e = $ok($r, '354')) return $e;

    $date    = date('r');
    $replyHdr = $replyTo ? "Reply-To: {$replyTo}\r\n" : '';
    $msgId   = '<' . uniqid('', true) . '@bullesenvalais.ch>';
    $headers = "Date: {$date}\r\n"
             . "From: Bulles en Valais <{$from}>\r\n"
             . "To: {$to}\r\n"
             . $replyHdr
             . "Subject: {$subject}\r\n"
             . "Message-ID: {$msgId}\r\n"
             . "MIME-Version: 1.0\r\n"
             . "Content-Type: text/plain; charset=UTF-8\r\n"
             . "Content-Transfer-Encoding: 8bit\r\n";

    // Dot-stuffing
    $safeBody = preg_replace('/^\./', '..', $body);

    fwrite($sock, $headers . "\r\n" . $safeBody . "\r\n.\r\n");

    $r = $read();
    if ($e = $ok($r, '250')) return $e;

    $cmd("QUIT");
    fclose($sock);

    return null;
}

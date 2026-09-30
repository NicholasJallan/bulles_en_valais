<?php
// Mail configuration for the integration tests only: fake SMTP server on
// localhost, no TLS, dummy credentials. Loaded through tests/php/router.php.
return [
    'host' => '127.0.0.1',
    'port' => 2525,
    'user' => 'test-user',
    'pass' => 'test-pass',
    'from' => 'site@example.test',
    'to' => 'owner@example.test',
    'starttls' => false,
];

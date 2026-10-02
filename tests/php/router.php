<?php
declare(strict_types=1);

// Router for the PHP built-in server, integration tests only:
//   php -S 127.0.0.1:8099 tests/php/router.php
// The test configuration and counter paths are constants set here, never read
// from the request or the environment. This file must never be deployed.

if (PHP_SAPI !== 'cli-server' || parse_url((string) ($_SERVER['REQUEST_URI'] ?? ''), PHP_URL_PATH) !== '/api/contact') {
    http_response_code(404);
    return;
}

define('CONTACT_CONFIG_PATH', __DIR__ . '/test-config.php');
// The daily counter of the tests (run_integration.sh deletes it), never the server's own.
define('CONTACT_QUOTA_PATH', __DIR__ . '/.quota-integration');
require __DIR__ . '/../../public/api/contact.php';

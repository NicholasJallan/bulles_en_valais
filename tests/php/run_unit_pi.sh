#!/usr/bin/env bash
# Runs the unit tests with the production PHP (PHP-FPM 8.5 on the Pi, dedicated pool dive)
# by piping the code over ssh: nothing is copied or written on the Pi.
# It still connects to the production server: ask Nicholas before running it.
# Usage: [PHP_BIN=php8.5] bash tests/php/run_unit_pi.sh   (exit code 1 on failure)
set -euo pipefail

PHP_BIN="${PHP_BIN:-php8.5}"
if [[ ! "$PHP_BIN" =~ ^php[0-9]+\.[0-9]+$ ]]; then
  echo "invalid PHP_BIN '$PHP_BIN': must match ^php[0-9]+\\.[0-9]+$" >&2
  exit 2
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SOURCE="$ROOT/public/api/contact.php"
TEST="$ROOT/tests/php/contact_test.php"
PI=pi@bullesenvalais.ch

# The bundle is: test prelude, then contact.php without its two header lines,
# then the tests after their `require` line.
define_line=$(grep -n "^define('CONTACT_NO_AUTORUN'" "$TEST" | cut -d: -f1 || true)
require_line=$(grep -n "^require __DIR__" "$TEST" | cut -d: -f1 || true)
if [ -z "$define_line" ] || [ -z "$require_line" ] || [ "$(head -n 2 "$SOURCE")" != "$(printf '<?php\ndeclare(strict_types=1);')" ]; then
  echo "unexpected layout of contact.php or contact_test.php: update this script" >&2
  exit 1
fi

ssh -o BatchMode=yes "$PI" "command -v $PHP_BIN >/dev/null 2>&1 || { echo '$PHP_BIN not found on the Pi' >&2; exit 1; }; $PHP_BIN -v | head -n 1; $PHP_BIN -l" <"$SOURCE"
{
  head -n $((define_line - 1)) "$TEST"
  echo "define('CONTACT_NO_AUTORUN', true);"
  echo "define('CONTACT_TEST_NO_FILES', true); // the daily counter tests write a file"
  tail -n +3 "$SOURCE"
  tail -n +$((require_line + 1)) "$TEST"
} | ssh -o BatchMode=yes "$PI" "$PHP_BIN -d error_reporting=-1 -d display_errors=stderr"

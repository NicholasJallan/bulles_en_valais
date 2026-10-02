#!/usr/bin/env bash
# Integration tests for public/api/contact.php: PHP built-in server + fake SMTP server.
# Usage: bash tests/php/run_integration.sh   (exit code 1 on failure)
# Needs php, curl, lsof and Python 3.8+.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TESTS="$ROOT/tests/php"
WORK="$(mktemp -d)"
LOG="$WORK/smtp.jsonl"
PHP_ERRORS="$WORK/php_errors.log"
SMTP_PORT=2525 # must match tests/php/test-config.php
HTTP_PORT=8099
URL="http://127.0.0.1:$HTTP_PORT/api/contact"
SITE="https://dive.bullesenvalais.ch"
JSON="application/json"
QUOTA="$TESTS/.quota-integration" # CONTACT_QUOTA_PATH of router.php
PASS=0
FAIL=0
SMTP_PID=""
PHP_PID=""

cleanup() {
  [ -n "$SMTP_PID" ] && kill "$SMTP_PID" 2>/dev/null
  [ -n "$PHP_PID" ] && kill "$PHP_PID" 2>/dev/null
  rm -rf "$WORK"
  rm -f "$QUOTA"
}
trap cleanup EXIT

expect() { # label actual expected
  if [ "$2" = "$3" ]; then
    PASS=$((PASS + 1)); echo "  ok   $1"
  else
    FAIL=$((FAIL + 1)); echo "  FAIL $1 — expected '$3', got '$2'"
  fi
}

record() { # label exit-status
  if [ "$2" -eq 0 ]; then
    PASS=$((PASS + 1)); echo "  ok   $1"
  else
    FAIL=$((FAIL + 1)); echo "  FAIL $1"
  fi
}

wait_for() { # description command...
  for _ in $(seq 1 50); do "${@:2}" && return 0; sleep 0.1; done
  echo "timeout while waiting for $1" >&2
  exit 1
}

post() { # origin content-type data → sets STATUS and BODY
  local args=(-s --max-time 15 -o "$WORK/body" -w '%{http_code}' -X POST --data-binary "$3")
  [ -n "$1" ] && args+=(-H "Origin: $1")
  [ -n "$2" ] && args+=(-H "Content-Type: $2")
  STATUS=$(curl "${args[@]}" "$URL")
  BODY=$(cat "$WORK/body")
}

payload() { # name email message [website] [elapsed] — JSON escapes in arguments are kept as is
  printf '{"name":"%s","email":"%s","phone":"+41 79 000 00 00","interest":"sdi-owd","message":"%s","website":"%s","elapsed":%s,"locale":"fr"}' \
    "$1" "$2" "$3" "${4:-}" "${5:-8000}"
}

normal() { # marker
  payload 'Élodie Martin' 'elodie@example.com' "Bonjour,\\nje voudrais plonger au Rosel.\\n.\\nMerci ($1)"
}

await_session() { # marker → index of the session carrying it
  python3 "$TESTS/smtp_log.py" await "$LOG" "$1"
}

# --- servers ---------------------------------------------------------------
for port in "$SMTP_PORT" "$HTTP_PORT"; do
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "port $port is already in use: stop the other process (or test run) first" >&2
    exit 1
  fi
done
python3 "$TESTS/fake_smtp.py" "$SMTP_PORT" "$LOG" "$WORK/smtp.ready" &
SMTP_PID=$!
rm -f "$QUOTA"
php -d log_errors=1 -d error_log="$PHP_ERRORS" -S "127.0.0.1:$HTTP_PORT" "$TESTS/router.php" >"$WORK/php.log" 2>&1 &
PHP_PID=$!
wait_for "fake SMTP server" test -f "$WORK/smtp.ready"
wait_for "PHP built-in server" curl -s --max-time 1 -o /dev/null "$URL"
if ! kill -0 "$SMTP_PID" 2>/dev/null || ! kill -0 "$PHP_PID" 2>/dev/null; then
  echo "a test server exited during startup" >&2
  exit 1
fi

# --- delivery --------------------------------------------------------------
echo "normal request"
post "$SITE" "$JSON" "$(normal 'ref-n1')"
expect "normal request → 200" "$STATUS" 200
expect "normal request → {\"ok\":true}" "$BODY" '{"ok":true}'
index=$(await_session 'ref-n1')
expect "first session is the normal request" "$index" 1
python3 "$TESTS/smtp_log.py" check "$LOG" "$index" normal
record "normal session assertions" $?

echo "malicious request (SMTP and header injection)"
malicious_message='ref-m1\r\n.\r\nMAIL FROM:<a@b.c>\r\nRCPT TO:<victim@example.com>\r\nDATA\r\nSubject: spam\r\n\r\nspam body\r\n.\r\nQUIT'
post "$SITE" "$JSON" "$(payload 'Bob\r\nBcc: victim@example.com' 'bob@example.com' "$malicious_message")"
expect "malicious request → 200 (sent as literal text)" "$STATUS" 200
index=$(await_session 'ref-m1')
expect "malicious request opened exactly one new session" "$index" 2
python3 "$TESTS/smtp_log.py" check "$LOG" "$index" malicious
record "malicious session assertions" $?

expect "each delivery is counted for the day" "$(cut -d' ' -f2 "$QUOTA")" 2

# --- refusals: none of these may reach the SMTP server -----------------------
echo "refusals"
post "" "$JSON" "$(normal 'x')"
expect "no Origin → 403" "$STATUS" 403
post "https://evil.example" "$JSON" "$(normal 'x')"
expect "foreign Origin → 403" "$STATUS" 403
post "$SITE" "text/plain" "$(normal 'x')"
expect "text/plain → 403" "$STATUS" 403
post "$SITE" "$JSON" "$(payload 'Bot' 'bot@example.com' 'x' 'http://spam.example')"
expect "honeypot filled → 200 without sending" "$STATUS $BODY" '200 {"ok":true}'
post "$SITE" "$JSON" "$(payload 'Bot' 'bot@example.com' 'x' '' 1200)"
expect "elapsed < 3000 ms → 200 without sending" "$STATUS $BODY" '200 {"ok":true}'
post "$SITE" "$JSON" '{"name":"Bot","email":"bot@example.com","phone":"","interest":"sdi-owd","message":"x","website":""}'
expect "no elapsed → 200 without sending" "$STATUS $BODY" '200 {"ok":true}'
python3 -c 'import sys; sys.stdout.write("{\"name\":\"" + "a" * 33000 + "\"}")' >"$WORK/big.json"
post "$SITE" "$JSON" "@$WORK/big.json"
expect "body over 32 KB → 413" "$STATUS" 413
post "$SITE" "$JSON" '{"name":'
expect "invalid JSON → 400" "$STATUS" 400
post "$SITE" "$JSON" "$(payload 'Eve' '\"a\\\nBcc: v@x.y\"@example.com' 'x')"
expect "quoted e-mail hiding a line feed → 400 on email" "$STATUS $BODY" '400 {"ok":false,"error":"validation","fields":["email"]}'
expect "GET → 405" "$(curl -s --max-time 5 -o /dev/null -w '%{http_code}' "$URL")" 405
expect "405 advertises the allowed methods" "$(curl -s --max-time 5 -D - -o /dev/null "$URL" | tr -d '\r' | grep -i '^allow:')" 'Allow: POST, OPTIONS'
expect "OPTIONS → 204" "$(curl -s --max-time 5 -o /dev/null -w '%{http_code}' -X OPTIONS "$URL")" 204
post "$SITE" "$JSON" "$(normal 'ref-s1')"
expect "sentinel request → 200" "$STATUS" 200
expect "only the sentinel reached SMTP after the refusals" "$(await_session 'ref-s1')" 3

# --- daily limit ---------------------------------------------------------------
echo "daily limit"
TODAY=$(php -r 'echo date("Y-m-d");')
printf '%s 50' "$TODAY" >"$QUOTA"
post "$SITE" "$JSON" "$(normal 'ref-q1')"
expect "limit reached → 503 busy" "$STATUS $BODY" '503 {"ok":false,"error":"busy"}'
grep -q 'contact: daily limit reached' "$PHP_ERRORS"
record "limit is logged" $?
printf '%s 3' "$TODAY" >"$QUOTA"
post "$SITE" "$JSON" "$(normal 'ref-q2')"
expect "under the limit again → 200" "$STATUS" 200
expect "the busy request never reached SMTP" "$(await_session 'ref-q2')" 4
grep -q 'contact: dropped (honeypot)' "$PHP_ERRORS"
record "honeypot drop is logged with its reason" $?
grep -q 'contact: dropped (too_fast)' "$PHP_ERRORS"
record "too-fast drop is logged with its reason" $?

# --- delivery failure ----------------------------------------------------------
echo "delivery failure"
kill "$SMTP_PID" && wait "$SMTP_PID" 2>/dev/null
SMTP_PID=""
post "$SITE" "$JSON" "$(normal 'ref-f1')"
expect "SMTP server down → 500 delivery" "$STATUS $BODY" '500 {"ok":false,"error":"delivery"}'
grep -q 'contact: delivery failed at connect' "$PHP_ERRORS"
record "failure is logged with its stage" $?
! grep -qiE 'elodie|Élodie|bot@|ref-' "$PHP_ERRORS"
record "error log contains no personal data" $?

echo
echo "$PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]

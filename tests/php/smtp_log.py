#!/usr/bin/env python3
"""Reads the fake SMTP log (one JSON line per session) for run_integration.sh.

  smtp_log.py await LOG MARKER      print the 1-based index of the first session
                                    whose decoded body contains MARKER (waits up to 5 s)
  smtp_log.py check LOG INDEX MODE  assert on session INDEX; MODE is normal or malicious
"""
import email
import email.policy
import json
import sys
import time

SITE_SENDER = "site@example.test"
OWNER = "owner@example.test"


def load_sessions(path):
    try:
        with open(path, encoding="utf-8") as log:
            return [json.loads(line) for line in log if line.strip()]
    except FileNotFoundError:
        return []


def parse(transaction):
    return email.message_from_string(transaction["data"], policy=email.policy.default)


def body_of(message):
    return message.get_content().replace("\r\n", "\n")


def await_marker(path, marker):
    for _ in range(50):
        for index, session in enumerate(load_sessions(path), start=1):
            if any(marker in body_of(parse(t)) for t in session["transactions"]):
                print(index)
                return 0
        time.sleep(0.1)
    print(0)
    return 1


def verbs_of(session):
    return [command.split(":")[0].split(" ")[0].upper() for command in session["commands"]]


def check(path, index, mode):
    sessions = load_sessions(path)
    if not 1 <= index <= len(sessions):
        print(f"  FAIL [{mode}] no logged session at index {index}")
        return 1
    session = sessions[index - 1]
    results = []

    def expect(label, condition):
        results.append(condition)
        print(("  ok   " if condition else "  FAIL ") + f"[{mode}] {label}")

    transactions = session["transactions"]
    verbs = verbs_of(session)
    expect("exactly one SMTP transaction", len(transactions) == 1)
    expect("one MAIL FROM, one RCPT TO, one DATA", [verbs.count(v) for v in ("MAIL", "RCPT", "DATA")] == [1, 1, 1])
    if len(transactions) != 1:
        return 1
    transaction = transactions[0]
    message = parse(transaction)
    body = body_of(message)
    head = "\r\n" + transaction["data"].split("\r\n\r\n", 1)[0].lower()
    expect("envelope sender is the configured one", transaction["mail_from"] == SITE_SENDER)
    expect("envelope recipient is the configured one only", transaction["rcpt_to"] == [OWNER])
    expect("no Bcc or Cc header", "\r\nbcc:" not in head and "\r\ncc:" not in head)
    if mode == "normal":
        expect("subject decoded with accents", str(message["Subject"]) == "Contact Bulles en Valais — Élodie Martin")
        expect("reply-to is the visitor", message["Reply-To"].addresses[0].addr_spec == "elodie@example.com")
        expect("body keeps the message, lone dot included", "je voudrais plonger au Rosel.\n.\nMerci" in body)
        expect("body shows the locale", "Langue     : fr" in body)
    else:
        expect("subject carries the sanitized name", str(message["Subject"]) == "Contact Bulles en Valais — Bob Bcc: victim@example.com")
        expect("injected commands stay literal text in the body", "\n.\nMAIL FROM:<a@b.c>\nRCPT TO:<victim@example.com>\nDATA\n" in body)
    return 0 if all(results) else 1


def main():
    command, path = sys.argv[1], sys.argv[2]
    if command == "await":
        return await_marker(path, sys.argv[3])
    return check(path, int(sys.argv[3]), sys.argv[4])


if __name__ == "__main__":
    sys.exit(main())

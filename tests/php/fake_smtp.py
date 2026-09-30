#!/usr/bin/env python3
"""Fake SMTP server for the contact endpoint integration tests (stdlib only).

No TLS. Announces PIPELINING and AUTH LOGIN, accepts any credentials and
appends one JSON line per session (commands and transactions) to a log file.
Sessions are handled one at a time, so they are logged in connection order.
A lone "." line ends DATA whatever its line ending, so that any smuggled
terminator shows up as an extra transaction.

Usage: fake_smtp.py PORT LOG_PATH READY_PATH
"""
import json
import socketserver
import sys

EHLO_REPLY = ["250-fake.smtp", "250-PIPELINING", "250-AUTH LOGIN", "250 8BITMIME"]


def address_of(line, prefix):
    return line[len(prefix):].strip().strip("<>")


class SmtpHandler(socketserver.StreamRequestHandler):
    timeout = 10

    def reply(self, *lines):
        self.wfile.write("".join(f"{line}\r\n" for line in lines).encode())
        self.wfile.flush()

    def read_line(self):
        raw = self.rfile.readline()
        return None if not raw else raw.decode("utf-8", "replace").rstrip("\r\n")

    def read_data(self):
        lines = []
        while True:
            raw = self.rfile.readline()
            if not raw:
                return None
            if raw.rstrip(b"\r\n") == b".":
                return "".join(lines)
            lines.append((raw[1:] if raw.startswith(b"..") else raw).decode("utf-8", "replace"))

    def handle(self):
        session = {"commands": [], "transactions": []}
        try:
            self.converse(session)
        except OSError:
            session["commands"].append("<connection error>")
        self.server.log_session(session)

    def converse(self, session):
        current = None
        self.reply("220 fake.smtp ESMTP")
        while (line := self.read_line()) is not None:
            session["commands"].append(line)
            upper = line.upper()
            if upper.startswith(("EHLO", "HELO")):
                self.reply(*EHLO_REPLY)
            elif upper == "AUTH LOGIN":
                self.reply("334 VXNlcm5hbWU6")
                self.read_line()
                self.reply("334 UGFzc3dvcmQ6")
                self.read_line()
                self.reply("235 2.7.0 Accepted")
            elif upper.startswith("MAIL FROM:"):
                current = {"mail_from": address_of(line, "MAIL FROM:"), "rcpt_to": [], "data": None}
                self.reply("250 2.1.0 OK")
            elif upper.startswith("RCPT TO:") and current is not None:
                current["rcpt_to"].append(address_of(line, "RCPT TO:"))
                self.reply("250 2.1.5 OK")
            elif upper == "DATA" and current is not None and current["rcpt_to"]:
                self.reply("354 End data with <CR><LF>.<CR><LF>")
                current["data"] = self.read_data()
                if current["data"] is None:
                    return
                session["transactions"].append(current)
                current = None
                self.reply("250 2.0.0 queued")
            elif upper == "QUIT":
                self.reply("221 2.0.0 bye")
                return
            elif upper in ("RSET", "NOOP"):
                current = None if upper == "RSET" else current
                self.reply("250 2.0.0 OK")
            else:
                self.reply("500 5.5.1 unrecognized command")


class FakeSmtpServer(socketserver.TCPServer):
    allow_reuse_address = True

    def __init__(self, port, log_path):
        super().__init__(("127.0.0.1", port), SmtpHandler)
        self.log_path = log_path

    def log_session(self, session):
        with open(self.log_path, "a", encoding="utf-8") as log:
            log.write(json.dumps(session, ensure_ascii=False) + "\n")


def main():
    port, log_path, ready_path = int(sys.argv[1]), sys.argv[2], sys.argv[3]
    with FakeSmtpServer(port, log_path) as server:
        open(ready_path, "w").close()
        server.serve_forever()


if __name__ == "__main__":
    main()

# Security Policy (SECURITY.md)

EchoRoom takes security seriously. This document describes how to responsibly report security issues
and clarifies the security boundaries of the project.

---

## Supported Versions

EchoRoom is an open-source project.
Only the latest version on the default branch is considered supported.

Security fixes are not backported unless explicitly stated.

---

## Reporting a Vulnerability

If you discover a security vulnerability, **do not open a public issue**.

Instead, use one of the following responsible disclosure methods:

- **GitHub Security Advisories** (preferred):
  - Go to the repository → Security → Advisories → “Report a vulnerability”
- **Private contact**:
  - Email: security@your-domain.example (replace with a real address before publishing)

Provide as much detail as possible:
- Description of the issue
- Steps to reproduce
- Potential impact
- Affected components (protocol, database, socket server, client)

---

## What Counts as a Security Issue

Examples include:
- Authentication or authorization bypass
- RLS misconfiguration or bypass
- Room membership leakage
- Message interception or spoofing
- Replay attacks
- Denial-of-service vectors
- Cryptographic weaknesses (current or future E2EE work)

Examples that are **not** security issues:
- UI bugs
- Feature requests
- Performance complaints without security impact

---

## Disclosure Process

1. Report received privately
2. Maintainers assess severity
3. Fix is developed and reviewed
4. Fix is released
5. Public disclosure (if appropriate)

There are no guaranteed response times, but reasonable effort will be made.

---

## Security Scope and Responsibility

Important boundaries:

- EchoRoom is a **software framework**, not a hosted service
- Maintainers do **not** operate production instances
- Maintainers do **not** monitor user traffic or content
- Third-party deployments are the responsibility of the deployer

If you deploy EchoRoom yourself, **you are responsible** for:
- Infrastructure security
- Compliance with laws and regulations
- User data protection
- Operational monitoring

---

## No Bug Bounty

EchoRoom does not currently offer a bug bounty program.
Responsible disclosure is appreciated.

---

## Changes to This Policy

This document may be updated as the project evolves.

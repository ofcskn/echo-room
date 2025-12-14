# EchoRoom – Roadmap & Contribution TODOs (TODO.MD)

This document lists **future features and contribution ideas** that are intentionally **not part of the current core system**.
All items here must respect EchoRoom’s protocol-first, backend-authoritative architecture.

Nothing in this file is optional once started: every item requires protocol, database, and documentation updates.

---

## A. End-to-End Encryption (E2EE)

### Goal
Ensure that message content is readable **only by room participants**, not by the server or database.

### Scope
- Client-side encryption and decryption
- Server treats message content as opaque ciphertext
- No key material stored server-side

### Required Design Work
- Define key exchange mechanism (per-room symmetric key)
- Decide key derivation strategy:
  - Derived from room secret
  - Derived from password (see section B)
- Extend socket protocol to support:
  - Encrypted payloads
  - Key confirmation messages
- Update DATABASE.MD to clarify encrypted content storage
- Update PROTOCOL.MD with encryption guarantees and limits

### Constraints
- Must not weaken RLS or membership enforcement
- Must work identically on mobile and web
- No platform-specific crypto implementations

---

## B. Password-Based Rooms (Ciphered Rooms)

### Goal
Allow rooms to be protected by a **shared password** that is also used as a cryptographic secret.

### Behavior
- Room creator sets a password
- Password is never sent or stored in plaintext
- Password is used to:
  - Derive encryption key
  - Gate room access

### Required Changes
- Extend room creation flow (client-side only)
- Add password-derived key flow to protocol
- Possibly add:
  - `ROOM_AUTH_REQUIRED` server message
- Document password handling rules in SECURITY.MD

### Explicit Non-Goals
- Password recovery
- Server-side password validation
- Persistent credential storage

---

## C. Read Receipts (Optional, Privacy-Sensitive)

### Goal
Optionally show whether messages were delivered/read inside a room.

### Notes
- Must be opt-in per room
- Must not create permanent metadata
- Must not leak user identity across rooms

### Required Work
- Protocol extension
- Additional ephemeral message types
- Strict expiration behavior

---

## D. Typing Indicators

### Goal
Show when another participant is typing.

### Constraints
- Realtime only
- Never persisted
- No typing history

### Required Work
- New transient socket message type
- Rate limiting
- UI-only representation

---

## E. Moderation / Abuse Controls (Minimal)

### Goal
Prevent obvious abuse without introducing identity systems.

### Possible Features
- Per-room rate limits
- Temporary mute inside a room
- Auto-expire rooms on abuse signals

### Constraints
- No global bans
- No user reputation system
- No persistent moderation state

---

## F. Performance & Scalability

### Areas
- Socket fan-out optimization
- Message batching
- Backpressure handling
- Horizontal scaling strategy documentation

---

## G. Documentation & Tooling Contributions

Accepted contributions:
- Architecture diagrams
- Protocol simulators
- Load-testing tools
- Security audits
- Threat modeling updates

---

## Contribution Rule

Any TODO item requires:
1. Documentation update (PROTOCOL / DATABASE / SECURITY)
2. Protocol version review
3. Cross-platform parity (mobile + web)
4. Test coverage

If a feature cannot meet these requirements, it should not be implemented.

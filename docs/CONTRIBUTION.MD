

# EchoRoom Contribution Rules (CONTRIBUTION.MD)

This document defines **mandatory contribution rules** for EchoRoom.
All contributors must follow these rules to prevent architectural drift and platform divergence.

---

## Guiding Principle

EchoRoom is **one system**, not multiple apps.

Any change must preserve:
- Protocol consistency
- Domain integrity
- Cross-platform behavior parity

---

## Non-Negotiable Rules

### 1. Protocol First

- `PROTOCOL.MD` is authoritative
- No client may introduce new socket messages independently
- No protocol changes without versioning (`v: 2`, etc.)

If behavior is not described in the protocol, it does not exist.

---

### 2. Database Is the Source of Truth

- `DATABASE.MD` defines all constraints
- RLS must never be bypassed
- No client-side authority over:
  - Room expiry
  - Membership
  - Message validity

---

### 3. Architecture Enforcement

All code must respect:

```

UI → Services → Repository Ports → Adapters → Infrastructure

```

Forbidden:
- UI calling Supabase directly
- UI containing socket protocol logic
- Business rules inside components
- Platform-specific forks of services

---

### 4. Cross-Platform Parity

Mobile and web must:
- Share the same domain models
- Share the same socket protocol
- Share the same backend services

Allowed differences:
- Layout
- Navigation
- Input handling

Disallowed differences:
- Room lifecycle logic
- Message validation logic
- Authorization logic

---

### 5. UI & Design Changes

- UI changes must respect `BRAND.MD`
- Time and expiry must always be visible
- No decorative UI that obscures system state

Screenshots must be updated in:
- `docs/web/screenshots/`
- `docs/mobile/screenshots/`

---

### 6. Testing Expectations

Any meaningful change must include:
- Service-level tests (with mock repositories)
- No direct dependency on real Supabase for unit tests
- No protocol regressions

---

## What NOT to Contribute

EchoRoom intentionally does not support:
- User profiles
- Message editing or deletion
- Persistent chat history
- Public rooms
- Social features

Pull requests adding these features will be rejected.

---

## Review Standard

A contribution is acceptable only if:
- It preserves architectural boundaries
- It does not introduce platform divergence
- It does not weaken security or RLS
- It aligns with the protocol-first philosophy

When in doubt: update documentation first.
```

---

### Result

You now have:

* A **professional, navigable README**
* Clickable screenshot previews
* Clear contribution governance
* Strong signals for senior-level system design

If you want next:

* `SECURITY.MD`
* `TESTING.MD`
* `OPERATIONS.MD`
* or auto-generated **diagrams (Mermaid)** for README

Say the filename.

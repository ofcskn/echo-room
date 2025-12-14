
# Database Reference — EchoRoom

This document describes the **complete database design** used by EchoRoom.

It is a **reference document**.
The source of truth is the migration file.

---

## 1. Source of Truth

```
supabase/migrations/20251214215158_remote_schema.sql
```

This file defines:
- Tables
- Indexes
- Constraints
- Functions
- Triggers
- RLS policies

---

## 2. Tables

### rooms
Purpose:
- Represents ephemeral chat rooms

Key columns:
- id (uuid, PK)
- created_by (uuid)
- created_at (timestamptz)
- expires_at (timestamptz)
- status (enum)
- ttl_seconds (int)

Constraints:
- TTL bounds
- Expiry after creation

---

### room_members
Purpose:
- Controls access

Key columns:
- room_id (uuid, PK)
- user_id (uuid, PK)
- joined_at

Used heavily by RLS.

---

### messages
Purpose:
- Immutable chat messages

Key columns:
- id (uuid, PK)
- room_id (uuid)
- sender_id (uuid)
- content (text)
- client_msg_id (uuid)

Constraints:
- Content length
- Deduplication via client_msg_id

Replica identity:
- FULL (for realtime correctness)

---

### anon_users
Purpose:
- Tracks ephemeral users

Key columns:
- user_id (uuid, PK)
- last_seen_at
- created_at

Automatically cleaned up.

---

## 3. Indexes

Indexes are optimized for:

- Room-based message queries
- Membership lookups
- Expiry scans

Notable indexes:
- messages(room_id, created_at)
- room_members(room_id)
- room_members(user_id)
- rooms(expires_at)

---

## 4. Custom Types

### room_status
Enum values:
- active
- expired

Used to enforce lifecycle correctness.

---

## 5. Functions (RPC / Helpers)

Key functions include:

- fn_is_member
- fn_is_room_member
- fn_is_room_active
- fn_rooms_set_created_by
- fn_rooms_set_expires_at
- fn_messages_set_sender
- fn_cleanup_anon_users

Functions are used for:
- RLS predicates
- Triggers
- Cleanup logic

---

## 6. Triggers

Triggers enforce invariants:

- Auto-assign creator
- Auto-set expiry
- Auto-add room creator as member
- Auto-assign sender_id
- Touch anonymous users

No business logic exists in clients.

---

## 7. Row Level Security (RLS)

RLS is enabled on:
- rooms
- room_members
- messages

Rules:
- Only room members can read/write messages
- Only creators can update rooms
- Users can only manage their own membership

Security is **database-enforced**, not client-enforced.

---

## 8. Realtime Implications

Realtime streams:
- Observe WAL changes
- Respect RLS automatically
- Stream only authorized rows

Replica identity FULL ensures correctness.

---

## 9. PostgreSQL Compatibility

The schema is PostgreSQL-compatible.

Supabase-specific features:
- auth.uid()
- Realtime engine

For pure PostgreSQL:
- Replace auth context
- Implement realtime externally
- Adjust RLS

---

## 10. Design Goals

- Deterministic schema
- Minimal surface area
- Strong security defaults
- Realtime-first design
- Ephemeral data lifecycle

This database is intentionally strict.


# EchoRoom Database Specification (DATABASE.MD)

This document defines the authoritative PostgreSQL database schema for EchoRoom.
It is shared by mobile (Expo) and web (ViteJS) clients using a single backend and socket protocol.

---

## Design Goals

- Anonymous but authenticated access (JWT / Supabase Auth)
- Strong room-based isolation
- Immutable messages
- Explicit room expiration
- RLS-enforced authorization
- Cross-platform consistency

---

## Schema Overview

Schema namespace: echo

Tables:
- echo.rooms
- echo.room_members
- echo.messages

---

## Enum Types

### room_status

```sql
CREATE TYPE echo.room_status AS ENUM ('active','expired');
```

---

## Tables

### echo.rooms

```sql
CREATE TABLE echo.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  status echo.room_status NOT NULL DEFAULT 'active',
  ttl_seconds int NOT NULL DEFAULT 600,
  CONSTRAINT rooms_expires_after_created CHECK (expires_at > created_at),
  CONSTRAINT rooms_ttl_reasonable CHECK (ttl_seconds BETWEEN 60 AND 3600)
);
```

---

### echo.room_members

```sql
CREATE TABLE echo.room_members (
  room_id uuid NOT NULL REFERENCES echo.rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);
```

---

### echo.messages

```sql
CREATE TABLE echo.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES echo.rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  content text NOT NULL,
  client_msg_id uuid NOT NULL,
  CONSTRAINT messages_content_len CHECK (char_length(content) BETWEEN 1 AND 500),
  CONSTRAINT messages_room_sender_client_unique
    UNIQUE (room_id, sender_id, client_msg_id)
);
```

---

## Indexes

```sql
CREATE INDEX idx_rooms_expires_at ON echo.rooms (expires_at);
CREATE INDEX idx_rooms_created_by ON echo.rooms (created_by);
CREATE INDEX idx_room_members_user ON echo.room_members (user_id);
CREATE INDEX idx_room_members_room ON echo.room_members (room_id);
CREATE INDEX idx_messages_room_created ON echo.messages (room_id, created_at);
CREATE INDEX idx_messages_sender ON echo.messages (sender_id);
```

---

## Triggers

### Set expires_at

```sql
CREATE FUNCTION echo.fn_rooms_set_expires_at()
RETURNS trigger AS $$
BEGIN
  IF new.created_by IS NULL THEN
    new.created_by := auth.uid();
  END IF;

  IF new.expires_at IS NULL THEN
    new.expires_at := now() + make_interval(secs => new.ttl_seconds);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql;
```

### Auto-add creator

```sql
CREATE FUNCTION echo.fn_rooms_add_creator_member()
RETURNS trigger AS $$
BEGIN
  INSERT INTO echo.room_members(room_id, user_id)
  VALUES (new.id, new.created_by)
  ON CONFLICT DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql;
```

---

## Helper Functions

```sql
CREATE FUNCTION echo.fn_is_room_active(p_room_id uuid)
RETURNS boolean AS $$
SELECT EXISTS (
  SELECT 1 FROM echo.rooms
  WHERE id = p_room_id
    AND status = 'active'
    AND expires_at > now()
);
$$ LANGUAGE sql STABLE;
```

```sql
CREATE FUNCTION echo.fn_is_member(p_room_id uuid, p_user_id uuid)
RETURNS boolean AS $$
SELECT EXISTS (
  SELECT 1 FROM echo.room_members
  WHERE room_id = p_room_id
    AND user_id = p_user_id
);
$$ LANGUAGE sql STABLE;
```

---

## Row Level Security Summary

- rooms: members can read, creator can insert/update
- room_members: self-join only, active rooms only
- messages: members can read/write, immutable

---

## Expiration Strategy

- Logical expiration via expires_at
- Physical deletion via scheduled cleanup job
- Cascading deletes remove members and messages

---

## Cross-Platform Contract

This schema is used identically by:
- Mobile apps (Expo)
- Web apps (ViteJS)
- Socket server
- Tests and mocks

No deviations are allowed.

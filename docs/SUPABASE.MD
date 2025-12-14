
# Supabase Setup Guide — EchoRoom

This document explains how to use EchoRoom **correctly with Supabase**.
It assumes no prior access to the original author's Supabase project.

EchoRoom is **not coupled** to any specific Supabase instance.

---

## 1. What Supabase Is Used For

EchoRoom uses Supabase for:

- PostgreSQL database (public schema only)
- Authentication context (`auth.uid()`)
- Realtime subscriptions (Postgres WAL)
- Optional scheduled jobs (cleanup)

EchoRoom does **not** use:
- Supabase Storage
- Supabase Edge Functions
- Supabase Vault data

---

## 2. Create a New Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Save the following values:
   - Project URL
   - Anon public key
   - Service role key (server-side only)

These values **must not** be committed to Git.

---

## 3. Apply Database Migrations

EchoRoom ships with a baseline migration.

### Steps

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Open the migration file:

```
supabase/migrations/20251214215158_remote_schema.sql
```

4. Run the file **once**
5. Do not modify it

This creates the entire public schema.

---

## 4. Realtime Configuration

Supabase Realtime is enabled automatically.

Ensure the following tables are included in the publication:

- rooms
- room_members
- messages

RLS is enforced automatically on realtime streams.

No additional configuration is required.

---

## 5. Authentication Notes

EchoRoom relies on:

```sql
auth.uid()
```

This means:
- Users must be authenticated
- Anonymous users are still tracked via Supabase auth

If you disable Supabase Auth:
- You must rewrite RLS policies
- You must replace helper functions

---

## 6. Environment Variables

EchoRoom supports **Web (Vite)** and **Mobile (Expo)** clients.
Each platform uses its own environment variables and example files.

Secrets must **never** be committed.

---

### 6.1 Web (Vite)

Environment variables for the web client are defined in:

```
apps/web/.env.example
```

Example:

```env
VITE_DATA_SOURCE=supabase  # "supabase" | "mock"

VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publish_xxx

VITE_ALLOWED_HOSTS=localhost,127.0.0.1
```

Notes:

* Only **public / publishable** Supabase keys are allowed
* Never use service role keys in the web client
* Set `VITE_DATA_SOURCE=mock` for local or offline development

---

### 6.2 Mobile (Expo)

Environment variables for the mobile client are defined in:

```
apps/mobile/.env.example
```

Example:

```env
EXPO_PUBLIC_DATA_SOURCE=supabase  # "supabase" | "mock"

EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=sb_publish_xxx
```

Notes:

* Expo variables are bundled at build time
* Only anon / publishable Supabase keys are supported
* Never expose service role keys in mobile builds

---

### 6.3 Shared Rules

* Each platform uses its **own env file**
* Keys are not shared implicitly between platforms
* Supabase credentials belong to **your own project**
* EchoRoom does not ship with default credentials

---

### 6.4 Data Source Switching

Both clients support a runtime data source switch:

```text
supabase → real backend
mock     → local / in-memory data
```

This is intended for development, testing, and demos.

---

## 7. What Not To Do

- Do not edit the baseline migration
- Do not modify schema via Dashboard after setup
- Do not remove RLS
- Do not expose service role keys to clients

---

## 8. Supported Deployment Models

- Supabase Cloud (recommended)
- Supabase self-hosted
- PostgreSQL-compatible fork (with changes)

---

## 9. Responsibility Disclaimer

You are responsible for:
- Your Supabase project
- Your user data
- Your security configuration

EchoRoom provides **schema and protocol only**.


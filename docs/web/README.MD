# EchoRoom Web Client (ViteJS)

This directory contains the **ViteJS-based web client** for EchoRoom.  
It is a **thin, protocol-driven frontend** that shares the same socket protocol, domain models, and backend services with the Expo mobile app.

There is **no web-specific business logic** in this project.

---

## Purpose

The web client is responsible only for:
- Rendering UI
- Handling user interaction
- Wiring UI to application services via adapters

All rules about rooms, messaging, expiry, and authorization are enforced by:
- The socket protocol
- Supabase (PostgreSQL + RLS)
- Application services (not components)

---

## Folder Structure

```

src/
├── adapters/
├── components/
├── config/
├── i18n/
├── pages/
├── repositories/
├── services/
├── types/
├── ui-spec/
├── utils/

```

### `src/types/`
Authoritative TypeScript models shared with mobile and server.

- Database row types (RoomRow, MessageRow, etc.)
- Socket protocol types
- Shared enums and DTOs

No runtime logic allowed here.

---

### `src/repositories/`
**Ports (interfaces)** defining data access contracts.

- No Supabase imports
- No implementation details
- Pure abstractions used by services

Examples:
- RoomsRepository
- MessagesRepository
- RoomMembersRepository

---

### `src/adapters/`
Concrete implementations of repository ports.

- Supabase adapters
- Mock adapters (for local dev and tests)

Adapters are selected at runtime via configuration.
UI never imports Supabase directly.

---

### `src/services/`
Application-level **use cases**.

Each service represents one user intent:
- CreateRoom
- JoinRoom
- SendMessage
- SubscribeToRoom
- ObserveRoomExpiry

Services:
- Depend only on repository interfaces
- Contain orchestration logic
- Contain no UI code

---

### `src/components/`
Reusable, presentational UI components.

Rules:
- Stateless where possible
- No Supabase or socket logic
- No business rules

Examples:
- Button
- Card
- MessageBubble
- RoomTimer
- ConnectionBanner

---

### `src/pages/`
Route-level screens composed from components and services.

Examples:
- Home
- CreateRoom
- JoinRoom
- RoomChat
- RoomEnded
- Settings

Pages:
- Wire adapters → services → components
- Contain minimal state glue
- No direct data access

---

### `src/config/`
Centralized configuration.

```

config.ts

```

Controls environment-based behavior, including:

```

VITE_DATA_SOURCE = "supabase" | "mock"

```

Used to switch adapters without code changes.

---

### `src/utils/`
Low-level shared utilities.

Includes:
- `supabase.ts` (Supabase client initialization)
- Formatting helpers
- Time utilities

No domain logic allowed here.

---

### `src/i18n/`
Internationalization setup using i18n.

- Supported languages:
  - Turkish
  - English
  - French
  - Spanish
- Language files only (no UI logic)

---

### `src/ui-spec/`
Design reference layer.

- Mappings between Stitch designs / screenshots and components
- Used as a visual contract
- Not imported into runtime code

---

## Root Files

- `App.tsx` – application shell and routing
- `index.tsx` – React entry point
- `index.html` – Vite HTML entry
- `vite.config.ts` – Vite configuration
- `tsconfig.json` – TypeScript configuration
- `env.local` – local environment variables (not committed)

---

## Architecture Rules (Strict)

- UI must not call Supabase directly
- UI must not contain socket protocol logic
- All data access flows through:
  `Page → Service → Repository Port → Adapter`
- Mobile and web must remain behaviorally identical
- Protocol types must match server definitions exactly

Violations of these rules are considered architectural bugs.

---

## Running the App

```

npm install
npm run dev

```

Ensure required environment variables are set in `env.local`.

---

## Relationship to Mobile App

- Same domain models
- Same socket protocol
- Same backend
- Same service abstractions

Only the UI layer differs.

This guarantees:
- Cross-platform rooms
- Consistent behavior
- Long-term maintainability

---

## Web Client (ViteJS)

- Documentation: [`README.MD`](./README.MD)

### Screenshots

<div style="display:flex; flex-wrap:wrap; gap:16px; align-items:flex-start">

  <img src="./screenshots/welcome.png"
       style="max-width:400px; width:100%; height:auto;" />

  <img src="./screenshots/start.png"
       style="max-width:400px; width:100%; height:auto;" />

  <img src="./screenshots/dashboard.png"
       style="max-width:400px; width:100%; height:auto;" />

  <img src="./screenshots/join-room.png"
       style="max-width:400px; width:100%; height:auto;" />

  <img src="./screenshots/messages.png"
       style="max-width:400px; width:100%; height:auto;" />

  <img src="./screenshots/room-end.png"
       style="max-width:400px; width:100%; height:auto;" />

  <img src="./screenshots/policies.png"
       style="max-width:400px; width:100%; height:auto;" />

</div>


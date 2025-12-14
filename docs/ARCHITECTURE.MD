# EchoRoom Architecture Specification (ARCHITECTURE.MD)

This document describes the **system architecture** of EchoRoom using
**OOAD (Object-Oriented Analysis & Design)** and **GRASP patterns**.
It applies identically to **Expo mobile** and **ViteJS web** clients.

EchoRoom is a **protocol-first, backend-authoritative system**.
Clients are thin; business rules live in services, repositories, and the database.

---

## 1. Architectural Principles

- Single domain model shared across platforms
- One WebSocket protocol, one server
- Dependency Inversion everywhere
- No direct infrastructure access from UI
- Replaceable data sources (Supabase / Mock)
- Stateless UI, stateful domain services

---

## 2. High-Level System Diagram

```
[ UI (Web / Mobile) ]
          |
          v
[ Application Services ]
          |
          v
[ Repository Ports ]
          |
          v
[ Adapters ]
   |              |
   v              v
[ Supabase ]   [ Mock Data ]
          |
          v
[ PostgreSQL + RLS ]
```

---

## 3. Layers and Responsibilities

### 3.1 UI Layer (Web + Mobile)

**Responsibility**
- Rendering
- User interaction
- Navigation
- Displaying state

**Rules**
- No direct Supabase calls
- No socket logic embedded
- Uses only services via adapters

**Examples**
- RoomChatPage.tsx
- CreateRoomPage.tsx
- MessageList.tsx
- MessageInput.tsx

---

### 3.2 Application Services Layer

Implements **use-cases**.
Each service represents one user intention.

**Examples**
- CreateRoomService
- JoinRoomService
- SendMessageService
- SubscribeRoomService
- ObserveRoomExpiryService

**Rules**
- Stateless
- Pure orchestration
- Depends only on repository interfaces (ports)

---

### 3.3 Repository Ports (Interfaces)

Defines **what** data operations are needed,
not **how** they are implemented.

**Examples**
```ts
interface RoomsRepository {
  create(ttlSeconds: number): Promise<RoomRow>;
  findById(id: string): Promise<RoomRow | null>;
}

interface MessagesRepository {
  send(roomId: string, content: string, clientMsgId: string): Promise<MessageRow>;
  subscribe(roomId: string, onMessage: (m: MessageRow) => void): Unsubscribe;
}
```

**Rules**
- No infrastructure code
- No Supabase imports
- Pure TypeScript contracts

---

### 3.4 Adapters

Adapters implement repository ports.

**Types**
- Supabase adapters (real backend)
- Mock adapters (local dev / tests)

**Rules**
- One adapter per repository
- Selected via config switch
- No UI dependencies

---

### 3.5 Infrastructure Layer

Includes:
- Supabase client
- WebSocket server
- PostgreSQL + RLS
- Cron / cleanup jobs

This layer is **never imported** directly by UI.

---

## 4. Configuration & Dependency Wiring

Single config source:

```ts
// config/config.ts
export const config = {
  dataSource: import.meta.env.VITE_DATA_SOURCE // "supabase" | "mock"
};
```

Adapter factory:

```ts
export function createRepositories() {
  return config.dataSource === "mock"
    ? createMockRepositories()
    : createSupabaseRepositories();
}
```

This guarantees:
- Zero code changes when switching data source
- Deterministic behavior across platforms

---

## 5. Data Flow Example: Send Message

1. UI triggers SendMessageService
2. Service validates input
3. Service calls MessagesRepository.send
4. Adapter persists message (Supabase)
5. Database enforces RLS + constraints
6. Socket server broadcasts NEW_MESSAGE
7. UI receives update via subscription

UI never touches database or sockets directly.

---

## 6. Socket Integration Strategy

- Socket logic lives in adapters
- Protocol handling isolated from UI
- Same protocol used by web and mobile
- Services consume socket events as streams

This prevents:
- Platform divergence
- Protocol duplication
- UI-side business logic

---

## 7. Testing Strategy (Architectural)

- Services tested with mock repositories
- UI tested with mock services
- Socket protocol tested independently
- No tests require real Supabase unless integration-level

---

## 8. Anti-Patterns Explicitly Forbidden

- UI calling Supabase directly
- Conditional logic based on platform
- Duplicate service logic across web/mobile
- God services or repositories
- Business rules in components

---

## 9. Why This Architecture Works

- Scales to new clients (desktop, CLI)
- Enforces consistency
- Enables fast iteration
- Protects domain rules
- Aligns with GRASP & OOAD

EchoRoom is a **system**, not just two apps.

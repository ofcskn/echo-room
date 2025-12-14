# EchoRoom Testing Strategy (TESTING.MD)

## Unit Tests
- Services with mock repositories
- No Supabase dependency

## Integration Tests
- Supabase adapters
- RLS enforcement
- Idempotent messaging

## Realtime Tests
- Multi-client rooms
- Cross-platform delivery
- ROOM_EXPIRED behavior

## CI Rules
- Tests required before merge
- Protocol changes require updates

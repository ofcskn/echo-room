# EchoRoom Socket Messaging Protocol

This document defines the secure WebSocket protocol shared by mobile and web clients.

Clients:
- Expo Mobile App
- ViteJS Web App

Both use the same protocol, server, and message definitions.

Refer to this file for:
- Authentication and authorization rules
- JOIN_ROOM and SEND_MESSAGE flows
- USER_JOINED, NEW_MESSAGE, ROOM_EXPIRED events
- Idempotency, rate limits, and expiry handling

# EchoRoom UI Specification

This document maps the screenshots found in the Expo project to the corresponding web components and pages.

## Pages
1. **Home Screen**
   - Matches `Home.tsx`
   - Elements: Hero Title, Subtitle, "Create Room" Primary Button, "Join Room" Secondary Button.

2. **Create Room**
   - Matches `CreateRoom.tsx`
   - Elements: Page Title, TTL Grid Selection (Pills), "Create" Button.

3. **Join Room**
   - Matches `JoinRoom.tsx`
   - Elements: Page Title, Text Input for Room ID, "Join" Button.

4. **Chat Room**
   - Matches `RoomChat.tsx`
   - Elements: 
     - Header: `RoomIdPill`, `TimerBadge`.
     - Body: `MessageBubble` (Self/Other), `SystemMessage`, Scroll container.
     - Footer: Composer Input (Rounded), Send Icon Button.

5. **Room Ended**
   - Matches `RoomEnded.tsx`
   - Elements: Centered Card, Clock Icon, "Room Ended" Title, Description, Home Button.

## Components
- **Button**: Shared styles, full width, 48px height.
- **TextField**: Floating label style or simple top label, 48px height, brand focus ring.
- **MessageBubble**: 
  - Self: Brand Green background, Right aligned.
  - Other: White/Surface background, Left aligned, Border.
- **TimerBadge**: Monospace font, pulsing red when <1m.

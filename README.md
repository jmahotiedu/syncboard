# Syncboard

Real-time collaborative Kanban board built with Next.js 15, TypeScript, Prisma, and Socket.IO.

## Features

- Drag-and-drop task movement across columns (`@dnd-kit`)
- Optimistic updates for task moves
- Real-time sync between clients (task create/move/update/delete)
- Live presence bar with heartbeat-based online tracking
- Connection status indicator (connected/reconnecting/offline)
- Board/task REST API with Zod validation
- Demo board bootstrap at `/boards/demo`

## Run locally

```bash
cp .env.example .env
npm install
npx prisma db push
npm run dev
```

`npm install` runs `prisma generate` automatically.

Open `http://localhost:3000`, then open the same board in two tabs to verify live sync.

## Verification

```bash
npm run lint
npm test
npm run build
```

## Real-time architecture

1. Client performs API mutation (`POST`/`PATCH`/`DELETE`) and applies optimistic UI update.
2. Client emits Socket.IO event to board room.
3. Socket server broadcasts event to other board participants.
4. Receivers merge incoming state with last-write-wins behavior based on `updatedAt`.

Socket server starts from `GET /api/socket` and listens on `SYNCBOARD_SOCKET_PORT` (default `4001`).

## Tech

- Next.js 15 (App Router), React 19, TypeScript
- Prisma + PostgreSQL
- Socket.IO
- Tailwind CSS v4
- NextAuth (GitHub provider)

## License

MIT

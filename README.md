# Syncboard

Real-time collaborative kanban board. Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma, NextAuth (GitHub OAuth). REST API for boards, columns, tasks. Demo board at `/boards/demo`.

## Status

Implemented: app shell, home (board list + new board), board view with columns/tasks and add-task form, REST API (boards, columns, tasks CRUD, members), NextAuth (GitHub), Prisma + PostgreSQL, demo board at `/boards/demo`. Next: Socket.io for live sync, drag-and-drop (@dnd-kit), presence.

## Run locally

```bash
cp .env.example .env
# Set DATABASE_URL (e.g. Neon or local Postgres)
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech (planned)

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind v4, @dnd-kit
- **Backend**: REST API, Socket.io server, Prisma, PostgreSQL (Neon), NextAuth.js
- **Real-time**: WebSocket events for task/column updates, presence, conflict resolution

## License

MIT

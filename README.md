# serialsms
SerialSMS is a self-hosted, open-source SMS gateway and developer API powered by Next.js, Redis, and a connected Huawei E173 (or other compatible models) modem. Designed to replace Kannel and similiar tools with a modern stack and better usability.

## ✨ Features
- 📤 Send SMS via USB modem (AT commands)
- 📥 Receive SMS and push to Redis
- 🧑‍💻 Developer API with token authentication
- 🔒 Token-based permission and rate limiting
- 📊 Dashboard with system metrics
- 🕹️ Inbox polling & real-time updates
- 🧰 Monorepo architecture (Turborepo)

## 🛠️ Stack

- **Frontend**: Next.js (App Router) + tRPC + Tailwind + shadcn/ui
- **Backend**: Node.js + Redis + Prisma + PostgreSQL
- **Queue**: BullMQ
- **Auth**: BetterAuth
- **Serial**: node-serialport, AT commands

## 🧱 Monorepo Layout
```
apps/
  panel/ -> Next.js dashboard
  modem-worker/ -> Serial interface + queue processing
packages/
  database/ -> Prisma client + schema
  queue/ -> Redis + BullMQ logic
  auth/ -> BetterAuth config
```
## Quick Start
```bash
pnpm --filter database db:push # Generate the client and push the schema to the database
pnpm build
pnpm start
```
It's that simple! 

## 📝 License
MIT - feel free to contribute, fork, or build on top of SerialSMS.

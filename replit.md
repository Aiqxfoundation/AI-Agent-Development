# ETR Gem Mining App

## Overview

Full-stack fantasy treasure-themed gem mining and crypto-style token platform. Users deposit USDT, earn Gems through mining, and convert them to ETR tokens or USDT.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Auth**: JWT (bcrypt passwords, jsonwebtoken)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── gem-mining/         # React + Vite frontend
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Admin Access

- Default admin username: `admin`, password: `admin123`
- Admin flag set directly in DB (`is_admin = true`)
- Admin panel accessible via `/admin` route when logged in as admin

## Key Features

1. **Authentication**: JWT-based, bcrypt password hashing, recovery question/answer
2. **Deposits**: USDT deposits with manual admin approval (~2 hours)
3. **Mining**: Gems accumulate continuously after deposit approval
   - $100 deposit → 10,000,000 gems over 180 days (~55,555/day)
4. **Conversion**:
   - 10,000,000 gems = 100 ETR = $350 USDT
   - Dynamic rate kicks in after 1M ETR swapped (rate doubles)
5. **Referral System**: 2-level (15% L1, 5% L2) gem rewards
6. **ETR Wallet**: ETR transferable between users; USDT balance tracked
7. **Withdrawals**: Manual admin approval required
8. **Admin Panel**: Manage users, deposits, withdrawals + system stats

## Database Schema

- `users` — user accounts with balances, mining state
- `deposits` — USDT deposit requests (pending/approved/rejected)
- `conversions` — gem conversion history
- `withdrawals` — withdrawal requests
- `system_config` — key-value store (e.g., `total_etr_swapped`)

## Mining Constants (lib/api-server/src/lib/mining.ts)

- `GEMS_PER_100_USDT` = 10,000,000
- `MINING_PERIOD_DAYS` = 180
- `DAILY_GEMS_PER_100_USDT` ≈ 55,555
- `GEMS_PER_ETR_NORMAL` = 100,000 (10M gems = 100 ETR)
- `GEMS_PER_ETR_DYNAMIC` = 200,000 (after 1M ETR swapped)
- `ETR_TOTAL_SUPPLY` = 21,000,000

## API Routes

All routes under `/api`:
- `POST /auth/signup` — register
- `POST /auth/login` — login (returns JWT)
- `GET /auth/me` — get current user
- `POST /auth/recovery` — reset password via recovery answer
- `GET/POST /deposits` — user deposits
- `GET /mining/status` — current mining state
- `POST /mining/claim` — claim pending gems
- `GET/POST /conversions` — gem conversion
- `GET /wallet` — balance summary
- `POST /wallet/transfer` — ETR transfer between users
- `GET /referrals` — referral tree info
- `GET/POST /withdrawals` — withdrawal requests
- `GET /system/stats` — public system stats
- `GET /admin/*` — admin endpoints (require isAdmin)

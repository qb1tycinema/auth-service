# 🔐 Auth Service | qb1tycinema

A robust, high-performance microservice responsible for authentication, authorization, and session management within the **qb1tycinema** ecosystem. Built with NestJS and gRPC, it provides secure, passwordless authentication flows and seamless Telegram integration.

## ✨ Core Features

* **Passwordless OTP Flow:** Authentication via Email and Phone number (integrates with `notification-service` for message delivery).
* **Native Telegram OAuth:** Complex 4-step authentication flow via Telegram Bot (Init → Verify → Complete → Consume) with secure session state managed in Redis.
* **JWT Management:** Generation, validation, and refreshing of Access and Refresh tokens.
* **gRPC Communication:** Strict, type-safe API contracts using Protocol Buffers (`@qb1tycinema/contracts`).
* **Database & Caching:** Persistent user storage with Prisma (PostgreSQL) and lightning-fast temporary states with Redis.

## 🛠 Tech Stack

* **Framework:** [NestJS](https://nestjs.com/)
* **Transport:** [gRPC](https://grpc.io/) + Protocol Buffers
* **Language:** TypeScript
* **Database / ORM:** PostgreSQL + Prisma
* **Caching & State:** Redis
* **Package Manager:** Yarn

## 📡 gRPC Interface (Protobuf)

The service exposes the following RPC methods via the `AuthService` controller:

### Standard Auth
* `SendOtp` — Checks user existence (creates if new) and dispatches OTP.
* `VerifyOtp` — Validates OTP, updates verification flags, and returns JWT.
* `Refresh` — Validates the refresh token and issues a new JWT pair.

### Telegram Auth Flow
* `TelegramInit` — Generates the Telegram OAuth widget URL.
* `TelegramVerify` — Validates Telegram's HMAC signature and generates a temporary `sessionId` in Redis (TTL: 5 mins).
* `TelegramComplete` — (Called by `bot-service`) Links the verified phone number to the account and exchanges the session for temporary JWT tokens in Redis (TTL: 2 mins).
* `TelegramConsume` — (Called by client/gateway) Exchanges the `sessionId` for the actual Access and Refresh tokens.

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# gRPC Transport
AUTH_GRPC_URL=0.0.0.0:50051

# Database (Prisma)
DATABASE_URL=postgresql://user:password@localhost:5432/qb1tycinema_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Telegram Bot Config
TELEGRAM_BOT_ID=your_bot_id
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_REDIRECT_ORIGIN=[https://qb1tycinema.kz](https://qb1tycinema.kz)

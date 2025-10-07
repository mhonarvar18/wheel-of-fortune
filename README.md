Wheel of Fortune — Microservices Architecture

A complete event-driven microservices system for user registration, referral, rewards, and gamified spins — built with NestJS, Sequelize, NATS, and MySQL.

🚀 Overview

This project implements a modular monorepo architecture using NestJS.
It contains several microservices that communicate asynchronously via NATS message broker.

The goal is to simulate a “Wheel of Fortune” experience with:

✅ User registration & authentication

🎁 Prize management (with seeding)

🌀 Spin system (random prize assignment)

💎 Points & referral tracking system

🧠 API Gateway handling all HTTP traffic

🧩 Architecture
apps/
├── api-gateway/       → REST gateway (JWT Auth + routes for all features)
├── identity/          → Auth, register/login, referral emit events
├── prize/             → Prize catalog + seeder + available prizes
├── spin/              → Spin logic + emits PRIZE_AWARDED event
└── points/            → Points system (balance, history, referrals)
libs/
└── common/            → Shared constants, NATS messages, DTOs, and types

🧠 How It Works
Flow	Description
1️⃣ Register / Login	User registers via api-gateway → identity microservice creates account and (if referral used) emits referral.signup event.
2️⃣ Referral System	points service listens to that event → gives +1 point to both referrer & referee.
3️⃣ Spin Wheel	User spins via api-gateway → spin service randomly selects a prize → emits prize.awarded event.
4️⃣ Prize Service	Provides list of all active prizes (with weights).
5️⃣ Points Service	Listens for prize.awarded → adds points (e.g. cash = +3, coupon = +1, etc).
6️⃣ API Gateway	Centralized REST layer (JWT Auth + permission checks).
⚙️ Technologies
Layer	Stack
Backend Framework	NestJS (v10+)
Database ORM	Sequelize + MySQL 8.4
Message Broker	NATS (event-driven)
Cache / PubSub	Redis (optional)
Auth	JWT (Passport.js)
Language	TypeScript (ES2023)
Containerization	Docker Compose
🧰 Services Summary
Service	Port	Description
🧩 api-gateway	3000	Central HTTP entrypoint, JWT, routes for spin/auth/points
👤 identity	NATS only	Handles register/login, emits referral.signup
🎁 prize	NATS only	Seeds and lists all prizes
🌀 spin	NATS only	Executes spin, emits prize.awarded
💎 points	NATS only	Manages user points, balance, and history
🗂️ Environment Variables

Create .env in project root:

# Database
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASS=root

# JWT
JWT_SECRET=dev

# NATS
NATS_URL=nats://nats:4222

# Ports
PORT=3000

🐳 Docker Compose

To spin up local infrastructure (MySQL, phpMyAdmin, Redis, NATS):
```yml
services:
  mysql:
    image: mysql:8.4
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root
    ports: ["3306:3306"]
    volumes: [ "mysql_data:/var/lib/mysql" ]
    command: [
      'mysqld',
      '--default-authentication-plugin=mysql_native_password',
      '--character-set-server=utf8mb4',
      '--collation-server=utf8mb4_unicode_ci'
    ]

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    environment:
      PMA_HOST: mysql
      PMA_PORT: 3306
      PMA_USER: root
      PMA_PASSWORD: root
    ports: ["8081:80"]

  redis:
    image: redis:7
    ports: ["6379:6379"]

  nats:
    image: nats:2
    ports: ["4222:4222"]

volumes:
  mysql_data:
```

Run:

```bash
docker compose up -d
```

Access:

📊 phpMyAdmin → http://localhost:8081

🐬 MySQL → localhost:3306

🔵 NATS → nats://localhost:4222

🧪 Running the System
1️⃣ Install dependencies
npm install

2️⃣ Start all microservices (in separate terminals)
# 1) Identity
```bash
npm run start:dev:identity
```

# 2) Prize
```bash
npm run start:dev:prize
```

# 3) Spin
```bash
npm run start:dev:spin
```

# 4) Points
```bash
npm run start:dev:points
```

# 5) API Gateway
```bash
npm run start:dev:api-gateway
```

🧩 API Endpoints (via API Gateway)
Endpoint	Method	Description
/api/auth/register	POST	Register new user
/api/auth/login	POST	Login (returns JWT)
/api/prizes	GET	List all active prizes
/api/spin	POST	Execute spin (JWT required)
/api/points/balance	GET	Get current balance
/api/points/history	GET	Get user point history
🧠 Event System (NATS Topics)
Event	Producer	Consumer	Description
auth.register	API Gateway → Identity	—	Register user
auth.login	API Gateway → Identity	—	Login user
referral.signup	Identity	Points	+1 to referrer/referee
prize.list	API Gateway → Prize	—	Get prize list
prize.available	Spin → Prize	—	Available prizes
prize.awarded	Spin	Points	Add points after winning
points.apply	Any	Points	Apply manual point
points.balance	API Gateway → Points	—	Fetch current balance
points.history	API Gateway → Points	—	Fetch point history
🧬 Example Flow

1️⃣ User A registers → gets referral code
2️⃣ User B registers using A’s code
→ referral.signup event triggers → Points gives +1 to A and B
3️⃣ B logs in → calls /api/spin
→ Spin picks random prize → emits prize.awarded
→ Points adds +1/+3 accordingly
4️⃣ /api/points/history shows all events

📦 Database Schema Overview
users (Identity)
id	mobile	password	referralCode	createdAt
prizes (Prize)

| id | name | type | weight | oneTimePerUser | active |

spins (Spin)

| id | userId | prizeId | createdAt |

point_entries (Points)

| id | userId | delta | reason | externalId | meta | createdAt |

point_balances (Points)

| userId | balance | updatedAt |

🧠 Design Highlights

Event-driven communication (loose coupling)

Idempotent operations (externalId on Points)

Seeding system for prizes

Centralized JWT Auth at API Gateway

Type-safe DTOs via libs/common

MySQL auto-initialization via ensureDatabaseExists()

Resilient connections (retry logic for Sequelize & NATS)

🧾 TODO / Next Steps

 Implement purchase system (points deduction)

 Add “spin history” for users

 Add admin endpoints to update prize weights

 Integrate notification service (optional)

 Unit & e2e tests (Jest)

🧑‍💻 Author

Mohammad / @botnevis
Backend developer & system designer.
🚀 Building scalable, event-driven backends with NestJS
# Lapak UI

Lapak UI is a web-based peer-to-peer marketplace and social community platform designed specifically for students at Universitas Indonesia. The platform integrates a local product listing directory, a secure and structured cash-on-delivery (COD) reservation engine, and an internal campus social feed.

The system is built to minimize the risk of transaction ghosting while enabling smooth and verified digital and physical exchanges within the campus ecosystem.

---

## Component Architecture

The platform consists of four primary integrated systems:

* **Marketplace Directory:** Allows verified student sellers to list products or services under specific campus faculties, price ranges, and conditions. Buyers can filter listings by proximity to their faculty to facilitate physical COD meetings.
* **Reservation Engine (Redis-powered):** Manages buyer product reservations. Once reserved, the product state shifts to "Reserved" in PostgreSQL, and a matching key with a Time-To-Live (TTL) is created in Redis. If the seller does not accept the reservation within the chosen timeframe (2, 6, 12, or 24 hours), the Redis expiration event automatically reverts the product status back to "Available".
* **Real-time Notifier:** Dispatches alerts (in-app notifications and instant mobile messages via a dedicated Telegram Bot `@lapakui_bot`) upon critical changes in the transactional state.
* **Admin Dashboard:** A central panel providing administrators with consolidated platform statistics (user volume, active listings, transaction logs, and feed moderation options) served with ultra-low latency through Redis caching.

---

## Technical Stack

* **Frontend and Server:** Next.js 16.2.5 (App Router), React, TypeScript, Tailwind CSS
* **Database and ORM:** PostgreSQL (Supabase), Prisma ORM
* **Caching and State Management:** Redis (Upstash)
* **API Integrations:** Telegram Bot API
* **Deployment:** Vercel (Production environments)

---

## Database Scenarios and System Lifecycle

### 1. User Registration and Verification
Students sign up using their official university email addresses. The system parses and stores their department or faculty information, ensuring all sellers and buyers are authentic campus members before allowing transactional access.

### 2. Product Upload and Discovery
Sellers create listings by supplying a title, price, descriptions, multiple product images, condition tags, negotiable flags, and preferred faculty locations for COD. Buyers browse the catalog using faceted search filters to isolate products located near their own departments.

### 3. Anti-Ghosting COD Reservation Flow
When a buyer clicks "Reserve", the listing is locked. If the seller approves, a COD schedule is established, and Telegram notifications are fired. 
If the time limit expires before seller approval or transaction completion, the Upstash Redis expiration callback automatically unlocks the listing in PostgreSQL.

### 4. Transaction Resolution
Upon meeting physically, the seller marks the transaction as "Completed". The database changes the product status to "Completed", logs the transaction details for historical analysis, and prompts the buyer to leave a review and rating for the seller.

---

## Caching Strategy and Database Resilience

Lapak UI implements a hybrid database model utilizing PostgreSQL for persistent transactional storage and Redis for high-performance memory operations.

### Secondary Database Caching (Upstash Redis)
* **Transaction Expiry:** Redis handles the TTL counters for COD reservations. This keeps high-frequency timer state mutations out of the core PostgreSQL relational engine.
* **Admin Statistics Caching:** Analytical queries (e.g., aggregate user counts, transaction volumes) are cached in Redis for 10 minutes, reducing Supabase database resource utilization.
* **Resilience Fallback Layer:** The connection helper handles potential caching service outages. If the Redis server is unreachable, the system triggers a fallback proxy, conducting queries directly against the PostgreSQL primary database to ensure 100% application uptime.

---

## System Design and Diagrams

### 1. Unified Modeling Language (UML) Use Case
Shows the operational boundaries and actor interactions for students, sellers, buyers, and administrators.

![UML Diagram](diagrams/uml-lapakui.png)

### 2. Entity Relationship Diagram (ERD)
The relational database layout normalized to Third Normal Form (3NF) to guarantee structural integrity and zero data redundancy.

![ERD Diagram](diagrams/erd-lapakui.png)

### 3. System Flowchart
Represents the structural data flow, decision nodes, and the asynchronous Redis expiration event triggers.

![Flowchart Diagram](diagrams/flowchart-lapakui.png)

---

## Installation and Setup Guide

### Prerequisites
* Node.js version 18.0.0 or higher
* PostgreSQL database instance
* Upstash Redis database instance

### Quick Start Setup:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mrshlaf/lapak-ui.git
   cd lapak-ui
   ```

2. **Install node modules:**
   ```bash
   npm install
   ```

3. **Configure the Environment File (.env):**
   Create a `.env` file in the root directory and insert your credentials:
   ```env
   DATABASE_URL="postgresql://postgres.snppudadetnbpwolsnor:ABYsiapSBD.789@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   REDIS_URL="rediss://default:gQAAAAAAAe64AAIgcDIzM2Y2MjJlOTZjOWI0MDc1OTU4OTc4OTQ5Yjk2Mjk4Yg@inviting-airedale-126648.upstash.io:6379"
   JWT_SECRET="super-secret-jwt-key-for-lapak-ui"
   TELEGRAM_BOT_TOKEN="8658363649:AAF9M4SZta_kz_hixSnYYgZpLRPFYqzd7jk"
   TELEGRAM_BOT_USERNAME="lapakui_bot"
   NEXT_PUBLIC_APP_URL="https://lapak-ui.vercel.app"
   ```

4. **Sync the Database Schema:**
   ```bash
   npx prisma db push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## Exporting the Relational Schema (Database Dump)

To export the active database schemas and relational seeds to a `.sql` script, execute the following command:

```bash
pg_dump -h aws-1-ap-southeast-1.pooler.supabase.com -U postgres.snppudadetnbpwolsnor -d postgres -p 5432 -F p -f database/dump.sql
```

---

## Development Progress Report

### Progress Log: System Verification and Mentoring Session
Focuses on full database integration, schema verification, Redis caching setup, and end-to-end transaction testing with the assistant mentor.

![Progress Report](progress/progress-lapakui.png)

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

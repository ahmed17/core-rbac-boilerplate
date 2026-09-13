# Core RBAC Boilerplate (Next.js 15)

A production-ready Next.js 15 boilerplate focused on **Security**, **Dynamic Role-Based Access Control (RBAC)**, and **Premium Glassmorphism UI**.

This repository is designed to give you a massive head start when building administrative dashboards, SaaS platforms, or any application requiring strict, database-driven user permissions.

## 🌟 Key Features

- **Dynamic Database-Driven RBAC**: Menus, Roles, and Permissions are fully managed via the Database, not hardcoded.
- **Access-Aware Frontend**: Buttons and actions (Add, Edit, Delete) automatically hide themselves if the logged-in user lacks the required permissions.
- **Stealth Mode Proxy**: Unauthorized attempts to hit protected `/admin` routes return a `404 Not Found` instead of a redirect, preventing Directory Enumeration.
- **Audit Logging**: Every single mutation (Create, Update, Delete) and login attempt is recorded permanently.
- **Cloudflare Turnstile**: Built-in invisible CAPTCHA to protect Login and Registration endpoints from bots.
- **Account Lockout System**: Anti brute-force protection (locks account for 15 minutes after 5 failed attempts).
- **Idle Timeout**: Automatically logs users out after 60 minutes of inactivity.
- **Glassmorphism UI**: Beautiful, premium, and fully responsive design using Tailwind CSS v4 and `lucide-react`.

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Database ORM:** Prisma
- **Authentication:** NextAuth.js (v4)
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript

---

## 🚀 How to Run Locally

Follow these steps to test and run the application on your local machine.

### 1. Prerequisites
- Node.js (v18 or newer)
- A PostgreSQL Database (Local or Cloud like Supabase/Neon)

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/ahmed17/core-rbac-boilerplate.git
cd core-rbac-boilerplate
npm install
```

### 3. Environment Setup
Create a `.env` file in the root of the project. You can use `.env.example` as a template:
```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/db_rbac?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secure-random-string-here"

# Cloudflare Turnstile (Testing Keys)
NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
```

### 4. Database Initialization
Push the Prisma schema to your PostgreSQL database and generate the Prisma Client:
```bash
npx prisma generate
npx prisma db push
```

### 5. Seeding Initial Data
To make the app usable out-of-the-box, run the provided seed scripts. This will create the default `ADMIN` role, inject required permissions, and set up the default Menu structures.

```bash
# Creates the default admin account (admin@rbac.local / Admin123!)
npm run seed

# Synchronizes all permissions and menus into the database
npm run sync:permissions
```

### 6. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Default Admin Login:**
  - Email: `admin@rbac.local`
  - Password: `Admin123!`

---

## 🛡️ Beta Version Note
This boilerplate is currently in its **BETA** stage. All core architectural components (Middleware, NextAuth, RBAC Engine, UI Components) are stable and fully functioning.

Contributions and feedback are highly welcomed!

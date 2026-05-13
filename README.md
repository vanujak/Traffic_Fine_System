# 🚦 Traffic Fine Payment System

A full-stack digital traffic fine management platform for the Sri Lanka Police Department — developed as part of the Software Architecture module at the University of Ruhuna.

The system modernizes traffic fine collection by enabling motorists to pay fines digitally through mobile and web platforms while allowing senior police officials to monitor nationwide fine collections through an administrative dashboard.

---

# 📋 Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [System Objectives](#system-objectives)
- [System Architecture](#system-architecture)
- [Architecture Rationale](#architecture-rationale)
- [Technology Stack](#technology-stack)
- [Core Features](#core-features)
- [User Roles](#user-roles)
- [System Workflow](#system-workflow)
- [Database Design](#database-design)
- [Project Structure](#project-structure)
- [REST API Endpoints](#rest-api-endpoints)
- [Authentication & Security](#authentication--security)
- [Error Handling Strategy](#error-handling-strategy)
- [Logging & Monitoring](#logging--monitoring)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Git Workflow](#git-workflow)
- [Testing Strategy](#testing-strategy)
- [Future Enhancements](#future-enhancements)
- [Team Members](#team-members)
- [License](#license)

---

# Overview

The Traffic Fine Payment System is designed to digitalize and simplify the process of issuing, paying, and monitoring traffic fines in Sri Lanka.

Traditionally, drivers must manually settle fines through physical payment processes, resulting in delays, inconvenience, and inefficient monitoring. This system introduces a centralized digital solution that supports:

- On-the-spot traffic fine payments via Android application
- Online fine payments through a web portal
- SMS notifications after successful payments
- Administrative monitoring and reporting dashboards
- Secure JWT-based authentication and authorization

The platform consists of:

| Application | Purpose |
|---|---|
| 📱 Android App | On-the-spot fine payment |
| 🌐 Payment SPA | Online fine payment portal |
| 🖥️ Admin Portal | Monitoring and reporting dashboard |
| ⚙️ Backend REST API | Centralized business logic and data management |

---

# Problem Statement

The traditional traffic fine collection process in Sri Lanka is mostly manual and inefficient.

Common issues include:

- Long delays in fine settlement
- Difficulty tracking payments
- Lack of centralized monitoring
- Inconvenience for motorists
- Poor nationwide reporting and analytics
- Manual communication between officers and drivers

This project aims to address these issues through a secure and scalable digital platform.

---

# System Objectives

The primary objectives of the system are:

- Digitize traffic fine payment operations
- Enable immediate on-site fine payment
- Provide online payment accessibility
- Improve monitoring and transparency
- Reduce paperwork and manual processes
- Improve efficiency of traffic law enforcement
- Provide centralized nationwide reporting

---

# System Architecture

The system follows a Modular Monolith Architecture.

A single deployable backend application is internally separated into independent feature modules.

```text
Clients (Android / Payment SPA / Admin Portal)
          │
          ▼ HTTPS / REST API (JSON)
┌──────────────────────────────────────────┐
│           Express.js Backend             │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │         Global Middleware            │ │
│ │ JWT · CORS · Helmet · Rate Limit     │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌───────┐ ┌───────┐ ┌─────────┐          │
│ │ auth  │ │ fines │ │payment  │          │
│ └───────┘ └───────┘ └─────────┘          │
│                                          │
│ ┌──────────────┐ ┌───────────┐           │
│ │notifications │ │ reports   │           │
│ └──────────────┘ └───────────┘           │
│                                          │
│              Prisma ORM                  │
└──────────────────────────────────────────┘
          │                      │
          ▼                      ▼
    MySQL/PostgreSQL        SMS Gateway
                              (Twilio)
```

---

# Architecture Rationale

A Modular Monolith Architecture was selected because:

- It simplifies deployment and maintenance
- It reduces operational complexity
- It is suitable for medium-scale government systems
- It allows clean module separation
- It improves maintainability and extensibility
- It can later evolve into microservices if required

This architecture balances simplicity and scalability while supporting rapid development.

---

# Technology Stack

## Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| Prisma ORM | Database access layer |
| JWT | Authentication |
| bcryptjs | Password hashing |
| PostgreSQL / MySQL | Database |
| Twilio API | SMS notifications |
| Helmet | HTTP security |
| CORS | Cross-origin protection |
| express-rate-limit | Rate limiting |
| express-validator | Input validation |
| Morgan/Winston | Logging |

---

## Frontend (Web)

| Technology | Purpose |
|---|---|
| React + Vite | Frontend framework |
| Axios | HTTP communication |
| Tailwind CSS | UI styling |
| React Router | Client-side routing |

---

## Mobile Application

| Technology | Purpose |
|---|---|
| Kotlin or Flutter | Android mobile app |

---

# Core Features

## Authentication & Authorization

- JWT-based authentication
- Role-based access control
- Officer and Admin roles
- Password hashing using bcrypt

---

## Traffic Fine Management

- Issue traffic fines
- Generate unique reference numbers
- Lookup traffic fines by reference number
- Categorize traffic fines

---

## Payment System

- On-the-spot mobile payments
- Online web portal payments
- Payment validation
- Digital receipt generation

---

## SMS Notification System

- Notify officers after successful payment
- Automated payment confirmation alerts
- Future support for driver notifications

---

## Reporting Dashboard

- District-wise collections
- Fine category analysis
- Nationwide summaries
- Revenue monitoring

---

# User Roles

| Role | Responsibilities |
|---|---|
| 👮 Officer | Issue fines and receive payment notifications |
| 🧑 Public User | Pay fines via mobile or web portal |
| 🛡️ Admin | Monitor nationwide reports and collections |

---

# System Workflow

## On-the-Spot Payment Flow

```text
Traffic officer issues fine
        ↓
Driver receives reference number
        ↓
Driver opens Android application
        ↓
Driver enters fine details
        ↓
Backend validates fine
        ↓
Payment processed
        ↓
Database updated
        ↓
SMS sent to officer
        ↓
Driver retrieves license
```

---

## Online Payment Flow

```text
Driver visits payment web portal
        ↓
Enter reference number and category
        ↓
System validates fine details
        ↓
Driver submits payment
        ↓
Payment saved to database
        ↓
SMS notification sent
        ↓
Receipt generated
```

---

# Database Design

## Core Entities

| Entity | Description |
|---|---|
| User | Stores authentication details |
| Officer | Police officer information |
| Fine | Traffic fine details |
| FineCategory | Fine type and amount |
| Payment | Payment records |
| District | District information |
| SMSLog | SMS notification logs |

---

## Entity Relationships

```text
Officer ─── issues ─── Fine
Fine ─── belongs to ─── FineCategory
Fine ─── has ─── Payment
Officer ─── belongs to ─── District
Payment ─── generates ─── SMSLog
```

---

## Example Prisma Models

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      Role
  createdAt DateTime @default(now())
}

model Fine {
  id            Int      @id @default(autoincrement())
  referenceNo   String   @unique
  category      String
  amount        Float
  isPaid        Boolean  @default(false)
  createdAt     DateTime @default(now())
}

model Payment {
  id          Int      @id @default(autoincrement())
  fineId      Int
  amount      Float
  paidAt      DateTime @default(now())
}
```

---

# Project Structure

```text
traffic-fine-system/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   └── auth.service.js
│   │   │   │
│   │   │   ├── fines/
│   │   │   │   ├── fines.routes.js
│   │   │   │   ├── fines.controller.js
│   │   │   │   └── fines.service.js
│   │   │   │
│   │   │   ├── payments/
│   │   │   │   ├── payments.routes.js
│   │   │   │   ├── payments.controller.js
│   │   │   │   └── payments.service.js
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   ├── notifications.routes.js
│   │   │   │   └── sms.service.js
│   │   │   │
│   │   │   └── reports/
│   │   │       ├── reports.routes.js
│   │   │       ├── reports.controller.js
│   │   │       └── reports.service.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── jwtVerify.js
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js
│   │   │
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   │
│   │   └── app.js
│   │
│   ├── .env.example
│   └── package.json
│
├── payment-web/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/api.js
│   └── package.json
│
├── admin-web/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/api.js
│   └── package.json
│
├── android/
│   └── ...
│
└── README.md
```

---

# REST API Endpoints

# Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Register officer/admin | Public |
| POST | `/api/v1/auth/login` | Login and receive JWT | Public |

---

# Fines

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/v1/fines` | Create new fine | Officer |
| GET | `/api/v1/fines/:referenceNo` | Get fine details | Public |
| GET | `/api/v1/fines` | Get all fines | Admin |

---

# Payments

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/v1/payments` | Pay traffic fine | Public |
| GET | `/api/v1/payments/:id` | Get payment receipt | Public |

---

# Reports

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/v1/reports/district` | District collections | Admin |
| GET | `/api/v1/reports/category` | Category reports | Admin |
| GET | `/api/v1/reports/summary` | Nationwide summary | Admin |

---

# Authentication & Security

The system implements several security mechanisms:

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- CORS protection
- Helmet security headers
- Rate limiting against abuse
- Input validation using express-validator
- Centralized error handling

---

# Error Handling Strategy

A centralized global error middleware handles:

- Validation errors
- Authentication failures
- Authorization failures
- Database exceptions
- Unexpected server errors

Example response:

```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

---

# Logging & Monitoring

The backend includes logging for:

- API requests
- Authentication activity
- Payment transactions
- Error tracking
- SMS delivery events

Possible tools:

- Morgan
- Winston

---

# Payment Gateway Note

For academic purposes, the project may simulate payment processing.

Future versions can integrate real payment gateways such as:

- PayHere
- Stripe
- LankaPay
- Commercial bank payment APIs

---

# Environment Variables

Create a `.env` file inside `backend/`.

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/traffic_fines"

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# SMS
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+123456789
```

⚠️ Never commit `.env` files to GitHub.

---

# Getting Started

# Prerequisites

Install:

- Node.js v18+
- npm or yarn
- PostgreSQL/MySQL
- Git

---

# 1. Clone Repository

```bash
git clone https://github.com/your-org/traffic-fine-system.git
cd traffic-fine-system
```

---

# 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Run Prisma migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Start development server:

```bash
npm run dev
```

Backend server:

```text
http://localhost:5000
```

---

# 3. Payment Web Portal

```bash
cd ../payment-web
npm install
npm run dev
```

---

# 4. Admin Portal

```bash
cd ../admin-web
npm install
npm run dev
```

Admin portal runs on:

```text
http://localhost:5173
```

Default routes:

- `/` Dashboard
- `/fines` Fine register
- `/payments` Payments view
- `/reports` Reports view

---

# 5. Android Application

For Kotlin:

```text
Open android/ folder in Android Studio
```

For Flutter:

```bash
flutter pub get
flutter run
```

---

# Git Workflow

- Each member works on separate feature branches
- Commit regularly
- Open pull requests before merging
- Merge all work into `main` branch
- Avoid direct commits to `main`

Branch naming:

```text
feature/member-name/feature-name
```

Example:

```text
feature/kasun/payment-module
```

---

# Testing Strategy

The project will include:

- API endpoint testing
- Authentication testing
- Payment validation testing
- Frontend component testing
- Integration testing
- Manual system testing

Suggested tools:

- Postman
- Jest
- Supertest

---

# Future Enhancements

Possible future improvements:

- QR code-based fine lookup
- OCR license plate scanning
- Real payment gateway integration
- Email notifications
- Push notifications
- Multi-language support
- AI-based traffic analytics
- Microservices migration
- Docker deployment
- Cloud hosting support

---

# Team Members

| Name | Student ID | Responsibility |
|---|---|---|
| Member 1 | | Backend Core + Authentication |
| Member 2 | | Fine & Payment APIs |
| Member 3 | | Android Application |
| Member 4 | | Payment Web Portal |
| Member 5 | | Admin Dashboard |
| Member 6 | | SMS Integration + Testing + Git Management |

---

# Academic Information

| Module | Software Architecture |
|---|---|
| University | University of Ruhuna |
| Year | 2026 |
| Project Type | Group Project |

---

# License

This project is developed strictly for academic and educational purposes as part of the Software Architecture module at the University of Ruhuna.


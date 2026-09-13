# 🚀 SmartAttend

### Intelligent Student Attendance & Absence Monitoring System with CI/CD Automation

[![CI/CD Pipeline](https://github.com/smartattend/smart-attend/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/smartattend/smart-attend/actions/workflows/ci-cd.yml)
[![Node.js Version](https://img.shields.io/badge/Node.js-v20%2B-brightgreen)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 1. Project Overview

Traditional attendance systems only store whether a student is present or absent. They fail to identify students with consecutive absences, low attendance patterns, risky behaviors, or projected attendance shortages before it is too late.

**SmartAttend** solves this fundamental educational problem by providing an end-to-end intelligent platform with automated streak detection, early-warning risk categorization, day-of-week absence pattern detection, mathematical predictive trajectory modeling, and full CI/CD deployment automation.

---

## 🏗️ 2. System Architecture

```
                    ┌─────────────────┐
                    │      USERS      │
                    │                 │
                    │ Admin           │
                    │ Teacher         │
                    │ Student         │
                    └────────┬────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │     FRONTEND         │
                  │ React 18 + Vite      │
                  │ Responsive Dashboard │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │      BACKEND         │
                  │ Node.js + Express    │
                  │ JWT Authentication   │
                  │ Streak & Risk Engine │
                  │ Predictive Modeling  │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │      DATABASE        │
                  │ PostgreSQL / SQLite  │
                  └──────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
   Continuous Absence    Risk Analysis      Prediction
   (Streak Tracking)     (Safe/Warn/Crit)   (Mathematical)
          │                  │                  │
          └──────────────────┼──────────────────┘
                             ▼
                  In-App Notification Hub
```

---

## 🔥 3. All 10 Features Breakdown

| # | Feature | Description & Implementation |
|---|---|---|
| **1** | **Attendance Management** | Faculty selects Dept $\rightarrow$ Class $\rightarrow$ Subject $\rightarrow$ Date $\rightarrow$ Marks batch status (`Present`, `Absent`, `Leave`) with single-click save. |
| **2** | **Continuous Absence Detection ⭐** | Analyzes chronological records. If `Absent`: streak $+1$. If `Present`: streak resets to 0. Auto-flags 2, 3, and 5+ day streaks. |
| **3** | **Attendance Risk System** | 🟢 **Safe** ($\ge 75\%$), 🟡 **Warning** ($65\% - 74\%$), 🔴 **Critical** ($< 65\%$). |
| **4** | **Analytics Dashboard** | Live KPI metric cards, daily attendance line charts, present vs absent distribution, and weekly trends. |
| **5** | **Automatic Alert System** | Real-time in-app notification triggers delivered to faculty, students, and administration upon streak or threshold violation. |
| **6** | **Most Regular Students (Leaderboard 🏆)** | Ranks students by attendance percentage: $\frac{\text{Present}}{\text{Total}} \times 100$. |
| **7** | **Absence Pattern Analysis 🤖** | Analyzes day-of-the-week distribution (Mondays, Fridays) to identify recurring absenteeism trends. |
| **8** | **Attendance Prediction 🤖** | Mathematical trajectory model: computes projected final percentage and exact classes needed to maintain $\ge 75\%$. |
| **9** | **Leave Management** | Complete application lifecycle (Medical, On-Duty, Personal) with faculty review and auto-syncing attendance to `Leave`. |
| **10** | **Smart Student Profile** | 360-degree comprehensive dossier summarizing personal metrics, streaks, risk classification, pattern graph, and history log. |

---

## 👥 4. Demo User Accounts

The database comes pre-seeded with realistic institutional data:

| Role | Name | Email | Password | Notable Attributes |
|---|---|---|---|---|
| 👑 **Admin** | System Admin | `admin@smartattend.edu` | `admin123` | Full institution monitoring & student CRUD |
| 👨‍🏫 **Teacher** | Prof. Ramesh | `teacher@smartattend.edu` | `teacher123` | Faculty attendance entry & leave approval |
| 🎓 **Student** | **Mukil Nila** | `mukil@smartattend.edu` | `student123` | **4-Day Absent Streak**, Friday absence pattern |
| 🎓 **Student** | **Mousiga** | `mousiga@smartattend.edu` | `student123` | **Leaderboard #1 (98% Regular)** |
| 🎓 **Student** | **Nagendran** | `nagendran@smartattend.edu` | `student123` | **Leaderboard #2 (96% Regular)** |
| 🎓 **Student** | **Muthu Ajay** | `ajay@smartattend.edu` | `student123` | **Warning Risk Tier (70%)** |
| 🎓 **Student** | **Kumar Vel** | `kumar@smartattend.edu` | `student123` | **Critical Shortage Tier (55%)** |

---

## 🚀 5. Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Setup Backend
```bash
cd backend
npm install
npm run seed     # Seeds realistic students, 30 days attendance history, streaks & alerts
npm start        # Launches server on http://localhost:5000
```

### 2. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev      # Launches React app on http://localhost:3000
```

Open `http://localhost:3000` in your web browser. Click any of the **Instant Demo Access** buttons to explore the system!

---

## 🧪 6. Automated Testing

Run the automated Jest test suite covering streaks, risk thresholds, predictions, and auth:

```bash
cd backend
npm test
```

---

## 🐳 7. Docker Containerization

Run the entire full-stack system (PostgreSQL 16, Node.js backend, React Nginx frontend) with a single command:

```bash
docker-compose up --build
```

- Frontend: `http://localhost`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`

---

## 🔄 8. CI/CD GitHub Actions Pipeline

The project includes an enterprise-grade GitHub Actions workflow (`.github/workflows/ci-cd.yml`) executing on every push and pull request:

1. **Stage 1: Checkout Code**
2. **Stage 2: Setup Node.js & Install Dependencies**
3. **Stage 3: Automated Test Suite Execution (Jest)**
4. **Stage 4: Frontend Compilation & Verification (`npm run build`)**
5. **Stage 5: Multi-Stage Docker Container Builds**
6. **Stage 6: Automated Continuous Deployment to Cloud (Render / Railway)**

---

## 📄 9. License

This project is open-source under the [MIT License](LICENSE).

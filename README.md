## In VS Code

1. In the Explorer panel (left sidebar), click on the **`finance-tracker`** root folder
2. Click the **New File** icon
3. Name it **`README.md`**
4. Paste this entire content:

```markdown
# 💰 FinTrack — AI-Powered Personal Finance Tracker

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-purple?logo=openai)
![License](https://img.shields.io/badge/License-MIT-yellow)

A full-stack personal finance tracker with real-time budget alerts, AI-powered spending insights, and beautiful analytics dashboards.

---

## 🖥️ Live Demo

> 🔗 Frontend: [fintrack.vercel.app](https://fintrack.vercel.app)  
> 🔗 Backend API: [fintrack-api.onrender.com](https://fintrack-api.onrender.com)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register & login
- 💸 **Transaction Management** — Add, edit, delete income & expenses
- 📊 **Analytics Dashboard** — Balance, savings rate, category pie chart
- 🤖 **AI Insights** — GPT-4o-mini analyzes spending, gives personalized tips
- 🔔 **Real-Time Budget Alerts** — WebSocket push notifications at 90% of limit
- 📄 **PDF Reports** — Download monthly financial summaries
- 📱 **Responsive UI** — Clean design on desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express 5, Socket.IO |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs |
| AI | OpenAI GPT-4o-mini |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📁 Project Structure

```
finance-tracker/
├── backend/
│   ├── src/
│   │   ├── config/        # Database connection
│   │   ├── middleware/    # JWT auth middleware
│   │   ├── models/        # User, Transaction, Budget schemas
│   │   ├── routes/        # REST API routes
│   │   ├── services/      # AI insights + budget alert engine
│   │   └── server.js      # Express + Socket.IO entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios with JWT interceptors
│   │   ├── components/    # StatCard, Charts, BudgetBar, etc.
│   │   ├── context/       # Auth context (React Context API)
│   │   ├── hooks/         # useBudgetAlerts (WebSocket)
│   │   ├── pages/         # Dashboard, Transactions, Budgets
│   │   └── App.jsx
│   └── package.json
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- OpenAI API key (optional — falls back to rule-based insights)

### 1. Clone the repo

```bash
git clone https://github.com/abbu11/finance-tracker.git
cd finance-tracker
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/financetracker
JWT_SECRET=your_secret_key_min_32_chars
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=sk-...
```

```bash
npm run dev
```

### 3. Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

### 4. Visit

```
http://localhost:5173
```

---

## 🔌 API Reference

### Auth — `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login, returns JWT |
| GET | `/me` | Get current user 🔒 |

### Transactions — `/api/transactions`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/?month=&category=&type=` | List with filters 🔒 |
| POST | `/` | Create transaction 🔒 |
| PUT | `/:id` | Update transaction 🔒 |
| DELETE | `/:id` | Delete transaction 🔒 |
| GET | `/summary` | Monthly totals + breakdown 🔒 |

### Budgets — `/api/budgets`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | All budgets with spend % 🔒 |
| POST | `/` | Create or update budget 🔒 |
| DELETE | `/:id` | Remove budget 🔒 |

### AI & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/insights` | AI spending insights 🔒 |
| GET | `/api/reports/monthly?month=2026-05` | Download PDF 🔒 |

> 🔒 Requires `Authorization: Bearer <token>` header

---

## 🧠 AI Insights Architecture

Two-tier design for reliability and cost efficiency:

**Tier 1 — Rule-based (always runs, instant, free)**
- Detects month-over-month overspending (>30% increase triggers alert)
- Calculates savings rate, flags if below 10%
- Identifies top spending category

**Tier 2 — GPT-4o-mini (runs if API key present)**
- Receives full spending breakdown as structured prompt
- Returns 3 personalized, actionable tips referencing real numbers
- Gracefully falls back to rule-based if API call fails

---

## 🔔 Real-Time Budget Alerts

```
User adds expense
      ↓
Budget checker runs async (non-blocking)
      ↓
Spend ≥ 90% of limit?
      ↓ Yes
Socket.IO emits to user's private room
      ↓
Toast notification appears instantly in browser
```

---

## 🌐 Deployment

### Backend → Render
1. Push to GitHub
2. New Web Service on [render.com](https://render.com)
3. Build: `npm install` | Start: `npm start`
4. Add environment variables in Render dashboard

### Frontend → Vercel
1. Import repo on [vercel.com](https://vercel.com)
2. Add env: `VITE_API_URL=https://your-api.onrender.com/api`
3. Deploy

---

## 🔮 Future Improvements

- [ ] Email alerts via Nodemailer when budget exceeded
- [ ] Recurring transactions support
- [ ] Multi-currency support
- [ ] Bank account sync via Plaid API
- [ ] Mobile app with React Native
- [ ] Annual tax report export

---

## 👨‍💻 Author

**Avaneesh Kumar**  
Final Year CS Student  
[GitHub](https://github.com/abbu11) · [LinkedIn](https://linkedin.com/in/yourprofile)

---

## 📄 License

MIT — free to use for learning and portfolio purposes.
```

---
<div align="center">

# 💎 FinanceMore

### Your Complete Personal Finance Command Center

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-8+-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)

**Track income, expenses, assets, liabilities — and let AI analyze your financial health.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [API Reference](#-api-reference) • [Screenshots](#-screenshots) • [Contributing](#-contributing)

---

</div>

## ✨ Features

### 📊 Dashboard & Analytics
- **Net Worth Tracker** — Real-time calculation of assets minus liabilities
- **Financial Health Score** — AI-powered 0–100 score with letter grade (A–F)
- **Budget Alerts** — 🔔 Severity-based notifications when spending approaches or exceeds category budgets
- **Interactive Charts** — Pie charts, bar charts, and area charts powered by Recharts
- **AI Insights** — Automated feedback on savings rate, debt-to-income ratio, and emergency fund

### 💵 Income Tracking
- **Multiple Sources** — Track salary, freelance, business, rental, investments, dividends, and more
- **Recurring Income** — Tag income as recurring with monthly/quarterly/yearly frequency
- **Source Distribution** — Visual breakdown of income by source with pie charts
- **Monthly Equivalent** — Auto-calculates monthly value for all frequencies

### 💰 Asset Management
- **9 Asset Types** — Savings, FDs, Stocks, Mutual Funds, Gold, Crypto, PPF, NPS, and more
- **Profit/Loss Tracking** — Real-time P&L calculations with return percentages
- **Portfolio Diversification** — Visual allocation across asset types

### 🏦 Liability Management
- **6 Loan Types** — Home, Car, Personal, Education, Credit Card, and others
- **EMI Tracking** — Monthly EMI totals with outstanding balance monitoring
- **Interest Calculator** — Auto-computed total interest and months remaining

### 📝 Expense Tracking
- **10 Categories** — Food, Transport, Utilities, Entertainment, Shopping, Health, Education, Rent, Groceries, Other
- **Budget Management** — Set monthly limits per category with progress tracking
- **Daily Trend Charts** — Visualize spending patterns over time
- **Category Breakdown** — Pie chart showing where your money goes

### 🔄 Recurring Expenses
- **Subscription Tracker** — Netflix, rent, EMIs, gym — all auto-tracked
- **Flexible Frequencies** — Daily, weekly, monthly, or yearly
- **Auto-Generate** — One-click generation of due expenses into actual transactions
- **Pause/Resume** — Toggle recurring items on/off without deleting

### 🤖 AI Financial Advisor
- **Smart Chat** — Context-aware chatbot that understands your complete financial picture
- **Financial Analysis** — Deep-dive analysis covering savings rate, DTI ratio, emergency fund, and diversification
- **Personalized Tips** — Actionable recommendations based on your actual data
- **Health Grading** — Composite scoring across 5+ financial health metrics

### 🌙 Dark & Light Theme
- **One-Click Toggle** — Switch between dark and light modes instantly
- **Persistent Preference** — Your choice is saved across sessions
- **Premium Aesthetics** — Glassmorphism, gradients, and micro-animations in both themes

### 🔐 Authentication & Security
- **JWT Authentication** — Secure token-based auth with 30-day expiry
- **Password Hashing** — bcrypt with salt rounds
- **Protected Routes** — All financial data is user-scoped and requires authentication

---

## 🛠 Tech Stack

<div align="center">

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, React Router 7, Recharts 3 |
| **Styling** | Vanilla CSS with CSS Custom Properties (Design System) |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB with Mongoose 9 ODM |
| **Auth** | JSON Web Tokens (JWT) + bcryptjs |
| **Dev Tools** | OxLint, Vite HMR |

</div>

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **MongoDB** — Running locally or a cloud URI (MongoDB Atlas)
- **npm** ≥ 9.x

### 1. Clone the Repository

```bash
git clone https://github.com/divyanshu-chhabra/finance-tracker-system.git
cd finance-tracker-system
```

### 2. Setup the Server

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/financemore
JWT_SECRET=your_super_secret_key_here_min_64_chars
```

> ⚠️ **Important**: Generate a strong JWT secret:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

Start the server:

```bash
npm start
```

### 3. Setup the Client

```bash
cd ../client
npm install
npm run dev
```

### 4. Open the App

Navigate to **http://localhost:5173** in your browser. Register an account and start tracking!

---

## 🏗 Architecture

```
finance-tracker-system/
├── client/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   └── Sidebar/             # Navigation + Theme Toggle
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Authentication state
│   │   │   └── ThemeContext.jsx      # Dark/Light theme state
│   │   ├── pages/
│   │   │   ├── Auth/                 # Login & Registration
│   │   │   ├── Dashboard/            # Overview + Budget Alerts
│   │   │   ├── Income/               # Income tracking + charts
│   │   │   ├── Assets/               # Asset management
│   │   │   ├── Liabilities/          # Liability management
│   │   │   ├── Expenses/             # Daily expense tracking
│   │   │   ├── RecurringExpenses/    # Subscription management
│   │   │   └── AIBot/                # AI financial advisor
│   │   ├── services/
│   │   │   └── api.js                # All API calls
│   │   ├── utils/
│   │   │   └── helpers.js            # Formatters, constants, colors
│   │   ├── App.jsx                   # Root component + routing
│   │   └── index.css                 # Global design system + themes
│   └── package.json
│
├── server/                          # Express Backend
│   ├── config/
│   │   └── db.js                     # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js         # Register, Login, Profile
│   │   ├── aiController.js           # AI analysis, chat, dashboard
│   │   ├── assetController.js        # Asset CRUD
│   │   ├── liabilityController.js    # Liability CRUD
│   │   ├── expenseController.js      # Expenses + Budgets + Alerts + Export
│   │   ├── incomeController.js       # Income CRUD + Summary
│   │   └── recurringExpenseController.js  # Recurring CRUD + Generate
│   ├── middleware/
│   │   └── auth.js                   # JWT verification
│   ├── models/
│   │   ├── User.js                   # User schema + password hashing
│   │   ├── Asset.js                  # Asset schema + P&L virtuals
│   │   ├── Liability.js              # Liability schema + EMI virtuals
│   │   ├── Expense.js                # Expense schema
│   │   ├── Budget.js                 # Budget schema (per category/month)
│   │   ├── Income.js                 # Income schema + monthly equivalent
│   │   └── RecurringExpense.js       # Recurring schema + next due date
│   ├── routes/
│   │   ├── auth.js
│   │   ├── assets.js
│   │   ├── liabilities.js
│   │   ├── expenses.js
│   │   ├── ai.js
│   │   ├── income.js
│   │   └── recurringExpenses.js
│   ├── server.js                     # Express entry point
│   └── package.json
│
├── LICENSE
└── README.md
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login & get JWT token |
| `GET` | `/api/auth/me` | Get current user profile |
| `PUT` | `/api/auth/me` | Update user profile |

### Income
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/income` | Get all income entries (with filters) |
| `POST` | `/api/income` | Create income entry |
| `PUT` | `/api/income/:id` | Update income entry |
| `DELETE` | `/api/income/:id` | Delete income entry |
| `GET` | `/api/income/summary` | Get recurring income summary |

### Assets
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/assets` | Get all assets + summary |
| `POST` | `/api/assets` | Create asset |
| `PUT` | `/api/assets/:id` | Update asset |
| `DELETE` | `/api/assets/:id` | Delete asset |

### Liabilities
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/liabilities` | Get all liabilities + summary |
| `POST` | `/api/liabilities` | Create liability |
| `PUT` | `/api/liabilities/:id` | Update liability |
| `DELETE` | `/api/liabilities/:id` | Delete liability |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/expenses` | Get expenses (with date/category filters) |
| `POST` | `/api/expenses` | Create expense |
| `PUT` | `/api/expenses/:id` | Update expense |
| `DELETE` | `/api/expenses/:id` | Delete expense |
| `GET` | `/api/expenses/budgets` | Get budgets for a month |
| `POST` | `/api/expenses/budgets` | Set/update a budget |
| `GET` | `/api/expenses/budget-alerts` | Get budget alert notifications |
| `GET` | `/api/expenses/export` | Export expenses as CSV |

### Recurring Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/recurring-expenses` | Get all recurring expenses |
| `POST` | `/api/recurring-expenses` | Create recurring expense |
| `PUT` | `/api/recurring-expenses/:id` | Update recurring expense |
| `DELETE` | `/api/recurring-expenses/:id` | Delete recurring expense |
| `PATCH` | `/api/recurring-expenses/:id/toggle` | Pause/resume recurring |
| `POST` | `/api/recurring-expenses/generate` | Generate due expenses |

### AI & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/ai/analyze` | Full financial health analysis |
| `POST` | `/api/ai/chat` | Chat with AI advisor |
| `GET` | `/api/ai/dashboard` | Dashboard summary data |

---

## 🎨 Design System

FinanceMore uses a comprehensive CSS design system built with **CSS Custom Properties**:

- **🎨 Color Palette** — Primary (Blue-Purple), Accent (Emerald), semantic colors for success/warning/danger
- **🌗 Dual Themes** — Complete dark and light mode with `[data-theme]` attribute switching
- **✨ Glassmorphism** — Frosted glass effects with `backdrop-filter: blur()`
- **🎭 Animations** — fadeIn, scaleIn, slideIn, float, pulse, shimmer, and spin keyframes
- **📐 Responsive** — Mobile-first with breakpoints at 480px, 640px, 768px, and 1024px
- **🔤 Typography** — Inter font family with 9 size steps from `xs` (0.75rem) to `5xl` (3rem)

---

## 🗺️ Roadmap

- [ ] Real AI integration (LLM-powered chatbot via Gemini/OpenAI API)
- [ ] Export to CSV/PDF reports
- [ ] Goal tracking (savings targets with deadlines)
- [ ] Multi-currency support with live exchange rates
- [ ] PWA support for mobile usage
- [ ] Email/push notifications for budget alerts
- [ ] Bill reminders and calendar integration
- [ ] Investment portfolio sync via broker APIs

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for smarter personal finance management**

⭐ Star this repo if you find it useful!

</div>
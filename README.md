# AI Interview Prep

A full-stack (MERN) AI-powered interview preparation platform. Users pick a target job role,
practice technical/HR/behavioral/coding interview questions, get AI-generated scoring and
feedback on every answer, and track their progress over time.

Built as a portfolio / B.Tech final-year project.

---

## Features

- **Landing page** — hero, features grid, "how it works", popular roles, CTA
- **Authentication** — register/login with JWT, bcrypt password hashing, protected routes
- **Dashboard** — stats (interviews completed, questions practiced, average score, streak),
  a radar progress chart, recent interviews
- **Interview Practice** — choose job role, experience level, interview type, difficulty
- **AI Mock Interview** — live question-by-question flow with a timer, text answers, skip,
  and instant AI-generated scoring + structured feedback (strengths, improvements, a
  model answer, and a recommendation)
- **Question Bank** — searchable, filterable by category/difficulty, bookmarkable
- **Interview History** — every completed session with a performance label, drill into
  full question-by-question feedback
- **Progress Tracking** — score-over-time line chart, average score by role bar chart,
  and auto-generated AI insights
- **Profile** — update name, target role, experience level, skills, password
- **Light / dark mode**, fully responsive (mobile / tablet / desktop)

## Tech Stack

**Frontend:** React 18, React Router, Axios, Tailwind CSS, Recharts, Lucide icons, Vite
**Backend:** Node.js, Express, JWT auth, bcryptjs, RESTful APIs
**Database:** MongoDB + Mongoose

## AI Integration

`backend/services/aiService.js` is the single place all "AI" behaviour lives:

- **Question generation** — pulls from a categorized question bank (JavaScript, React,
  Node.js, MongoDB, HR, Behavioral, Coding) filtered by role/type/difficulty. Works with
  **zero configuration and zero cost.**
- **Answer evaluation** — by default uses a deterministic rule-based scorer (answer length,
  keyword relevance to the question, presence of examples) to produce technical accuracy,
  communication, confidence, relevance and overall scores, plus structured feedback.
- **Optional real LLM** — if you set `AI_API_KEY` and `AI_API_URL` in `backend/.env`, the
  service will call a real model (written for the Anthropic Messages API — easy to adapt to
  OpenAI or another provider) and use its JSON response instead. If the call fails for any
  reason, it silently falls back to the rule-based evaluator, so the app never breaks.

This design means the whole platform is fully functional out of the box for a demo or
grading, without requiring any paid API key.

---

## Project Structure

```
ai-interview-prep/
├── backend/
│   ├── config/db.js
│   ├── controllers/        # authController, userController, interviewController,
│   │                        # questionController, feedbackController
│   ├── middleware/         # authMiddleware (JWT), errorMiddleware
│   ├── models/              # User, Interview, Question, Feedback
│   ├── routes/               # authRoutes, userRoutes, interviewRoutes,
│   │                        # questionRoutes, feedbackRoutes
│   ├── services/aiService.js
│   ├── seed.js              # populates the question bank
│   ├── server.js
│   └── .env.example
│
└── frontend/
    └── src/
        ├── components/      # Navbar, Footer, Card, Button, ProtectedRoute, Loader, Toast
        ├── context/         # AuthContext, ThemeContext
        ├── pages/           # Home, Login, Register, Dashboard, Interview, MockInterview,
        │                    # Questions, History, Progress, Profile, About, NotFound
        ├── services/api.js  # Axios instance + all API calls
        ├── App.jsx
        └── main.jsx
```

---

## Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:


```bash
npm run seed
```

Start the server:

```bash
npm run dev      # with nodemon, auto-restarts on changes
# or
npm start
```

The API will be running at `http://localhost:5000`. Check `GET /api/health` to confirm.

### 2. Frontend

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` should contain:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:5173`.

### 3. Build for production

```bash
cd frontend
npm run build      # outputs to frontend/dist
```

Serve `frontend/dist` with any static host (Vercel, Netlify, Nginx, etc.), and deploy
`backend/` to any Node host (Render, Railway, EC2, etc.) with `MONGODB_URI` pointed at your
production database.

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | Port the Express server runs on (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs — use a long random string |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLIENT_URL` | Frontend origin, for CORS |
| `AI_API_KEY` | *(optional)* API key for a real LLM provider |
| `AI_API_URL` | *(optional)* Endpoint for a real LLM provider |

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, e.g. `http://localhost:5000/api` |

---

## API Documentation

All protected routes require `Authorization: Bearer <token>`.

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account — `{ name, email, password, confirmPassword, role, experienceLevel }` |
| POST | `/api/auth/login` | Log in — `{ email, password }` |
| GET | `/api/auth/me` | Get the current authenticated user |

### Users
| Method | Route | Description |
|---|---|---|
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update profile — `{ name, role, experienceLevel, skills, password? }` |
| GET | `/api/users/dashboard` | Dashboard stats, progress chart data, recent interviews |

### Interviews
| Method | Route | Description |
|---|---|---|
| POST | `/api/interviews` | Start a new interview — `{ jobRole, experienceLevel, interviewType, difficulty, questionCount? }` |
| GET | `/api/interviews` | List the user's interviews |
| GET | `/api/interviews/:id` | Get one interview + its feedback |
| POST | `/api/interviews/:id/answer` | Submit an answer — `{ question, answerText, skipped }` |
| POST | `/api/interviews/:id/complete` | Mark interview complete, compute overall score |

### Questions
| Method | Route | Description |
|---|---|---|
| GET | `/api/questions` | List/search questions — query params: `search, category, difficulty, jobRole, type, saved, page, limit` |
| GET | `/api/questions/:id` | Get one question |
| POST | `/api/questions` | Create a question (auth required) |
| POST | `/api/questions/:id/save` | Toggle bookmark on a question (auth required) |

### Feedback
| Method | Route | Description |
|---|---|---|
| GET | `/api/feedback/:interviewId` | All feedback docs for an interview |
| POST | `/api/feedback` | Create a feedback doc directly |

---

## MongoDB Setup

**Local:** install MongoDB Community Edition and run `mongod`. The default connection
string `mongodb://127.0.0.1:27017/ai-interview-prep` will just work.

**Atlas (free tier):**
1. Create a cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Add a database user and allow your IP (or `0.0.0.0/0` for development)
3. Copy the connection string into `MONGODB_URI` in `backend/.env`

## AI API Setup

No key is required — the app works fully with the built-in rule-based evaluator. To use a
real LLM instead, set `AI_API_KEY` and `AI_API_URL` in `backend/.env`. The included
implementation targets Anthropic's Messages API; swap the `fetch` call in
`services/aiService.js` to target OpenAI or another provider if preferred.

---

## Future Improvements

- Voice-based mock interviews (speech-to-text answers)
- Resume upload + AI resume feedback
- Company-specific question sets
- Peer/mentor review mode
- Email verification and password reset flow
- Admin panel for managing the question bank
- Java/Python-specific question banks (currently JS/React/Node/Mongo/HR/Behavioral/Coding)

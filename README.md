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
- , the
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


## Future Improvements

- Voice-based mock interviews (speech-to-text answers)
- Resume upload + AI resume feedback
- Company-specific question sets
- Peer/mentor review mode
- Email verification and password reset flow
- Admin panel for managing the question bank
- Java/Python-specific question banks (currently JS/React/Node/Mongo/HR/Behavioral/Coding)

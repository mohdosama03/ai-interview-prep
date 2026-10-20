# AI Interview Prep

A full-stack (MERN) AI-powered interview preparation platform. Users pick a target job role,
practice technical/HR/behavioral/coding interview questions, get AI-generated scoring and
feedback on every answer, and track their progress over time.


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



## AI Integration

`backend/services/aiService.js` is the single place all interview question and answer-assessment behaviour lives:

- **Question generation** — pulls from a categorized question bank (JavaScript, React,
  Node.js, MongoDB, HR, Behavioral, Coding) filtered by role/type/difficulty. Works with
- **Follow-up questions** — asks up to two relevant questions when important answer details
  are missing. Without a Gemini key, a conservative local prompt heuristic is used.
- **Evidence-based evaluation** — with Gemini configured, returns separate communication,
  technical, relevance, and supporting-evidence scores with exact answer excerpts and
  actionable feedback. Responses are schema-checked before scores are saved.
- **Safe failure handling** — if Gemini is unavailable, unconfigured, over quota, or returns
  invalid data, the answer is saved without invented scores and can be retried later.


### Run and verify

In PowerShell, from the project root:

Copy-Item backend/.env.example backend/.env
npm --prefix backend install
npm --prefix frontend install
```




npm --prefix backend run dev
npm --prefix frontend run dev
```

Run backend feedback tests and build the frontend with:

```powershell
npm --prefix backend test
npm --prefix frontend run build




## Future Improvements

- Voice-based mock interviews (speech-to-text answers)
- Resume upload + AI resume feedback
- Company-specific question sets
- Peer/mentor review mode
- Email verification and password reset flow
- Admin panel for managing the question bank
- Java/Python-specific question banks (currently JS/React/Node/Mongo/HR/Behavioral/Coding)

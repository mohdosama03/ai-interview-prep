# AI Interview Prep

A full-stack (MERN) AI-powered interview preparation platform. Users pick a target job role,
practice technical/HR/behavioral/coding interview questions, get AI-generated scoring and
feedback on every answer, and track their progress over time.

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

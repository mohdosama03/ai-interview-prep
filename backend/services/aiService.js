/**
 * aiService.js
 *
 * Central place for all "AI" behaviour: generating interview questions and
 * evaluating a candidate's answer.
 *
 * If AI_API_KEY / AI_API_URL are set in .env, callAIProvider() will call a
 * real LLM (written for the Anthropic Messages API, easy to swap for
 * OpenAI/others) and ask it to return structured JSON. If no key is
 * configured, everything falls back to a deterministic, rule-based
 * generator below so the whole app works out of the box with zero cost
 * and no external dependency.
 */

const QUESTION_BANK = {
  JavaScript: [
    "Explain the difference between let, const, and var in JavaScript.",
    "What is a closure? Give a practical example.",
    "How does the JavaScript event loop work?",
    "Explain the difference between == and ===.",
    "What are Promises and how do they differ from callbacks?",
    "Explain async/await and how it relates to Promises.",
    "What is the difference between null and undefined?",
    "Explain prototypal inheritance in JavaScript.",
  ],
  React: [
    "What is the Virtual DOM and why does React use it?",
    "Explain the difference between props and state.",
    "What are React Hooks? Name a few and their use cases.",
    "How does the useEffect hook work, and what is the dependency array for?",
    "What is the Context API and when would you use it over Redux?",
    "Explain React component lifecycle in functional components.",
    "How does React Router handle client-side navigation?",
  ],
  "Node.js": [
    "Explain the Node.js event loop and how it enables non-blocking I/O.",
    "What is middleware in Express.js, and how does it work?",
    "How would you design a REST API for a resource like 'interviews'?",
    "How do you handle authentication in a Node.js/Express app using JWT?",
    "What is the difference between CommonJS modules and ES Modules?",
  ],
  MongoDB: [
    "What is the difference between a relational database and MongoDB?",
    "Explain how indexing improves query performance in MongoDB.",
    "What is the aggregation pipeline used for in MongoDB?",
    "How do you model one-to-many relationships in MongoDB with Mongoose?",
  ],
  HR: [
    "Tell me about yourself.",
    "What are your greatest strengths and weaknesses?",
    "Why should we hire you?",
    "Where do you see yourself in 5 years?",
    "Describe a challenging situation at work/college and how you handled it.",
    "Why do you want to work at this company?",
  ],
  Behavioral: [
    "Describe a time you disagreed with a teammate. How did you resolve it?",
    "Tell me about a project you're proud of and your specific contribution.",
    "Describe a time you had to learn a new technology quickly.",
    "Tell me about a time you missed a deadline. What happened?",
  ],
  Coding: [
    "How would you reverse a linked list? Walk through your approach.",
    "Explain how you'd detect a cycle in a linked list.",
    "How would you find the two numbers in an array that sum to a target value?",
    "Explain the time complexity of common sorting algorithms.",
  ],
};

// Interview questions are organized by role and difficulty so that the
// selected setup options determine the actual questions in the session.
const ROLE_QUESTIONS = {
  "Frontend Developer": {
    Easy: [
      "What is the difference between HTML elements and semantic HTML elements?",
      "Explain the CSS box model and how padding affects an element's size.",
      "How do you make a webpage adapt to different screen sizes?",
      "What are props in React, and how does a component use them?",
      "What is the difference between let and const in JavaScript?",
    ],
    Medium: [
      "How do you decide whether React state belongs in a parent component or a child component?",
      "Explain how useEffect dependencies affect when an effect runs.",
      "How would you find and fix a slow render in a React page?",
      "How do event bubbling and event delegation work in browser interfaces?",
      "How would you make a form accessible to keyboard and screen-reader users?",
    ],
    Hard: [
      "How would you prevent stale data and race conditions in a React search interface?",
      "How would you split a large frontend application to improve loading performance?",
      "How would you design a reusable component system that supports multiple product themes?",
      "How would you investigate layout shifts and rendering bottlenecks in production?",
      "How would you test a complex frontend flow that depends on asynchronous API updates?",
    ],
  },
  "Backend Developer": {
    Easy: [
      "What is the purpose of middleware in an Express application?",
      "What makes an HTTP endpoint RESTful?",
      "When would you use a database index?",
      "How does a backend verify a user's password safely?",
      "What is the difference between authentication and authorization?",
    ],
    Medium: [
      "How would you design and validate a paginated REST endpoint?",
      "How would you prevent duplicate work when a client retries a payment request?",
      "When would you use a database transaction, and what problems can it prevent?",
      "How would you add caching to a frequently requested API without serving stale data indefinitely?",
      "How would you protect an API from abusive traffic and malformed input?",
    ],
    Hard: [
      "How would you make a background job safe to retry across multiple server instances?",
      "How would you diagnose rising latency in a service that depends on several databases and APIs?",
      "How would you design rate limiting that stays consistent across a horizontally scaled service?",
      "How would you migrate a large database table with no planned downtime?",
      "How would you keep data consistent when a workflow spans multiple services?",
    ],
  },
  "Full Stack Developer": {
    Easy: [
      "Describe how a browser form sends data to a backend API.",
      "What is the difference between client-side and server-side validation?",
      "How does a React page display data returned by an API?",
      "What is JSON, and why is it commonly used between a frontend and backend?",
      "How do you store and retrieve a record with a backend and database?",
    ],
    Medium: [
      "How would you implement login from a React form through an API to a protected page?",
      "How would you handle loading, success, and error states for a form that saves data?",
      "How would you keep a frontend list in sync after creating or updating a database record?",
      "How would you debug a request that works locally but fails in the browser due to CORS?",
      "How would you validate user input consistently on both the client and server?",
    ],
    Hard: [
      "How would you design a full-stack feature that supports optimistic updates and safe rollback?",
      "How would you secure a web application against XSS, CSRF, and unauthorized API access?",
      "How would you roll out a database schema change while old and new application versions run together?",
      "How would you trace a slow user action across the browser, API, and database?",
      "How would you design a resilient full-stack workflow when an external service is unavailable?",
    ],
  },
  "MERN Stack Developer": {
    Easy: [
      "What role do MongoDB, Express, React, and Node.js each play in a MERN application?",
      "How does a React component request data from an Express API?",
      "What is a Mongoose model used for?",
      "How does Node.js handle incoming HTTP requests?",
      "What is the purpose of React state in a data-driven page?",
    ],
    Medium: [
      "How would you build a protected MERN route using JWT authentication?",
      "How would you model a one-to-many relationship in MongoDB with Mongoose?",
      "How would you handle API errors consistently in an Express and React application?",
      "How would you avoid unnecessary database queries when rendering a React dashboard?",
      "How would you paginate and filter MongoDB results through an Express endpoint?",
    ],
    Hard: [
      "How would you secure and rotate JWT credentials in a production MERN application?",
      "How would you improve MongoDB query performance for a growing, heavily filtered collection?",
      "How would you design a MERN application to handle concurrent updates to the same record?",
      "How would you deploy a MERN application with separate frontend and backend origins securely?",
      "How would you instrument and troubleshoot a slow request across React, Express, and MongoDB?",
    ],
  },
  "Java Developer": {
    Easy: [
      "What is the difference between a Java class and an object?",
      "How do interfaces help organize Java code?",
      "What is the difference between int and Integer in Java?",
      "How does a try-catch block handle exceptions?",
      "What is the purpose of the Java Collections Framework?",
    ],
    Medium: [
      "How do HashMap and TreeMap differ, and when would you choose each?",
      "What makes an object immutable in Java, and when is immutability useful?",
      "How does dependency injection help structure a Spring application?",
      "How would you handle checked and unchecked exceptions in a service layer?",
      "What can cause a Java Stream pipeline to produce unexpected results?",
    ],
    Hard: [
      "How would you diagnose and resolve a race condition in a multithreaded Java service?",
      "How do garbage collection pauses affect latency, and how would you investigate them?",
      "How would you design a thread-safe cache with bounded memory usage?",
      "How would you structure a Spring service to keep transactions and external calls reliable?",
      "How would you investigate a memory leak in a long-running JVM application?",
    ],
  },
  "Python Developer": {
    Easy: [
      "What is the difference between a list and a tuple in Python?",
      "How do dictionaries store and retrieve key-value pairs?",
      "What is the purpose of a virtual environment in Python?",
      "How do you handle exceptions in Python?",
      "What is a list comprehension, and when is it useful?",
    ],
    Medium: [
      "How do Python generators differ from functions that return lists?",
      "How would you structure and validate a JSON API using a Python web framework?",
      "What are decorators, and how could one be used for logging or authorization?",
      "How would you find and improve a slow database query in a Python service?",
      "How do Python context managers help manage files or database connections?",
    ],
    Hard: [
      "How do the GIL and asynchronous I/O affect concurrency choices in a Python service?",
      "How would you profile memory use in a Python process that grows over time?",
      "How would you design a reliable task queue for long-running Python jobs?",
      "How would you make a Python API resilient to dependency timeouts and partial failures?",
      "How would you package and deploy a Python application reproducibly across environments?",
    ],
  },
  "Data Analyst": {
    Easy: [
      "How would you use SQL to filter rows and sort a result set?",
      "What is the difference between an average and a median?",
      "How would you check a dataset for missing or duplicate values?",
      "What makes a chart appropriate for comparing values across categories?",
      "What is the difference between a measure and a dimension in a report?",
    ],
    Medium: [
      "How would you use a SQL window function to compare each month's sales with the prior month?",
      "How would you investigate a sudden drop in a key business metric?",
      "How would you explain the difference between correlation and causation to a stakeholder?",
      "How would you combine data from several tables while avoiding duplicate counts?",
      "How would you choose a useful visualization for a skewed distribution?",
    ],
    Hard: [
      "How would you design an experiment to measure whether a product change improved retention?",
      "How would you detect selection bias in an analysis of customer behavior?",
      "How would you build a trustworthy metric when source systems define events differently?",
      "How would you analyze a treatment effect when users are grouped into different regions?",
      "How would you communicate uncertainty in a forecast to decision makers?",
    ],
  },
  "Software Engineer": {
    Easy: [
      "How would you choose a data structure for storing unique items?",
      "What does Big O notation tell you about an algorithm?",
      "What is the difference between a unit test and an integration test?",
      "How do you use version control when working with a team?",
      "What makes a function easier to test and maintain?",
    ],
    Medium: [
      "How would you investigate a regression introduced by a recent code change?",
      "How would you design a cache for a read-heavy application feature?",
      "How would you break a large feature into reviewable, testable changes?",
      "How would you choose between a relational database and a document database for a feature?",
      "How would you make an API operation safe to retry after a network failure?",
    ],
    Hard: [
      "How would you design a service that stays available during a dependency outage?",
      "How would you partition a high-volume data store while preserving useful query patterns?",
      "How would you reason about consistency and availability in a distributed system?",
      "How would you coordinate a backward-compatible migration across several services?",
      "How would you identify and eliminate a cascading failure in a distributed application?",
    ],
  },
};

const CODING_CONTEXT = {
  "Frontend Developer": { language: "JavaScript", subject: "browser interface data" },
  "Backend Developer": { language: "Node.js", subject: "API request data" },
  "Full Stack Developer": { language: "JavaScript", subject: "application and API data" },
  "MERN Stack Developer": { language: "JavaScript with MongoDB", subject: "MongoDB documents" },
  "Java Developer": { language: "Java", subject: "application records" },
  "Python Developer": { language: "Python", subject: "application data" },
  "Data Analyst": { language: "SQL", subject: "analytics tables" },
  "Software Engineer": { language: "the programming language of your choice", subject: "large application datasets" },
};

const CODING_TASKS = {
  Easy: [
    "Write a function to count how many records match a given value.",
    "Write a function to remove duplicate values while preserving their original order.",
    "Write a function to find the most frequent value in a collection.",
    "Write a function to sort records by a selected field.",
    "Write a function to validate that required fields are present in each record.",
  ],
  Medium: [
    "Given records with an ID and timestamp, return the newest record for each ID.",
    "Group records by category and return the top three categories by count.",
    "Merge two sorted collections while removing duplicate IDs.",
    "Return the first available page of records while keeping the ordering stable as new records arrive.",
    "Find records that appear in one collection but have no matching ID in another collection.",
  ],
  Hard: [
    "Find the top K most frequent records in a large input using bounded memory, and explain the complexity.",
    "Design a streaming aggregation that can process input larger than memory and recover after a restart.",
    "Implement a concurrent worker that processes records safely when the same ID can arrive more than once.",
    "Design an indexed query that returns recent records by category without scanning the full dataset.",
    "Build an idempotent batch operation that can be retried after a partial failure without duplicating results.",
  ],
};

const ROLE_BASED_QUESTIONS = {
  HR: {
    Easy: [
      "Tell me about yourself and what interests you about a {jobRole} position.",
      "What skills are you currently building to prepare for a {jobRole} role?",
      "Why did you choose to pursue work as a {jobRole}?",
      "What kind of {jobRole} project would you most like to work on?",
      "What do you hope to learn in your first {jobRole} position?",
    ],
    Medium: [
      "What makes you a strong fit for this {jobRole} role, and what would you need to learn first?",
      "Tell me about a project that prepared you for the responsibilities of a {jobRole}.",
      "How do you prioritize when several {jobRole} tasks have competing deadlines?",
      "What feedback have you received that changed how you approach your work as a {jobRole}?",
      "What would you look for when deciding whether a team is a good place for a {jobRole} to grow?",
    ],
    Hard: [
      "Describe a difficult trade-off you might face as a {jobRole}, and explain how you would decide what to do.",
      "How would you respond if a stakeholder rejected your recommendation as a {jobRole}?",
      "Which area of your {jobRole} skill set needs the most growth, and what concrete plan are you following?",
      "How would you explain a complex {jobRole} decision to a non-technical stakeholder?",
      "What would you do if your team asked you to deliver a {jobRole} task in a way you believed was risky?",
    ],
  },
  Behavioral: {
    Easy: [
      "Tell me about a project related to {jobRole} work that you are proud of.",
      "Describe a time you learned a new skill that could help you as a {jobRole}.",
      "Tell me about a time you worked with someone else to complete a project.",
      "Describe a small mistake you made on a project and how you corrected it.",
      "Tell me about a time you had to organize your work to meet a deadline.",
    ],
    Medium: [
      "Describe a time you solved a difficult problem related to {jobRole} work. What steps did you take?",
      "Tell me about a disagreement with a teammate and how you reached a useful outcome.",
      "Describe a time you received critical feedback and changed your approach because of it.",
      "Tell me about a time requirements changed after you had started a project.",
      "Describe a time you had to explain a {jobRole} decision to someone with a different background.",
    ],
    Hard: [
      "Describe a high-impact {jobRole} decision you made with incomplete information. What did you learn?",
      "Tell me about a project that did not meet its goals and how you took responsibility afterward.",
      "Describe a time you had to balance a quick {jobRole} solution against long-term quality.",
      "Tell me about a time you influenced a team to change direction without having formal authority.",
      "Describe a conflict between user needs and technical constraints and how you helped resolve it.",
    ],
  },
};

function pickRandom(arr, n) {
  const copy = [...arr];
  const out = [];
  while (copy.length && out.length < n) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

/**
 * Generate a list of interview questions for a given role/type/difficulty.
 */
export function generateQuestions({ jobRole, interviewType, difficulty, count = 5 }) {
  if (ROLE_BASED_QUESTIONS[interviewType]) {
    const questions = ROLE_BASED_QUESTIONS[interviewType][difficulty] || ROLE_BASED_QUESTIONS[interviewType].Medium;
    const role = jobRole || "Software Engineer";
    const roleQuestions = questions.map((question) => {
      const personalized = question.replaceAll("{jobRole}", role);
      return interviewType === "Behavioral" && !question.includes("{jobRole}")
        ? `${personalized} Relate it to your work as a ${role}.`
        : personalized;
    });
    return pickRandom(roleQuestions, Math.min(count, questions.length));
  }
  if (interviewType === "Coding") {
    const context = CODING_CONTEXT[jobRole] || CODING_CONTEXT["Software Engineer"];
    const tasks = CODING_TASKS[difficulty] || CODING_TASKS.Medium;
    return pickRandom(
      tasks.map((task) => `${task} Use ${context.language} and relate your solution to ${context.subject}.`),
      Math.min(count, tasks.length)
    );
  }

  const roleQuestions = ROLE_QUESTIONS[jobRole] || ROLE_QUESTIONS["Software Engineer"];
  const levelQuestions = roleQuestions[difficulty] || roleQuestions.Medium;
  return pickRandom(levelQuestions, Math.min(count, levelQuestions.length));
}

/**
 * Rule-based answer evaluator used when no external AI provider is configured.
 * Produces scores + structured feedback based on answer length, keyword
 * overlap with the question, and simple heuristics — good enough for a
 * working demo/portfolio project.
 */
function ruleBasedEvaluation(question, answerText) {
  const trimmed = (answerText || "").trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;

  if (!trimmed) {
    return {
      technicalScore: 0,
      communicationScore: 0,
      confidenceScore: 0,
      relevanceScore: 0,
      overallScore: 0,
      strengths: [],
      weaknesses: ["No answer was provided."],
      improvement: ["Attempt every question, even a partial answer is better than skipping."],
      betterAnswer:
        "Try structuring your answer as: (1) define the concept, (2) explain why it matters, (3) give a short real-world example.",
      recommendation: "Practice answering out loud before typing, then write a concise summary.",
    };
  }

  const questionKeywords = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 4);

  const answerLower = trimmed.toLowerCase();
  const matched = questionKeywords.filter((k) => answerLower.includes(k));
  const relevanceRatio = questionKeywords.length ? matched.length / questionKeywords.length : 0.5;

  const lengthScore = Math.min(10, Math.round((wordCount / 60) * 10)); // ~60 words = full marks
  const relevanceScore = Math.round(Math.min(10, relevanceRatio * 10 + 3));
  const hasExample = /for example|e\.g\.|such as|instance/i.test(trimmed) ? 1 : 0;
  const technicalScore = Math.min(10, Math.round(lengthScore * 0.6 + relevanceScore * 0.4));
  const communicationScore = Math.min(10, Math.max(3, lengthScore - (wordCount < 15 ? 3 : 0) + hasExample));
  const confidenceScore = Math.min(10, Math.max(4, Math.round((technicalScore + communicationScore) / 2)));
  const overallScore = Math.round(
    technicalScore * 0.4 + communicationScore * 0.25 + confidenceScore * 0.15 + relevanceScore * 0.2
  );

  const strengths = [];
  const weaknesses = [];
  const improvement = [];

  if (wordCount >= 40) strengths.push("Gave a reasonably detailed explanation.");
  if (hasExample) strengths.push("Used an example to support the explanation.");
  if (relevanceRatio > 0.4) strengths.push("Answer stayed relevant to the question asked.");
  if (strengths.length === 0) strengths.push("Attempted the question and communicated a basic idea.");

  if (wordCount < 25) {
    weaknesses.push("Answer is quite short and could be expanded.");
    improvement.push("Add more depth — explain the 'why', not just the 'what'.");
  }
  if (!hasExample) {
    weaknesses.push("No concrete example was given.");
    improvement.push("Include a real-world or code example to strengthen the answer.");
  }
  if (relevanceRatio < 0.3) {
    weaknesses.push("Answer could be more directly focused on the question's key terms.");
    improvement.push("Re-read the question and make sure to address its specific terminology.");
  }
  if (weaknesses.length === 0) weaknesses.push("Minor room to tighten the explanation for clarity.");
  if (improvement.length === 0) improvement.push("Practice explaining this concept even more concisely.");

  const betterAnswer = `A strong answer would: (1) clearly define the core concept in the question, (2) explain why it matters in real projects, and (3) include one short concrete example (code or scenario). Aim for 4-6 sentences.`;

  const recommendation = `Keep practicing "${question.split(" ").slice(0, 4).join(" ")}..." style questions — try answering in under 90 seconds while including one example each time.`;

  return {
    technicalScore,
    communicationScore,
    confidenceScore,
    relevanceScore,
    overallScore,
    strengths,
    weaknesses,
    improvement,
    betterAnswer,
    recommendation,
  };
}

/**
 * Optional: call a real AI provider (Anthropic-style Messages API) if
 * AI_API_KEY is configured. Expects the model to return strict JSON.
 * Falls back to the rule-based evaluator on any failure.
 */
async function callAIProvider(question, answerText) {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL;
  if (!apiKey || !apiUrl) return null;

  const prompt = `You are an expert technical interviewer. Evaluate this candidate answer.
Question: ${question}
Answer: ${answerText}

Respond ONLY with strict JSON, no markdown, no preamble, in this exact shape:
{
  "technicalScore": number (0-10),
  "communicationScore": number (0-10),
  "confidenceScore": number (0-10),
  "relevanceScore": number (0-10),
  "overallScore": number (0-10),
  "strengths": string[],
  "weaknesses": string[],
  "improvement": string[],
  "betterAnswer": string,
  "recommendation": string
}`;

  try {
    // Gemini API: key passed as query param, response in candidates[0].content.parts[0].text
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 800 },
      }),
    });

    if (!response.ok) throw new Error(`AI provider returned ${response.status}`);

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No text content in Gemini response");

    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("AI provider call failed, falling back to rule-based evaluation:", err.message);
    return null;
  }
}

/**
 * Public entrypoint used by the controllers.
 */
export async function evaluateAnswer(question, answerText) {
  const aiResult = await callAIProvider(question, answerText);
  if (aiResult) return aiResult;
  return ruleBasedEvaluation(question, answerText);
}

export function getAllTopics() {
  return Object.keys(QUESTION_BANK);
}

export function getQuestionBank() {
  return QUESTION_BANK;
}

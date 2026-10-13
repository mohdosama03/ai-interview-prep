import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { evaluateAnswer, generateFollowUp } from "../services/aiService.js";

const envBefore = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
  AI_API_KEY: process.env.AI_API_KEY,
};
const originalFetch = globalThis.fetch;

const answer = "I used React state to keep the search text current and filtered the list when it changed.";
const validResult = {
  communicationScore: 8,
  technicalScore: 7,
  relevanceScore: 9,
  evidenceScore: 6,
  scoreExplanations: {
    communication: "The answer is concise and easy to follow.",
    technical: "It identifies state and filtering, but does not explain rendering or edge cases.",
    relevance: "It directly describes the search interface behavior.",
    evidence: "It describes an implementation detail but gives no outcome or concrete example.",
  },
  feedbackPoints: [
    {
      category: "technical",
      quote: "filtered the list when it changed",
      issue: "The update mechanism is not explained.",
      whyItMatters: "Interviewers need to understand how the behavior works.",
      suggestion: "Explain what triggers the filtering and how results are rendered.",
      improvedExample: "I filtered the list when the search state changed.",
      hypothetical: false,
    },
    {
      category: "evidence",
      quote: "I shipped this to 20,000 users",
      issue: "Unverified quote.",
      whyItMatters: "Evidence must match what the candidate wrote.",
      suggestion: "Use a fact from the answer.",
      improvedExample: "",
      hypothetical: false,
    },
  ],
  strengths: ["The answer stays on topic."],
  recommendation: "Explain the state update and what happened to the results.",
};

function mockGemini(body, { status = 200, reject = false } = {}) {
  globalThis.fetch = async () => {
    if (reject) throw new Error("network unavailable");
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => ({ candidates: [{ content: { parts: [{ text: typeof body === "string" ? body : JSON.stringify(body) }] } }] }),
    };
  };
}

function enableGemini() {
  process.env.GEMINI_API_KEY = "test-key";
  delete process.env.AI_API_KEY;
}

afterEach(() => {
  for (const key of Object.keys(envBefore)) {
    if (envBefore[key] === undefined) delete process.env[key];
    else process.env[key] = envBefore[key];
  }
  globalThis.fetch = originalFetch;
});

test("evaluates a complete answer with separated, validated scores and exact evidence", async () => {
  enableGemini();
  mockGemini(validResult);
  const result = await evaluateAnswer("How does a React search interface update results?", answer);

  assert.equal(result.assessmentStatus, "complete");
  assert.equal(result.communicationScore, 8);
  assert.equal(result.technicalScore, 7);
  assert.equal(result.relevanceScore, 9);
  assert.equal(result.evidenceScore, 6);
  assert.equal(result.overallScore, 7.5);
  assert.equal(result.feedbackPoints.length, 1);
  assert.equal(result.feedbackPoints[0].quote, "filtered the list when it changed");
  assert.equal(result.feedbackPoints[0].source, "original");
});

test("requests a specific follow-up for a vague project answer without an API key", async () => {
  delete process.env.GEMINI_API_KEY;
  delete process.env.AI_API_KEY;
  const question = "Tell me about a project you developed.";
  const followUp = await generateFollowUp(question, "I developed an e-commerce website.");
  assert.match(followUp, /individual contribution/i);
  assert.match(followUp, /technologies/i);
});

test("does not add another fallback follow-up after the two-question limit", async () => {
  delete process.env.GEMINI_API_KEY;
  delete process.env.AI_API_KEY;
  const followUp = await generateFollowUp(
    "Tell me about a project you developed.",
    "I developed an e-commerce website.",
    [
      { question: "What did you build?", answerText: "I built the product listing page and cart." },
      { question: "What happened?", answerText: "The team reviewed the work and I learned to test checkout flows." },
    ]
  );
  assert.equal(followUp, null);
});

test("keeps technical correctness separate from communication for an incorrect answer", async () => {
  enableGemini();
  mockGemini({ ...validResult, technicalScore: 2, communicationScore: 8 });
  const result = await evaluateAnswer("What does React state do?", "React state stores values that can change and trigger a render.");
  assert.equal(result.technicalScore, 2);
  assert.equal(result.communicationScore, 8);
});

test("evaluates only the original answer when a candidate skips follow-up questions", async () => {
  enableGemini();
  let requestBody;
  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(validResult) }] } }] }),
    };
  };
  const result = await evaluateAnswer("Explain a React search interface.", answer, []);
  const prompt = requestBody.contents[0].parts[0].text;
  assert.equal(result.assessmentStatus, "complete");
  assert.match(prompt, /Original answer/);
  assert.doesNotMatch(prompt, /Follow-up 1, candidate answer/);
});

test("accepts candidate follow-up evidence as a quote source", async () => {
  enableGemini();
  mockGemini({
    ...validResult,
    feedbackPoints: [{ ...validResult.feedbackPoints[0], quote: "I handled the cart and product search", source: "original" }],
  });
  const result = await evaluateAnswer("Describe your project.", "I built a shop.", [
    { question: "What did you implement?", answerText: "I handled the cart and product search" },
  ]);
  assert.equal(result.feedbackPoints[0].source, "follow_up");
});

test("does not score malformed JSON or missing category fields", async () => {
  enableGemini();
  mockGemini("{not valid json");
  const malformed = await evaluateAnswer("Question?", answer);
  assert.equal(malformed.assessmentStatus, "unavailable");
  assert.equal(malformed.overallScore, null);
  assert.equal(malformed.retryable, true);

  mockGemini({ ...validResult, evidenceScore: undefined });
  const missing = await evaluateAnswer("Question?", answer);
  assert.equal(missing.assessmentStatus, "unavailable");
  assert.equal(missing.technicalScore, null);
});

test("does not fabricate scores when Gemini returns a quota error or network failure", async () => {
  enableGemini();
  mockGemini({}, { status: 429 });
  const quota = await evaluateAnswer("Question?", answer);
  assert.equal(quota.assessmentStatus, "unavailable");
  assert.equal(quota.overallScore, null);

  mockGemini(null, { reject: true });
  const network = await evaluateAnswer("Question?", answer);
  assert.equal(network.assessmentStatus, "unavailable");
  assert.equal(network.overallScore, null);
});

test("returns an unscored response for incomplete answers when AI is not available", async () => {
  delete process.env.GEMINI_API_KEY;
  delete process.env.AI_API_KEY;
  const result = await evaluateAnswer("Explain a closure.", "");
  assert.equal(result.assessmentStatus, "unavailable");
  assert.equal(result.overallScore, null);
  assert.equal(result.retryable, false);
});

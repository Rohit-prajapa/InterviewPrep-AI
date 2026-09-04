import test from "node:test";
import assert from "node:assert";
import request from "supertest";

import app from "../src/app.js";

test("POST /api/ai/generate-questions should reject unauthenticated request", async () => {
  const response = await request(app)
    .post("/api/ai/generate-questions")
    .send({
      role: "Full Stack Developer",
      mode: "technical",
      difficulty: "medium",
      questionCount: 5,
    })
    .expect(401);

  assert.strictEqual(response.body.success, false);

  assert.strictEqual(
    response.body.message,
    "Authentication required"
  );
});

test("POST /api/ai/evaluate-answer should reject unauthenticated request", async () => {
  const response = await request(app)
    .post("/api/ai/evaluate-answer")
    .send({
      question: "What is REST API?",
      answer: "REST is an architectural style for APIs.",
      role: "Full Stack Developer",
      mode: "technical",
    })
    .expect(401);

  assert.strictEqual(response.body.success, false);

  assert.strictEqual(
    response.body.message,
    "Authentication required"
  );
});

test("POST /api/ai/adaptive-question should reject unauthenticated request", async () => {
  const response = await request(app)
    .post("/api/ai/adaptive-question")
    .send({
      role: "Full Stack Developer",
      mode: "technical",
      previousQuestion: "What is REST API?",
      previousAnswer: "REST is an architectural style.",
      previousScore: 80,
      difficulty: "medium",
    })
    .expect(401);

  assert.strictEqual(response.body.success, false);

  assert.strictEqual(
    response.body.message,
    "Authentication required"
  );
});
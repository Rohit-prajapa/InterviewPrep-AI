import test from "node:test";
import assert from "node:assert";
import request from "supertest";

import app from "../src/app.js";

test("GET /api/health should return API status", async () => {
  const response = await request(app)
    .get("/api/health")
    .expect(200);

  assert.strictEqual(response.body.success, true);

  assert.strictEqual(
    response.body.message,
    "InterviewPrep AI API is running"
  );
});
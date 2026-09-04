import test from "node:test";
import assert from "node:assert";
import request from "supertest";

import app from "../src/app.js";

test("GET /api/preparation should reject unauthenticated request", async () => {
  const response = await request(app)
    .get("/api/preparation")
    .expect(401);

  assert.strictEqual(response.body.success, false);

  assert.strictEqual(
    response.body.message,
    "Authentication required"
  );
});
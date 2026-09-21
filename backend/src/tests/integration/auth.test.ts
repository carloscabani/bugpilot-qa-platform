import "dotenv/config";

import {
  describe,
  expect,
  it
} from "vitest";

import request from "supertest";

import app from "../../app";


describe("BugPilot Authentication API", () => {

  it("rejects access to users without a token", async () => {

    const response = await request(app)
      .get("/api/users");

    expect(response.status).toBe(401);

    expect(response.body.message).toBe(
      "Authorization token required"
    );

  });


  it("rejects access to bugs without a token", async () => {

    const response = await request(app)
      .get("/api/bugs");

    expect(response.status).toBe(401);

    expect(response.body.message).toBe(
      "Authorization token required"
    );

  });


  it("rejects access to projects without a token", async () => {

    const response = await request(app)
      .get("/api/projects");

    expect(response.status).toBe(401);

  });


  it("rejects invalid tokens", async () => {

    const response = await request(app)
      .get("/api/bugs")
      .set(
        "Authorization",
        "Bearer invalid-token"
      );

    expect(response.status).toBe(401);

    expect(response.body.message).toBe(
      "Invalid or expired token"
    );

  });


  it("requires email and password for login", async () => {

    const response = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(response.status).toBe(400);

    expect(response.body.message).toBe(
      "Email and password are required"
    );

  });

});
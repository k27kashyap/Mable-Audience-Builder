import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import app from "../dist/server.js";

describe("API", () => {
  test("GET /health returns ok", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  test("POST /v1/audiences/preview returns matching audience", async () => {
    const response = await request(app)
      .post("/v1/audiences/preview")
      .send({
        name: "Product Viewers",
        asOf: "2026-09-29T00:00:00Z",
        conditions: [
          {
            eventType: "product_view",
            operator: "at_least",
            count: 2,
            withinDays: 7,
          },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Product Viewers");
    expect(response.body.total).toBeGreaterThan(0);
    expect(response.body.members).toBeInstanceOf(Array);
  });

  test("POST /v1/audiences/preview rejects invalid requests", async () => {
    const response = await request(app)
      .post("/v1/audiences/preview")
      .send({
        name: "",
        asOf: "not-a-date",
        conditions: [],
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid audience request",
    });
  });
});
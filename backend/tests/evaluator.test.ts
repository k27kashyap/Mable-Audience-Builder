import { describe, expect, test } from "@jest/globals";
import { evaluateAudience } from "../dist/evaluator.js";

describe("evaluateAudience", () => {
  test("matches users who meet an at_least condition", () => {
    const result = evaluateAudience(
      [
        {
          eventType: "product_view",
          operator: "at_least",
          count: 2,
          withinDays: 7,
        },
      ],
      "2026-09-29T00:00:00Z"
    );

    const ids = result.map((member) => member.anonymousId);

    expect(ids).toContain("anon_001");
    expect(ids).toContain("anon_003");
    expect(ids).toContain("anon_004");
    expect(ids).not.toContain("anon_002");
  });

  test("matches exactly the required number of events", () => {
    const result = evaluateAudience(
      [
        {
          eventType: "product_view",
          operator: "exactly",
          count: 2,
          withinDays: 7,
        },
      ],
      "2026-09-29T00:00:00Z"
    );

    const ids = result.map((member) => member.anonymousId);

    expect(ids).toContain("anon_004");
    expect(ids).not.toContain("anon_001");
    expect(ids).not.toContain("anon_003");
  });

  test("excludes events outside the time window", () => {
    const result = evaluateAudience(
      [
        {
          eventType: "product_view",
          operator: "at_least",
          count: 1,
          withinDays: 7,
        },
      ],
      "2026-09-29T00:00:00Z"
    );

    const ids = result.map((member) => member.anonymousId);

    expect(ids).not.toContain("anon_005");
    expect(ids).not.toContain("anon_006");
  });

  test("requires all conditions to match", () => {
    const result = evaluateAudience(
      [
        {
          eventType: "product_view",
          operator: "at_least",
          count: 2,
          withinDays: 7,
        },
        {
          eventType: "purchase",
          operator: "exactly",
          count: 0,
          withinDays: 7,
        },
      ],
      "2026-09-29T00:00:00Z"
    );

    const ids = result.map((member) => member.anonymousId);

    expect(ids).toEqual(["anon_001", "anon_004"]);
  });
});
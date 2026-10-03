import db from "./db.js";

export type Condition = {
  eventType: string;
  operator: "at_least" | "exactly";
  count: number;
  withinDays: number;
};

export type AudienceMember = {
  anonymousId: string;
  evidence: {
    eventType: string;
    observedCount: number;
  }[];
};

export function evaluateAudience(
  conditions: Condition[],
  asOf: string
): AudienceMember[] {
  const users = db
    .prepare(`
      SELECT DISTINCT anonymous_id
      FROM events
    `)
    .all() as { anonymous_id: string }[];

  const members: AudienceMember[] = [];

  for (const user of users) {
    const evidence: AudienceMember["evidence"] = [];
    let matchesAll = true;

    for (const condition of conditions) {
      const startDate = new Date(asOf);
      startDate.setUTCDate(startDate.getUTCDate() - condition.withinDays);

      const result = db
        .prepare(`
          SELECT COUNT(*) as count
          FROM events
          WHERE anonymous_id = ?
            AND event_type = ?
            AND occurred_at >= ?
            AND occurred_at <= ?
        `)
        .get(
          user.anonymous_id,
          condition.eventType,
          startDate.toISOString(),
          asOf
        ) as { count: number };

      const observedCount = result.count;

      const matches =
        condition.operator === "at_least"
          ? observedCount >= condition.count
          : observedCount === condition.count;

      if (!matches) {
        matchesAll = false;
        break;
      }

      evidence.push({
        eventType: condition.eventType,
        observedCount,
      });
    }

    if (matchesAll) {
      members.push({
        anonymousId: user.anonymous_id,
        evidence,
      });
    }
  }

  return members;
}
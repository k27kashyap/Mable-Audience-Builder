import db from "./db.js";

const insertEvent = db.prepare(`
  INSERT INTO events (anonymous_id, event_type, occurred_at)
  VALUES (?, ?, ?)
`);

const events = [
  // Should match: 3 product views, no purchase
  ["anon_001", "product_view", "2026-09-25T10:00:00Z"],
  ["anon_001", "product_view", "2026-09-26T10:00:00Z"],
  ["anon_001", "product_view", "2026-09-27T10:00:00Z"],

  // Should NOT match: only 1 product view
  ["anon_002", "product_view", "2026-09-26T10:00:00Z"],

  // Should NOT match: viewed enough, but purchased
  ["anon_003", "product_view", "2026-09-25T10:00:00Z"],
  ["anon_003", "product_view", "2026-09-26T10:00:00Z"],
  ["anon_003", "product_view", "2026-09-27T10:00:00Z"],
  ["anon_003", "purchase", "2026-09-28T10:00:00Z"],

  // Boundary case: exactly 7 days before asOf
  ["anon_004", "product_view", "2026-09-22T00:00:00Z"],
  ["anon_004", "product_view", "2026-09-25T10:00:00Z"],

  // Outside the 7-day window
  ["anon_005", "product_view", "2026-09-21T23:59:00Z"],

  // After asOf
  ["anon_006", "product_view", "2026-09-29T00:01:00Z"],
];

const seed = db.transaction(() => {
  db.exec("DELETE FROM events");

  for (const event of events) {
    insertEvent.run(...event);
  }
});

seed();

console.log(`Seeded ${events.length} events.`);
import express from "express";
import cors from "cors";
import { z } from "zod";
import { evaluateAudience } from "./evaluator.js";
const app = express();
app.use(cors());
app.use(express.json());
const conditionSchema = z.object({
    eventType: z.enum([
        "page_view",
        "product_view",
        "add_to_cart",
        "checkout_started",
        "purchase",
    ]),
    operator: z.enum(["at_least", "exactly"]),
    count: z.number().int().min(0),
    withinDays: z.number().int().min(1),
});
const audienceSchema = z.object({
    name: z.string().min(1),
    asOf: z.string().datetime(),
    conditions: z.array(conditionSchema).min(1),
});
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.post("/v1/audiences/preview", (req, res) => {
    const result = audienceSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Invalid audience request",
        });
    }
    const { name, asOf, conditions } = result.data;
    const members = evaluateAudience(conditions, asOf);
    return res.json({
        name,
        asOf,
        total: members.length,
        members,
    });
});
const PORT = 3000;
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Backend running on http://localhost:${PORT}`);
    });
}
export default app;
//# sourceMappingURL=server.js.map
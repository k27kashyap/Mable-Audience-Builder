import express from "express";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
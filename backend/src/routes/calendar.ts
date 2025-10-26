import express from "express";
import { createEvent, listEvents } from "../agents/tools/calendar";

const router = express.Router();

router.get("/events", async (req, res) => {
  const events = await listEvents();
  res.json({ events });
});

router.post("/events", async (req, res) => {
  const { summary, start, end } = req.body;
  const event = await createEvent(summary, start, end);
  res.json({ event });
});

export default router;

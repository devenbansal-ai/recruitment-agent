import express from "express";
import { calendarListEventsTool } from "../agents/tools/calendarListEvents";
import { calendarCreateEventTool } from "../agents/tools/calendarCreateEvent";

const router = express.Router();

router.get("/events", async (req, res) => {
  const events = await calendarListEventsTool.execute({});
  res.json({ events });
});

router.post("/events", async (req, res) => {
  const { summary, start, end } = req.body;
  const event = await calendarCreateEventTool.execute({ summary, start, end });
  res.json({ event });
});

export default router;

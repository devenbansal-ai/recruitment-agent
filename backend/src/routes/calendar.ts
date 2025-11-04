import express from "express";
import { calendarListEventsTool } from "../agents/tools/calendarListEvents";
import { calendarCreateEventTool } from "../agents/tools/calendarCreateEvent";
import { validateArgs } from "../agents/registry";

const router = express.Router();

router.get("/events", async (req, res) => {
  try {
    const events = await calendarListEventsTool.execute({});
    res.json({ events });
  } catch (error) {
    console.error("Error while fetching events", error);
    res.status(500).json({ error: "Events fetch failed" });
  }
});

router.post("/events", async (req, res) => {
  const args = req.body;
  try {
    validateArgs(calendarCreateEventTool, args);
    const event = await calendarCreateEventTool.execute(args);
    res.json({ event });
  } catch (error) {
    console.error("Error while creating event:", error);
    res.status(500).json({ error: "Event creation failed" });
  }
});

export default router;

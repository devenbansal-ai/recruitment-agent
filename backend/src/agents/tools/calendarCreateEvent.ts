import { calendar_v3, google } from "googleapis";
import { getAuthClient } from "../../services/googleAuth";
import { Tool, ToolInput, ToolResult } from "../../types/agent";
import Logger from "../../utils/logger";
import { LOGGER_TAGS } from "../../utils/tags";

interface ICalendarCreateEventArgs extends ToolInput {
  summary: string;
  startTime: string;
  endTime: string;
}

const INDIAN_TIME_ZONE = "Asia/Kolkata";

async function createEvent(args: ICalendarCreateEventArgs): Promise<ToolResult> {
  const auth = getAuthClient();
  const calendar = google.calendar({ version: "v3", auth });
  const event: calendar_v3.Schema$Event = {
    summary: args.summary,
    start: { dateTime: args.startTime, timeZone: INDIAN_TIME_ZONE },
    end: { dateTime: args.endTime, timeZone: INDIAN_TIME_ZONE },
  };
  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });
    return { success: true, output: response.data };
  } catch (err) {
    Logger.log(LOGGER_TAGS.ERROR_CREATING_CALENDAR_EVENT, err);
    return { success: false, error: String(err) };
  }
}

export const calendarCreateEventTool: Tool<ICalendarCreateEventArgs> = {
  name: "calendar_create_event",
  description: "Creates an event in the calendar, given its title, start time and end time",
  argsSchema: {
    summary: { type: "string", description: "Event summary to be used as title", required: true },
    startTime: {
      type: "string",
      description:
        "The event start time, as a combined date-time value (formatted according to RFC3339)",
      required: true,
    },
    endTime: {
      type: "string",
      description:
        "The event end time, as a combined date-time value (formatted according to RFC3339)",
      required: true,
    },
  },
  execute: createEvent,
  additionalInfo: () => `Current data and time is ${new Date().toString()}`,
  isEnabled: () => true,
  getLoadingMessage: (args) => `Create a event in your calendar for "${args.summary}"`,
};

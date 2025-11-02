import { google } from "googleapis";
import { getAuthClient } from "../../services/googleAuth";
import { Tool, ToolInput, ToolResult } from "../../types/agent";
import Logger from "../../utils/logger";
import { LOGGER_TAGS } from "../../utils/tags";

interface ICalendarListEventsArgs extends ToolInput {}

async function listEvents(_args: ICalendarListEventsArgs): Promise<ToolResult> {
  const auth = getAuthClient();
  const calendar = google.calendar({ version: "v3", auth });
  try {
    const response = await calendar.events.list({
      calendarId: "primary", // or the specific calendar ID
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });
    return { success: true, output: response.data.items };
  } catch (err) {
    Logger.log(LOGGER_TAGS.ERROR_FETCHING_CALENDAR_EVENTS, err);
    return { success: false, error: String(err) };
  }
}

export const calendarListEventsTool: Tool = {
  name: "calendar_list_events",
  description: "Fetches and returns upcoming 10 events starting from now",
  argsSchema: {},
  execute: listEvents,
  additionalInfo: () => `Current data and time is ${new Date().toString()}`,
  isEnabled: () => true,
};

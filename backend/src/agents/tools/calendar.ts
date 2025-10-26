import { calendar_v3, google } from "googleapis";
import { getAuthClient } from "../../services/googleAuth";

export async function read({ range }: { range?: string }) {
  const auth = getAuthClient();
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });
  return { events: res.data.items };
}

export async function write({ event, confirmed }: { event: any; confirmed?: boolean }) {
  if (!confirmed) throw new Error("Write not confirmed");
  const auth = await getAuthClient();
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
  });
  return { result: res.data };
}

// Example: Once you have the tokens, you can use the oAuth2Client to make API calls
// Example: List events from a user's calendar
export async function listEvents() {
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
    return response.data.items;
  } catch (err) {
    console.error("Error fetching calendar events:", err);
  }
}

export async function createEvent(summary: string, startTime: string, endTime: string) {
  const auth = getAuthClient();
  const calendar = google.calendar({ version: "v3", auth });
  const event: calendar_v3.Schema$Event = {
    summary,
    start: { dateTime: startTime },
    end: { dateTime: endTime },
  };
  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
  });
  return res.data;
}

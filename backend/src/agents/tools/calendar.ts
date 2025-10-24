import { google } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const CODE_FROM_REDIRECT_URL = process.env.CODE_FROM_REDIRECT_URL!;
const TOKEN_PATH = "tokens.json";

// For service account flow, use JWT client instead.

// Function to get authenticated client (you might persist token)
export function getAuthClient() {
  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  // load tokens from file or env
  // … token load logic …
  // if no token, redirect for user consent etc.
  return oAuth2Client;
}

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

// After the user grants access, Google will redirect to the specified redirect URI with a code
// Use this code to get access and refresh tokens
export async function getToken(code: string) {
  const auth = getAuthClient();
  const { tokens } = await auth.getToken(code);
  auth.setCredentials(tokens);
  console.log("Access Token:", tokens.access_token);
  console.log("Refresh Token:", tokens.refresh_token);
  listEvents();
}

// Example: Once you have the tokens, you can use the oAuth2Client to make API calls
// Example: List events from a user's calendar
async function listEvents() {
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
    const events = response.data.items;
    console.log("Events:", events);
  } catch (err) {
    console.error("Error fetching calendar events:", err);
  }
}

// Call getToken function when you receive the code after user authorization
// Call listEvents function to retrieve events from the calendar
// getToken(CODE_FROM_REDIRECT_URL).then((result) => listEvents());

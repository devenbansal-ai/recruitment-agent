import { google } from "googleapis";
import { LOGGER_TAGS } from "../utils/tags";
import Logger from "../utils/logger";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

// Function to get authenticated client (you might persist token)
export function getAuthClient() {
  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  const refresh_token = process.env.GOOGLE_REFRESH_TOKEN;
  if (refresh_token) {
    oAuth2Client.setCredentials({ refresh_token });
  }
  return oAuth2Client;
}

// After the user grants access, Google will redirect to the specified redirect URI with a code
// Use this code to get access and refresh tokens
export async function getAndSetAuthTokens(code: string) {
  const auth = getAuthClient();
  const { tokens } = await auth.getToken(code);
  auth.setCredentials(tokens);

  Logger.log(LOGGER_TAGS.GOOGLE_AUTH_TOKENS_FETCHED, tokens);
  return tokens;
}

import express from "express";
import Logger from "../utils/logger";
import { LOGGER_TAGS } from "../utils/tags";
import { getAndSetAuthTokens, getAuthClient } from "../services/googleAuth";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const router = express.Router();

router.get("/register-code", async (req, res) => {
  try {
    const code = req.query.code; // <– extract the code here

    if (!code) {
      return res.status(400).json({ error: "No authorization code found" });
    }
    Logger.log(LOGGER_TAGS.GOOGLE_AUTH_CODE_RECIEVED, code);
    const tokens = await getAndSetAuthTokens(code as string);
    res.json({ message: "Authenticated!", tokens });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Auth failed" });
  }
});

router.get("/generate-code", async (req, res) => {
  Logger.log(LOGGER_TAGS.GENERATING_GOOGLE_AUTH_CODE);
  // Generate a URL for users to authorize the application
  const auth = getAuthClient();
  const authUrl = auth.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

export default router;

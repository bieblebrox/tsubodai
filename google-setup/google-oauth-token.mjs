/**
 * One-time Google OAuth helper — prints a refresh_token for the account that completes
 * the browser flow (use Tsubodai's dedicated Gmail).
 *
 * Run from this directory after: npm install
 *
 *   export GOOGLE_CLIENT_ID="..."
 *   export GOOGLE_CLIENT_SECRET="..."
 *   export REDIRECT_URI="http://127.0.0.1:8080/oauth2callback"
 *   npm run token
 *
 * Or: node google-oauth-token.mjs
 */

import { createServer } from "node:http";
import { parse as parseUrl } from "node:url";
import { OAuth2Client } from "google-auth-library";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri =
  process.env.REDIRECT_URI || "http://127.0.0.1:8080/oauth2callback";

let listenPort;
try {
  listenPort = Number(process.env.PORT || new URL(redirectUri).port || 8080);
} catch {
  listenPort = Number(process.env.PORT || 8080);
}

/** Must match scopes you added under Google Cloud → Auth platform → Data access. */
const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets",
  // Uncomment if you use Gmail API with the same OAuth client:
  // "https://www.googleapis.com/auth/gmail.readonly",
  // "https://www.googleapis.com/auth/gmail.modify",
];

if (!clientId || !clientSecret) {
  console.error(
    "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.\nSee README.md in this folder.\n"
  );
  process.exit(1);
}

const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
});

const server = createServer(async (req, res) => {
  const { query } = parseUrl(req.url, true);
  const code = query.code;
  const err = query.error;

  if (err) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`OAuth error: ${err}\n${query.error_description || ""}`);
    server.close();
    process.exit(1);
    return;
  }

  if (!code) {
    if (req.url === "/" || req.url?.startsWith("/?")) {
      res.writeHead(302, { Location: authUrl });
      res.end();
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(String(code));
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(
      "Success. You can close this tab. The refresh token was printed in the terminal."
    );

    console.log("\n--- Tokens (keep secret; do not commit) ---\n");
    console.log("refresh_token:", tokens.refresh_token || "(none — see README if missing)");
    console.log("access_token:", tokens.access_token ? "(present)" : "(missing)");
    if (tokens.expiry_date) {
      console.log("access_token_expires_ms_since_epoch:", tokens.expiry_date);
    }
    console.log("\nFull tokens JSON:\n");
    console.log(JSON.stringify(tokens, null, 2));
    console.log(
      "\nStore GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN securely (e.g. ~/.openclaw/.env or OpenClaw secrets).\n"
    );

    if (!tokens.refresh_token) {
      console.warn(
        "\n⚠ No refresh_token returned. Revoke this app for Tsubodai at:\n" +
          "  https://myaccount.google.com/permissions\n" +
          "Then run this script again (prompt=consent is already enabled).\n"
      );
    }

    server.close();
    process.exit(0);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(String(e?.message || e));
    console.error(e);
    server.close();
    process.exit(1);
  }
});

server.listen(listenPort, "127.0.0.1", () => {
  console.log(`Listening on http://127.0.0.1:${listenPort}`);
  console.log("\nOpen this URL in your browser while signed in as Tsubodai:\n");
  console.log(authUrl);
  console.log(
    "\nOr visit http://127.0.0.1:" + listenPort + " — you will be redirected to Google.\n"
  );
});

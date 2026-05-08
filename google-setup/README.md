# Google OAuth setup for Tsubodai (OpenClaw)

This folder contains a **one-time** script to obtain a **refresh token** for a Google account (your dedicated **Tsubodai Gmail**). You use that token with a Drive/Sheets (and optionally Gmail) skill so the gateway can call Google APIs without a browser.

**Security**

- Never commit `GOOGLE_CLIENT_SECRET` or `GOOGLE_REFRESH_TOKEN` to git.
- This directory’s `.gitignore` ignores `.env` and `node_modules`. If your `workspace/` is ever pushed to a remote, double-check secrets stay out of the repo.
- Prefer storing production secrets in `~/.openclaw/.env` or OpenClaw’s [secrets](https://docs.openclaw.ai/gateway/secrets) flow, not inside files the agent is instructed to edit casually.

---

## Prerequisites

1. **Google Cloud project** with:
   - [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com) enabled  
   - [Google Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com) enabled  
   - Optional: [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com) if you will use Gmail from the same OAuth client  

2. **OAuth client** of type **Web application** (not Desktop), with:
   - **Authorized redirect URIs** including **exactly** the URI you will use below (recommended default):

     `http://127.0.0.1:8080/oauth2callback`

3. **Scopes** added under **Google Auth platform → Data access** (or **OAuth consent screen → Scopes** in older UI). The script requests:
   - `https://www.googleapis.com/auth/drive`
   - `https://www.googleapis.com/auth/spreadsheets`  
   If you add Gmail scopes to the script, add the same scopes in the Cloud Console.

4. **User type**
   - **Internal** only works for Google Workspace users **in the same organization** as the Cloud project. A consumer `@gmail.com` bot account usually requires **External** app + **Test users** (while in Testing), unless Tsubodai is a Workspace user in your org.

---

## Install

From this directory:

```bash
cd ~/.openclaw/workspace/google-setup
npm install
```

---

## Run the token script

1. In [Google Cloud Console](https://console.cloud.google.com/) → **Google Auth platform** → **Clients**, open your **Web application** client and copy **Client ID** and **Client secret**.

2. Ensure **Authorized redirect URIs** includes:

   `http://127.0.0.1:8080/oauth2callback`

   (If you change the URI, set `REDIRECT_URI` to the **same** value in the next step.)

3. Export credentials and start the script:

   ```bash
   export GOOGLE_CLIENT_ID="YOUR_CLIENT_ID.apps.googleusercontent.com"
   export GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET"
   export REDIRECT_URI="http://127.0.0.1:8080/oauth2callback"
   npm run token
   ```

   Optional: `export PORT=8080` only needed if the port is not part of `REDIRECT_URI` (the script defaults to `8080` when the URL has no port).

4. Open the printed URL in a browser where you are signed in as **Tsubodai’s Gmail** (or click through from `http://127.0.0.1:8080/`).

5. Approve the consent screen. The browser should show success; the terminal prints **`refresh_token`** and a JSON blob.

6. Save for your skill / env:

   - `GOOGLE_CLIENT_ID`  
   - `GOOGLE_CLIENT_SECRET`  
   - `GOOGLE_REFRESH_TOKEN`  

---

## Optional: `.env` file (local only)

You can create a file named `.env` **in this directory** (it is gitignored) **only if** you use a loader; Node does not load `.env` by default. Simplest is to keep using `export` in the shell.

Example with [dotenv](https://www.npmjs.com/package/dotenv) (not installed by default):

```bash
# .env — never commit
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
REDIRECT_URI=http://127.0.0.1:8080/oauth2callback
```

Then you’d need a one-line change to load dotenv at the top of the script, or run:

```bash
set -a && source .env && set +a && npm run token
```

---

## Troubleshooting

### `redirect_uri_mismatch`

The redirect URI in the script (`REDIRECT_URI`) must **character-for-character** match an entry under the Web client’s **Authorized redirect URIs**. Common mistakes: `localhost` vs `127.0.0.1`, wrong port, missing path, `http` vs `https`.

### `access_blocked` or “app not verified” / Internal app

- **Internal**: Tsubodai must be a **Workspace user in the same org** as the project. Personal Gmail cannot use Internal.  
- **External**: Add Tsubodai’s address under **Audience → Test users** while the app is in **Testing**.

### No `refresh_token` in the output

Google may omit a refresh token if this client was already authorized for that account without forcing consent.

1. Revoke access: [Google Account → Third-party connections](https://myaccount.google.com/permissions) → remove your test app.  
2. Run `npm run token` again. This script already sets `access_type=offline` and `prompt=consent`.

### Port already in use

Another process is using `8080`. Either stop it or pick another port **and** add a matching redirect URI in GCP, e.g.:

```bash
export REDIRECT_URI="http://127.0.0.1:9090/oauth2callback"
export PORT=9090
npm run token
```

(Add `http://127.0.0.1:9090/oauth2callback` to the Web client.)

### Adding Gmail scopes

1. Enable **Gmail API** in the API Library.  
2. Add the Gmail scopes in **Data access** in Cloud Console.  
3. Uncomment the Gmail lines in `google-oauth-token.mjs` under `SCOPES`, then run `npm run token` again (and revoke prior consent if needed).

---

## After you have the tokens

Wire them into your OpenClaw **google-drive** (or combined) skill via `openclaw.json` → `skills.entries.<name>.env` or `~/.openclaw/.env`, using variable names your skill expects. The skill implementation is separate from this folder; this folder is only for **obtaining** the refresh token once (or again after revoke/rotation).

---

## Files

| File | Purpose |
|------|--------|
| `google-oauth-token.mjs` | Local HTTP server + OAuth exchange; prints refresh token |
| `package.json` | Declares `google-auth-library` and `npm run token` |
| `.gitignore` | Ignores `node_modules/` and `.env` |
| `README.md` | This document |

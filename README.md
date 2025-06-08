# OpenWA AI Bot

This bot uses OpenWA and Baileys to provide GPT powered replies in WhatsApp chats.

## Group Setup

When the bot joins a group it checks whether each participant has messaged the bot privately. If not, they will receive a direct message asking them to say hi. Group admins should ensure everyone responds so the bot can mention them and handle replies correctly.

## Headless Mode

The bot runs in headless mode by default. Set `HEADLESS=false` in the environment to launch a visible browser for debugging.

## Authentication API

The API exposes JWT based authentication endpoints under `/api/auth`.

### Register

```http
POST /api/auth/register
```

Body:

```json
{
  "email": "user@example.com",
  "password": "secret",
  "displayName": "Test User"
}
```

Response:

```json
{
  "token": "<jwt>",
  "user": { "email": "user@example.com", "displayName": "Test User", "role": "user" }
}
```

### Login

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

Returns the same shape as registration. Store the token on the frontend (e.g. `localStorage`) and send it in the `Authorization` header as `Bearer <token>` for protected routes.

The server validates the JWT on each request and attaches the user to `req.user` when valid.

### Current User

```http
GET /api/auth/me
```

Requires the `Authorization` header and returns the logged in user's information.

Use tools like Postman to test these endpoints by sending JSON bodies and setting the `Authorization` header when needed.

TODO: add password reset and email verification flows.

To protect your own routes, import `auth` from `middleware/auth` and pass it as middleware:

```js
const auth = require('../middleware/auth');
router.get('/my-protected', auth, (req, res) => { ... });
```
For admin-only routes use `isAdmin` in addition to `auth`.

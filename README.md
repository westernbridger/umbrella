# OpenWA AI Bot

This bot uses OpenWA and Baileys to provide GPT powered replies in WhatsApp chats.

## Group Setup

When the bot joins a group it checks whether each participant has messaged the bot privately. If not, they will receive a direct message asking them to say hi. Until each member replies, the bot will post a reminder in the group:

```
Not all group members have completed bot setup. Please reply to my DM to enable group features.
```

Group admins should ensure everyone responds so the bot can mention them and handle replies correctly.

## Headless Mode

The bot runs in headless mode by default. Set `HEADLESS=false` in the environment to launch a visible browser for debugging.

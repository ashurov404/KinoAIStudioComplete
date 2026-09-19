# Admin self-repair / rule system

`/admin` is an **owner command**, not a source-code self-modifier.

Flow:
1. Admin sends `/admin`.
2. The bot asks: **“Qanday o‘zgarish yoki qoida qo‘shamiz?”**
3. Admin describes the requested behavior.
4. The system classifies the target layer (`script`, `scene`, `shot`, `character`, `camera`, `lighting`, `render`, `telegram`, or `all`) and proposes a declarative rule.
5. The system asks **HA / YO‘Q**.
6. Only after `HA` is the rule activated.
7. Source files are not edited by this command. No arbitrary JavaScript/Python is executed from the admin message.

This is intentional: an admin can change application behavior/rules without allowing a chat message to overwrite the application source.

For Telegram, configure:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ADMIN_CHAT_ID`
- optional `STUDIO_CLIENT_KEY`
- `ADMIN_EMAIL`

The `/render/encode` endpoint accepts raw RGBA frames from the own software rasterizer and uses FFmpeg only as the final container/codec encoder. FFmpeg does not generate scene geometry or perform the 3D render.

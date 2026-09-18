# Kino AI Studio V5 upgrade

This version closes the previously missing UI/platform modules and introduces an own procedural 3D core.

## Added
- Login required before private studio features.
- Supabase `studio_*` schema, RLS, admin function and auth profile trigger.
- Admin owner email: `ashurovabdulqodir10@gmail.com`.
- Public movie/project discovery with creator name/email metadata.
- Own procedural character mesh and own procedural environment preview using code-generated geometry.
- Scene/shot/timeline UI.
- Bot/API integration control-plane UI.
- Collaboration, partners/advertising, admin, notifications/chat/payment/referral/API/bot tables in schema.
- Render gate messaging: no fake MP4 when real renderer/model is unavailable.

## Still intentionally adapter-based
The AI video model itself is not falsely claimed as connected. OpenRouter is represented as the scenario-writing adapter; a real GPU/model worker must be connected server-side before production rendering is enabled.

## Security
Never place Supabase secret/service-role keys or OpenRouter secret keys inside the APK. Frontend uses only the Supabase publishable/anon key with RLS. Secrets belong in backend/Edge Function/worker environment variables.

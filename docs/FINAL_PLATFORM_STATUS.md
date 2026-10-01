# Kino AI Studio — Platform Completion Pass

This pass keeps the existing project structure and extends the existing V6/V7 implementation.

## Implemented in this pass
- White / dark-text / orange Cinema Studio visual system with responsive mobile navigation.
- Auth gate for protected Studio functions while keeping temporary local fallback when Supabase is not configured.
- Full project snapshot restore from `studio_project_versions` for cross-device continuity.
- Script writer: real OpenRouter request when configured, deterministic fallback when not configured, rewrite mode, scene/shot planning.
- Scene persistence derived from shot graph.
- Public movie metadata persistence and real video URL playback gate.
- Telegram / Universal API client adapter and a small server-side API bridge (`server/api.mjs`) for jobs, OpenRouter proxy and Telegram send/webhook.
- Admin rule engine foundation and continuity warnings.
- Own software 3D core expanded with a real per-pixel z-buffer, triangle rasterization, lighting, procedural character, skeleton-like joints, hair strands, environment generation and camera animation.
- No Three.js/WebGL rendering dependency.
- V8 persistence tables for render frames, voice/lip-sync metadata, library items, rule versions and job events.

## Honest boundary
The software renderer is an independent renderer implementation, but absolute photorealism is not a truthful claim yet. High-end film realism still requires substantial physically based material, global illumination, texture synthesis, facial micro-animation, hair/cloth simulation, audio synthesis and production encoding work. The application therefore never pretends that an unavailable renderer or encoder has completed a movie.

## Required Supabase migration order
Run the existing schema files in order:
1. `schema.sql`
2. `schema_v5.sql`
3. `schema_v6.sql`
4. `schema_v7.sql`
5. `schema_v8.sql`

Existing `kino-bot` tables are not modified by these Studio migrations.

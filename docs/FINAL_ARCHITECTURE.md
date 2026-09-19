# Kino AI Studio — consolidated architecture

The project is intentionally independent of Three.js/WebGL rendering. The current software renderer owns its vector math, camera projection, triangle generation, material/light evaluation and frame rasterization. It is a foundation for the full renderer; it does not claim photorealistic final-film output until a production encoder/worker exists.

## Product layers
- Local-first authentication and persistence; Supabase is optional until configured.
- Script architect: deterministic scene/shot analysis, with optional OpenRouter text generation.
- Project graph: project → script → characters → locations → scenes/shots → jobs → movies.
- Character continuity: stable IDs and profiles carried across shots.
- Location continuity: stable environment IDs carried across shots.
- Admin rule/config layer: rules are stored as configuration, not arbitrary self-modifying source code.
- Telegram/API integration configuration and explicit job states.
- No fake MP4 completion: render jobs must have a real renderer/encoder result before a movie gets a video URL.

## Renderer roadmap represented in code
scene graph → procedural meshes → camera → triangles → depth ordering → lighting/material → animation → frame output → encoder gate.

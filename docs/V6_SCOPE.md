# V6 scope

This release replaces the Three.js dependency in the preview path with an in-house TypeScript software 3D foundation: vector math, camera projection, triangle generation/rasterization, depth ordering, materials, lighting and procedural character/environment primitives.

It also adds:
- local fallback authentication when Supabase is not configured;
- runtime Supabase/OpenRouter configuration UI;
- owner rule storage in local configuration;
- location and public-movie schema foundations;
- existing Studio/Admin/Telegram API architecture retained.

Important: this is an engineering foundation, not a truthful claim of 100% photorealistic production cinema. Full photorealism, physically based materials, global illumination, cloth/hair simulation, facial rigging, voice/lip-sync, long-form frame rendering and a production encoder still require substantial additional implementation and compute. No external video-generation model is used by the 3D core.

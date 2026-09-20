# Kino AI Studio V9

V9 is an in-place upgrade of the V8 codebase. It does not replace the software 3D core.

## Public entry
- Public landing page explains the product and capabilities.
- Register/Login are shown at the top.
- Technical 3D Engine/Render/Jobs menus are hidden from ordinary users.
- Protected sections require an account.

## Main creation flow
- Kino yaratish opens an AI conversation-style creator.
- OpenRouter is constrained to Kino AI Studio / filmmaking topics.
- The AI can expand a short idea into a cinematic plan and scene/shot data.
- Character reference upload is part of the creator flow.

## Profile
- Instagram-like profile layout with created-film count, saved-film count, and save count.
- User-created films appear below the statistics.

## API
The API page explains how to obtain/use a key and how to place it in Termux. It does not expose Supabase/OpenRouter secrets in normal user settings.

## Advertising
- Advertising rules are shown first.
- “Reklama berish” opens the Kino creator and marks the `/reklama` flow.
- Payment details are shown there.
- Receipt upload creates a `pending` review.
- The user is told that review will occur within one hour.
- Automatic payment approval is disabled.
- Admin reviews the receipt and chooses Approve/Reject.
- The user receives the decision through the app notification flow; when the backend is configured, Telegram admin notification/callbacks are also supported.

## Admin safety
- Admin UI is hidden from ordinary users.
- `/admin` is intended to create a rule/change proposal.
- A proposal must be explicitly approved before activation.
- Rule changes are declarative configuration; they must not silently rewrite source code.

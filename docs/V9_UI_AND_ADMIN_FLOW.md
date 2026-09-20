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
- The API page first explains what the key is and how to protect it.
- The key is generated from a dedicated UI instead of an alert.
- Supabase stores the user's API-key record.
- OpenRouter's server secret is never displayed in the browser.

## Advertising / collaboration
- The public collaboration/advertising page contains only the business request information.
- Extra payment/receipt/admin-confirmation instructions are not shown there.
- The advertising request can be continued inside the creator flow and submitted for review.
- The backend/Supabase payment record can be reviewed by the administrator.

## Admin
- No separate Admin navigation item is shown.
- An authorized administrator types `/admin` inside the AI Kino chat.
- The chat opens an inline payment-review panel.
- The V9.1 admin UI is intentionally limited to advertising/collaboration payment approval/rejection.


## V9.1 — 7 ta majburiy tuzatish

1. API kalit olish: ortiqcha alert olib tashlandi. Avval xavfsizlik/tushuntirish, keyin kalit yaratish oynasi.
2. AI Kino yaratish: professional chat UX, chat tarixi, ssenariy va kino konteksti Supabase bilan saqlanadi.
3. Hamkorlik/Reklama: foydalanuvchi oynasidagi ortiqcha to‘lov/chek-admin izohlari olib tashlandi; reklama so‘rovi alohida oqimda yuboriladi.
4. Admin: alohida Admin menyusi va qoidalar paneli olib tashlandi. Admin `/admin` buyrug‘i orqali AI Kino chatining ichida ochiladi va to‘lovlarni tasdiqlaydi/rad etadi.
5. Ro‘yxatdan o‘tish: ism + email + parol → email tasdiqlash kodi → profil rasmi. Profil nomi AI murojaatlarida ishlatiladi.
6. Sozlamalar: til, bildirishnoma, ko‘rinish, profil va xavfsizlik bo‘limlari qo‘shildi. Server maxfiy kalitlari UI orqali ko‘rsatilmaydi.
7. OpenRouter + Supabase: OpenRouter chaqiruvi serverdagi `/ai/script` endpointi orqali bajariladi; OpenRouter maxfiy kaliti brauzerga chiqarilmaydi. Supabase akkaunt/profil/chat/ssenariy/kino kontekstini saqlash qatlamidir.

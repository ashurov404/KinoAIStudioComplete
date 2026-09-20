import React, { useState } from "react";
import { supabase } from "./supabase";

type Step = "form" | "code" | "avatar" | "done";

export default function ProfessionalRegister() {
  const [step, setStep] = useState<Step>("form");

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [code, setCode] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function clearMessages() {
    setError("");
    setMessage("");
  }

  async function register() {
    clearMessages();

    const u = username.trim();
    const n = name.trim();
    const e = email.trim().toLowerCase();

    if (!u || !n || !e || !password || !password2) {
      setError("Barcha maydonlarni to‘ldiring.");
      return;
    }

    if (password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo‘lishi kerak.");
      return;
    }

    if (password !== password2) {
      setError("Parollar bir xil emas.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: e,
        password,
        options: {
          data: {
            username: u,
            full_name: n
          }
        }
      });

      if (error) throw error;

      sessionStorage.setItem(
        "kino_registration",
        JSON.stringify({
          username: u,
          name: n,
          email: e
        })
      );

      setMessage(
        "Tasdiqlash kodi emailingizga yuborildi. Emailingizni tekshiring."
      );

      setStep("code");
    } catch (err: any) {
      setError(err?.message || "Ro‘yxatdan o‘tishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    clearMessages();

    const saved = sessionStorage.getItem("kino_registration");

    if (!saved) {
      setError("Ro‘yxatdan o‘tish ma’lumotlari topilmadi.");
      setStep("form");
      return;
    }

    const info = JSON.parse(saved);

    if (!/^[0-9]{6}$/.test(code.trim())) {
      setError("6 xonali kodni kiriting.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: info.email,
        token: code.trim(),
        type: "signup"
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("Foydalanuvchi yaratilmadi.");
      }

      setMessage("Email tasdiqlandi. Endi avatar rasmingizni qo‘shing.");
      setStep("avatar");
    } catch (err: any) {
      setError(err?.message || "Tasdiqlash kodi noto‘g‘ri yoki muddati tugagan.");
    } finally {
      setLoading(false);
    }
  }

  async function finishProfile() {
    clearMessages();

    if (!avatar) {
      setError("Avatar rasmini tanlang.");
      return;
    }

    const saved = sessionStorage.getItem("kino_registration");

    if (!saved) {
      setError("Ro‘yxatdan o‘tish ma’lumotlari topilmadi.");
      return;
    }

    const info = JSON.parse(saved);

    setLoading(true);

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      const user = userData.user;

      if (!user) {
        throw new Error("Tasdiqlangan account topilmadi.");
      }

      const ext =
        avatar.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatar, {
          upsert: true,
          contentType: avatar.type || "image/jpeg"
        });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = publicUrl.publicUrl;

      const { error: profileError } = await supabase
        .from("studio_profiles")
        .upsert(
          {
            id: user.id,
            username: info.username,
            full_name: info.name,
            email: info.email,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: "id"
          }
        );

      if (profileError) throw profileError;

      await supabase.auth.updateUser({
        data: {
          username: info.username,
          full_name: info.name,
          avatar_url: avatarUrl
        }
      });

      sessionStorage.removeItem("kino_registration");

      setMessage("Akkaunt muvaffaqiyatli yaratildi.");
      setStep("done");
    } catch (err: any) {
      setError(
        err?.message ||
        "Profilni saqlashda xatolik yuz berdi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="kino-register-page">
      <div className="kino-register-card">

        <div className="kino-register-brand">
          KINO AI STUDIO
        </div>

        {step === "form" && (
          <>
            <h1>Professional akkaunt yaratish</h1>

            <p className="kino-register-description">
              Akkauntingizni yarating. Email tasdiqlangandan
              so‘ng profilingiz uchun avatar qo‘shasiz.
            </p>

            <div className="kino-register-field">
              <label>Userze</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Userze"
                autoComplete="username"
              />
            </div>

            <div className="kino-register-field">
              <label>Ism</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Abdulqodir"
              />
            </div>

            <div className="kino-register-field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ashurovabdulqodir10@gmail.com"
                autoComplete="email"
              />
            </div>

            <div className="kino-register-field">
              <label>Parol</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Parol"
                autoComplete="new-password"
              />
            </div>

            <div className="kino-register-field">
              <label>Parolni takrorlash</label>
              <input
                type="password"
                value={password2}
                onChange={e => setPassword2(e.target.value)}
                placeholder="Parolni takrorlang"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="kino-register-error">
                {error}
              </div>
            )}

            <button
              className="kino-register-primary"
              onClick={register}
              disabled={loading}
            >
              {loading ? "Yuborilmoqda..." : "Tasdiqlash"}
            </button>
          </>
        )}

        {step === "code" && (
          <>
            <h1>Emailni tasdiqlash</h1>

            <p className="kino-register-description">
              Emailingizga yuborilgan 6 xonali tasdiqlash
              kodini kiriting.
            </p>

            <div className="kino-register-field">
              <label>Tasdiqlash kodi</label>
              <input
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={e =>
                  setCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                placeholder="000000"
              />
            </div>

            {message && (
              <div className="kino-register-success">
                {message}
              </div>
            )}

            {error && (
              <div className="kino-register-error">
                {error}
              </div>
            )}

            <button
              className="kino-register-primary"
              onClick={verifyCode}
              disabled={loading}
            >
              {loading ? "Tekshirilmoqda..." : "Kodni tasdiqlash"}
            </button>
          </>
        )}

        {step === "avatar" && (
          <>
            <h1>Profil rasmini qo‘shing</h1>

            <p className="kino-register-description">
              Endi akkauntingiz uchun avatar rasmini tanlang.
            </p>

            <label className="kino-avatar-picker">
              {avatar ? (
                <img
                  src={URL.createObjectURL(avatar)}
                  alt="Avatar"
                />
              ) : (
                <span>+<br />Avatar tanlash</span>
              )}

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={e =>
                  setAvatar(e.target.files?.[0] || null)
                }
              />
            </label>

            {error && (
              <div className="kino-register-error">
                {error}
              </div>
            )}

            <button
              className="kino-register-primary"
              onClick={finishProfile}
              disabled={loading}
            >
              {loading ? "Saqlanmoqda..." : "Profilni yakunlash"}
            </button>
          </>
        )}

        {step === "done" && (
          <>
            <h1>Akkaunt tayyor 🎉</h1>

            <div className="kino-register-success">
              Akkauntingiz muvaffaqiyatli yaratildi va
              profilingiz Supabase'ga saqlandi.
            </div>

            <button
              className="kino-register-primary"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Kino AI Studio'ga kirish
            </button>
          </>
        )}

      </div>
    </div>
  );
}

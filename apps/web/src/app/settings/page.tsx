"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api, ApiError } from "@/lib/api/client";
import { uploadFile } from "@/lib/api/upload";
import { initials } from "@/lib/utils";

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: userLoading } = useCurrentUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ name: "", phone: "", whatsapp: "", bio: "" });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!userLoading && !isAuthenticated) router.push("/login?redirect=/settings");
  }, [userLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, phone: "", whatsapp: "", bio: "" });
      setAvatarUrl(user.avatarUrl);
    }
  }, [user]);

  async function saveProfile() {
    setSaving(true);
    try {
      await api.patch("/api/users/me", { ...form, avatarUrl: avatarUrl ?? undefined });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't save profile");
    } finally {
      setSaving(false);
    }
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadFile(file, { context: "avatar" });
      setAvatarUrl(url);
      toast.success("Photo uploaded — don't forget to save");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function changePassword() {
    if (pwForm.newPassword.length < 8) return toast.error("New password must be at least 8 characters");
    setChangingPassword(true);
    try {
      await api.post("/api/auth/change-password", pwForm);
      setPwForm({ currentPassword: "", newPassword: "" });
      toast.success("Password changed");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't change password");
    } finally {
      setChangingPassword(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-2xl font-semibold text-white">Settings</h1>

      <section className="glass-card mb-6 p-6">
        <h2 className="mb-5 font-display text-lg font-semibold text-white">Profile</h2>

        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white/10 text-xl font-semibold"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(user.name)
            )}
            <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-60 transition-opacity sm:bg-black/50 sm:opacity-0 sm:hover:opacity-100">
              {uploadingAvatar ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
          <div>
            <p className="text-sm font-semibold text-white">{user.name}</p>
            <p className="text-xs text-white/40">{user.email}</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="field-label">Full name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+250…" />
            </div>
            <div>
              <label className="field-label">WhatsApp</label>
              <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="input" placeholder="+250…" />
            </div>
          </div>
          {["OWNER", "AGENT", "COMPANY"].includes(user.role) && (
            <div>
              <label className="field-label">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="input resize-none" />
            </div>
          )}
          <button onClick={saveProfile} disabled={saving} className="btn-primary self-start !px-5 !py-2.5 text-sm">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </section>

      <section className="glass-card p-6">
        <h2 className="mb-5 font-display text-lg font-semibold text-white">Change password</h2>
        <div className="grid gap-4">
          <div>
            <label className="field-label">Current password</label>
            <input
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="field-label">New password</label>
            <input
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              className="input"
            />
          </div>
          <button onClick={changePassword} disabled={changingPassword} className="btn-secondary self-start !px-5 !py-2.5 text-sm">
            {changingPassword ? "Updating…" : "Update password"}
          </button>
        </div>
      </section>
    </div>
  );
}

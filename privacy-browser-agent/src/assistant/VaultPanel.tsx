/**
 * VaultPanel.tsx
 * Side Panel view to manage the user's on-device privacy vault.
 * Blank by default: lets users enter, save, and autofill their own custom values.
 */

import React, { useState, useEffect } from "react";
import {
  loadProfileVault,
  saveProfileVault,
  clearProfileVault,
  EMPTY_PROFILE,
  hasVaultData,
  type UserProfile
} from "@/vault/ProfileVault";
import { startAgentTask } from "@/core/AgentController";

export const VaultPanel: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    loadProfileVault().then((loaded) => setProfile(loaded));
  }, []);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await saveProfileVault(profile);
    setSaveStatus("✓ Saved to Device!");
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleClear = async () => {
    const empty = await clearProfileVault();
    setProfile(empty);
    setSaveStatus("✓ Vault Cleared");
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleImportFromPage = async () => {
    try {
      setImportStatus("Scanning page...");
      const { perceivePage } = await import("@/core/Perception");
      const { extractProfileFromPageText } = await import("@/vault/ProfileVault");
      const perception = await perceivePage();
      const rawText = perception.pageContext?.text?.join("\n") || perception.pageText || "";
      
      if (!rawText.trim()) {
        setImportStatus("⚠️ No text found on page to extract.");
        setTimeout(() => setImportStatus(null), 3000);
        return;
      }
      
      const extracted = extractProfileFromPageText(rawText);
      const fieldsCount = Object.keys(extracted).length;
      if (fieldsCount === 0) {
        setImportStatus("⚠️ No personal fields found on this page.");
        setTimeout(() => setImportStatus(null), 3000);
        return;
      }
      
      const merged = await saveProfileVault(extracted);
      setProfile(merged);
      setImportStatus(`✓ Imported ${fieldsCount} fields from page!`);
      setTimeout(() => setImportStatus(null), 3500);
    } catch (err: any) {
      setImportStatus(`⚠️ Error: ${err.message || "Failed to scan"}`);
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  const handleAutofillClick = () => {
    if (!hasVaultData(profile)) {
      setSaveStatus("⚠️ Fill & save fields first!");
      setTimeout(() => setSaveStatus(null), 2500);
      return;
    }
    startAgentTask("autofill this form from local vault");
  };

  const isConfigured = hasVaultData(profile);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto px-4 py-3 space-y-4 text-xs text-zinc-900 dark:text-zinc-100">
      {/* Top Banner */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 ">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-semibold flex items-center gap-1.5 text-sm">
            🔒 Privacy Vault
          </span>
          <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
            isConfigured ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
          }`}>
            {isConfigured ? "Profile Configured" : "Empty (Decide Values)"}
          </span>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 leading-relaxed text-[11px] mb-3">
          Enter details manually or click <strong>Import from Page</strong> to automatically grab data from the current page. Data is stored 100% on-device.
        </p>

        {importStatus && (
          <div className="mb-2.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 shadow-inner text-zinc-900 dark:text-zinc-100 font-semibold text-[11px] text-center">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleImportFromPage}
            className="py-2 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 shadow-sm border border-zinc-200 dark:border-zinc-800 active:shadow-inner active:bg-zinc-100 dark:bg-zinc-800 text-sky-400 font-semibold hover:text-sky-300 transition-all flex items-center justify-center gap-1.5 text-[11px]"
            title="Scan current page and import detected details into your Vault"
          >
            <span>📥</span>
            <span>Import from Page</span>
          </button>
          <button
            onClick={handleAutofillClick}
            disabled={!isConfigured}
            className="py-2 px-3 rounded-lg bg-zinc-900 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 text-white font-semibold transition-all shadow-sm border border-zinc-200 dark:border-zinc-800 active:shadow-inner active:bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center gap-1.5 text-[11px]"
            title="Autofill current page with saved Vault data"
          >
            <span>⚡</span>
            <span>Autofill Page</span>
          </button>
        </div>
      </div>

      {/* Vault Fields Form */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-3">
        <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs border-b border-white/10 pb-1.5">
          Identity & Contacts
        </div>

        <div>
          <label className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 block mb-1">Full Name</label>
          <input
            type="text"
            placeholder="e.g. Aryan Dalwadi"
            value={profile.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-800 shadow-inner rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500/50 focus:border-zinc-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 block mb-1">Email</label>
            <input
              type="email"
              placeholder="e.g. user@example.com"
              value={profile.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 shadow-inner rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500/50"
            />
          </div>
          <div>
            <label className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 block mb-1">Phone</label>
            <input
              type="text"
              placeholder="e.g. +91 9876543210"
              value={profile.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 shadow-inner rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500/50"
            />
          </div>
        </div>

        <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs border-b border-white/10 pt-2 pb-1.5">
          National & Financial IDs
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 block mb-1">Aadhaar (12-digit)</label>
            <input
              type="text"
              placeholder="e.g. 5482 9103 4721"
              value={profile.aadhaar}
              onChange={(e) => handleChange("aadhaar", e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 shadow-inner rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500/50"
            />
          </div>
          <div>
            <label className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 block mb-1">PAN Card</label>
            <input
              type="text"
              placeholder="e.g. ABCDE1234F"
              value={profile.pan}
              onChange={(e) => handleChange("pan", e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 shadow-inner rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500/50"
            />
          </div>
        </div>

        <div>
          <label className="text-zinc-500 dark:text-zinc-400 block mb-1">Payment Card (16-digit)</label>
          <input
            type="text"
            placeholder="e.g. 4532 8901 2345 6789"
            value={profile.card}
            onChange={(e) => handleChange("card", e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-800 shadow-inner rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
          />
        </div>

        <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs border-b border-white/10 pt-2 pb-1.5">
          Bank Details
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-zinc-500 dark:text-zinc-400 block mb-1">Bank Name</label>
            <input
              type="text"
              placeholder="e.g. HDFC Bank"
              value={profile.bankName}
              onChange={(e) => handleChange("bankName", e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 shadow-inner rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
            />
          </div>
          <div>
            <label className="text-zinc-500 dark:text-zinc-400 block mb-1">IFSC Code</label>
            <input
              type="text"
              placeholder="e.g. HDFC0001234"
              value={profile.bankIfsc}
              onChange={(e) => handleChange("bankIfsc", e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 shadow-inner rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
            />
          </div>
        </div>
        
        <div>
          <label className="text-zinc-500 dark:text-zinc-400 block mb-1">Account Number</label>
          <input
            type="text"
            placeholder="e.g. 501002345678"
            value={profile.bankAccount}
            onChange={(e) => handleChange("bankAccount", e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-800 shadow-inner rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
          />
        </div>

        <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs border-b border-white/10 pt-2 pb-1.5">
          Authentication & Travel
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 block mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={profile.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 shadow-inner rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 outline-none font-mono placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500/50"
            />
          </div>
          <div>
            <label className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 block mb-1">OTP / 2FA</label>
            <input
              type="text"
              placeholder="e.g. 849201"
              value={profile.otp}
              onChange={(e) => handleChange("otp", e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 shadow-inner rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 block mb-1">Departure City</label>
            <input
              type="text"
              placeholder="e.g. Mumbai"
              value={profile.from}
              onChange={(e) => handleChange("from", e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 shadow-inner rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500/50"
            />
          </div>
          <div>
            <label className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 block mb-1">Destination City</label>
            <input
              type="text"
              placeholder="e.g. Delhi"
              value={profile.to}
              onChange={(e) => handleChange("to", e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 shadow-inner rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500/50"
            />
          </div>
        </div>

        <div>
          <label className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 block mb-1">API Key / Token</label>
          <input
            type="text"
            placeholder="e.g. sk-live-..."
            value={profile.apiKey}
            onChange={(e) => handleChange("apiKey", e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-800 shadow-inner rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500/50"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10 mt-3">
          <button
            onClick={handleClear}
            className="text-[11px] text-red-400/80 hover:text-red-400 transition-colors"
          >
            Clear Vault
          </button>

          <div className="flex items-center gap-2">
            {saveStatus && (
              <span className={`text-[11px] font-semibold ${
                saveStatus.includes("⚠️") ? "text-amber-400" : "text-emerald-400"
              }`}>
                {saveStatus}
              </span>
            )}
            <button
              onClick={handleSave}
              className="py-1.5 px-4 rounded-lg bg-zinc-900 text-white font-semibold hover:bg-zinc-900 text-white/90 transition-all text-xs shadow-sm border border-zinc-200 dark:border-zinc-800 active:shadow-inner active:bg-zinc-100 dark:bg-zinc-800"
            >
              Save Vault
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

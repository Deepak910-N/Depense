import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI, reminderAPI } from "../services/api";
import toast from "react-hot-toast";

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
        enabled ? "bg-primary-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [budget, setBudget] = useState(user?.monthly_budget || "");
  const [reminders, setReminders] = useState({
    reminder_time_1: "09:00",
    reminder_time_2: "20:00",
    is_enabled: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const prefs = await reminderAPI.getPreferences();
      setReminders({
        reminder_time_1: prefs.reminder_time_1?.slice(0, 5) || "09:00",
        reminder_time_2: prefs.reminder_time_2?.slice(0, 5) || "20:00",
        is_enabled: prefs.is_enabled,
      });
    } catch {
      // Default values are fine
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await authAPI.updateMe({
        name: name.trim(),
        monthly_budget: budget ? parseFloat(budget) : null,
      });
      updateUser(updated);
      toast.success("Profile updated");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveReminders = async () => {
    try {
      await reminderAPI.updatePreferences(reminders);
      toast.success("Reminder preferences saved");
    } catch {
      toast.error("Failed to save reminders");
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-20 sm:pb-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Profile */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Profile</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget (INR)</label>
          <input
            type="number"
            min="0"
            step="100"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="e.g. 30000"
          />
          <p className="text-xs text-gray-400 mt-1">Set to 0 or leave empty to disable budget tracking</p>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-medium hover:bg-primary-700 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* Reminders */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Daily Reminders</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {reminders.is_enabled ? "Email reminders are on" : "Email reminders are off"}
            </p>
          </div>
          <Toggle
            enabled={reminders.is_enabled}
            onChange={(val) => setReminders({ ...reminders, is_enabled: val })}
          />
        </div>

        <div className={`grid grid-cols-2 gap-4 transition-opacity duration-200 ${reminders.is_enabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reminder 1</label>
            <input
              type="time"
              value={reminders.reminder_time_1}
              onChange={(e) => setReminders({ ...reminders, reminder_time_1: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reminder 2</label>
            <input
              type="time"
              value={reminders.reminder_time_2}
              onChange={(e) => setReminders({ ...reminders, reminder_time_2: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSaveReminders}
          className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-medium hover:bg-primary-700 transition"
        >
          Save Reminder Settings
        </button>
      </div>
    </div>
  );
}

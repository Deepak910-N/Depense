import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI, reminderAPI } from "../services/api";
import toast from "react-hot-toast";

function Toggle({ enabled, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${enabled ? "bg-primary-600" : "bg-gray-200"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${enabled ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [budget, setBudget] = useState(user?.monthly_budget || "");
  const [reminders, setReminders] = useState({ reminder_time_1: "09:00", reminder_time_2: "20:00", is_enabled: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadReminders(); }, []);

  const loadReminders = async () => {
    try {
      const prefs = await reminderAPI.getPreferences();
      setReminders({ reminder_time_1: prefs.reminder_time_1?.slice(0, 5) || "09:00", reminder_time_2: prefs.reminder_time_2?.slice(0, 5) || "20:00", is_enabled: prefs.is_enabled });
    } catch {}
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await authAPI.updateMe({ name: name.trim(), monthly_budget: budget ? parseFloat(budget) : null });
      updateUser(updated);
      toast.success("Profile updated");
    } catch { toast.error("Failed"); }
    finally { setSaving(false); }
  };

  const handleSaveReminders = async () => {
    try { await reminderAPI.updatePreferences(reminders); toast.success("Saved"); }
    catch { toast.error("Failed"); }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-4 pt-4 pb-2 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide px-4 pb-4 space-y-4">
        {/* Profile */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-3">
          <h2 className="text-sm font-semibold text-gray-800">Profile</h2>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Monthly Budget (INR)</label>
            <input type="number" min="0" step="100" value={budget} onChange={(e) => setBudget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. 30000" />
          </div>
          <button onClick={handleSaveProfile} disabled={saving}
            className="w-full bg-primary-600 text-white py-2 rounded-lg text-sm font-medium active:bg-primary-700 disabled:opacity-50">
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

        {/* Reminders */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Daily Reminders</h2>
            <Toggle enabled={reminders.is_enabled} onChange={(val) => setReminders({ ...reminders, is_enabled: val })} />
          </div>
          <div className={`grid grid-cols-2 gap-3 transition-opacity ${reminders.is_enabled ? "" : "opacity-40 pointer-events-none"}`}>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Time 1</label>
              <input type="time" value={reminders.reminder_time_1}
                onChange={(e) => setReminders({ ...reminders, reminder_time_1: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Time 2</label>
              <input type="time" value={reminders.reminder_time_2}
                onChange={(e) => setReminders({ ...reminders, reminder_time_2: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <button onClick={handleSaveReminders}
            className="w-full bg-primary-600 text-white py-2 rounded-lg text-sm font-medium active:bg-primary-700">
            Save Reminders
          </button>
        </div>

        {/* Logout */}
        <button onClick={logout}
          className="w-full border border-red-200 text-red-600 py-2.5 rounded-xl text-sm font-medium active:bg-red-50">
          Logout
        </button>
      </div>
    </div>
  );
}

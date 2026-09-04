import { useState, useEffect } from "react";
import { recurringAPI } from "../services/api";
import { HiTrash, HiPlus } from "react-icons/hi";
import toast from "react-hot-toast";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "gpay", label: "GPay" },
  { value: "credit_card", label: "Card" },
];
const METHOD_LABELS = { cash: "Cash", gpay: "GPay", credit_card: "Card" };

export default function RecurringExpenses() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: "", vendor: "", payment_method: "gpay", day_of_month: "1", note: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadRecurring(); }, []);

  const loadRecurring = async () => {
    try { const data = await recurringAPI.list(); setItems(data); }
    catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await recurringAPI.create({ ...form, amount: parseFloat(form.amount), day_of_month: parseInt(form.day_of_month) });
      setItems([...items, created]);
      setForm({ amount: "", vendor: "", payment_method: "gpay", day_of_month: "1", note: "" });
      setShowForm(false);
      toast.success("Added");
    } catch (err) { toast.error(err.message || "Failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete?")) return;
    try { await recurringAPI.remove(id); setItems(items.filter((i) => i.id !== id)); toast.success("Deleted"); }
    catch { toast.error("Failed"); }
  };

  const monthlyTotal = items.filter((i) => i.is_active).reduce((s, i) => s + i.amount, 0);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-4 pt-4 pb-2 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recurring</h1>
          <p className="text-sm text-gray-500">{"\u20B9"}{monthlyTotal.toLocaleString("en-IN")}/month</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium active:bg-primary-700">
          <HiPlus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide px-4 pb-4">
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-gray-100 mb-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Amount</label>
                <input type="number" step="0.01" min="0" required value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Day</label>
                <input type="number" min="1" max="31" required value={form.day_of_month}
                  onChange={(e) => setForm({ ...form, day_of_month: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
            <input type="text" required value={form.vendor} placeholder="Vendor"
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white">
              {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <button type="submit" disabled={saving}
              className="w-full bg-primary-600 text-white py-2 rounded-lg text-sm font-medium active:bg-primary-700 disabled:opacity-50">
              {saving ? "Adding..." : "Save"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">No recurring expenses</p>
        ) : (
          <div className="space-y-1.5">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 px-4 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-gray-900 text-lg">{item.vendor}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_active ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
                      {item.is_active ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Day {item.day_of_month} · {METHOD_LABELS[item.payment_method]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900">{"\u20B9"}{item.amount.toLocaleString("en-IN")}</span>
                  <button onClick={() => handleDelete(item.id)} className="text-gray-300 active:text-red-500 p-1">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

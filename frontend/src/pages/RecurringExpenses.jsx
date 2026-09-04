import { useState, useEffect } from "react";
import { recurringAPI } from "../services/api";
import { HiTrash, HiPlus } from "react-icons/hi";
import toast from "react-hot-toast";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "gpay", label: "GPay" },
  { value: "credit_card", label: "Credit Card" },
];

const METHOD_LABELS = { cash: "Cash", gpay: "GPay", credit_card: "Credit Card" };

export default function RecurringExpenses() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    vendor: "",
    payment_method: "gpay",
    day_of_month: "1",
    note: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRecurring();
  }, []);

  const loadRecurring = async () => {
    try {
      const data = await recurringAPI.list();
      setItems(data);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await recurringAPI.create({
        ...form,
        amount: parseFloat(form.amount),
        day_of_month: parseInt(form.day_of_month),
      });
      setItems([...items, created]);
      setForm({ amount: "", vendor: "", payment_method: "gpay", day_of_month: "1", note: "" });
      setShowForm(false);
      toast.success("Recurring expense added");
    } catch (err) {
      toast.error(err.message || "Failed to add");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this recurring expense?")) return;
    try {
      await recurringAPI.remove(id);
      setItems(items.filter((i) => i.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const monthlyTotal = items.filter((i) => i.is_active).reduce((s, i) => s + i.amount, 0);

  return (
    <div className="max-w-2xl mx-auto pb-20 sm:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recurring Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monthly total: ₹{monthlyTotal.toLocaleString("en-IN")}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition"
        >
          <HiPlus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-gray-100 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number" step="0.01" min="0" required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day of Month</label>
              <input
                type="number" min="1" max="31" required
                value={form.day_of_month}
                onChange={(e) => setForm({ ...form, day_of_month: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
            <input
              type="text" required
              value={form.vendor}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g. Netflix, Rent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-medium hover:bg-primary-700 transition disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add Recurring Expense"}
          </button>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No recurring expenses yet</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{item.vendor}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_active ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
                    {item.is_active ? "Active" : "Paused"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Day {item.day_of_month} of every month · {METHOD_LABELS[item.payment_method]}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">₹{item.amount.toLocaleString("en-IN")}</span>
                <button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-500 transition">
                  <HiTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

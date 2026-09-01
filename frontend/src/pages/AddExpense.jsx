import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { expenseAPI } from "../services/api";
import toast from "react-hot-toast";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "gpay", label: "GPay" },
  { value: "credit_card", label: "Credit Card" },
];

export default function AddExpense() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: "",
    vendor: "",
    payment_method: "gpay",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const vendorRef = useRef(null);

  // Vendor auto-suggest
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (form.vendor.length >= 1) {
        try {
          const vendors = await expenseAPI.vendors(form.vendor);
          setSuggestions(vendors);
          setShowSuggestions(vendors.length > 0);
        } catch {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [form.vendor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!form.vendor.trim()) {
      toast.error("Enter a vendor name");
      return;
    }
    setLoading(true);
    try {
      await expenseAPI.create({
        ...form,
        amount: parseFloat(form.amount),
      });
      toast.success("Expense added!");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-20 sm:pb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Expense</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 space-y-5">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (INR)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-lg"
            placeholder="0.00"
            autoFocus
          />
        </div>

        {/* Vendor with auto-suggest */}
        <div className="relative" ref={vendorRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vendor / Platform</label>
          <input
            type="text"
            required
            value={form.vendor}
            onChange={(e) => setForm({ ...form, vendor: e.target.value })}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            placeholder="e.g. Swiggy, Amazon, Starbucks"
          />
          {showSuggestions && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
              {suggestions.map((v) => (
                <li
                  key={v}
                  onMouseDown={() => {
                    setForm({ ...form, vendor: v });
                    setShowSuggestions(false);
                  }}
                  className="px-4 py-2 hover:bg-primary-50 cursor-pointer text-sm"
                >
                  {v}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <div className="flex gap-2">
            {PAYMENT_METHODS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, payment_method: value })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition ${
                  form.payment_method === value
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
          <input
            type="text"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            placeholder="Lunch with team"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 transition disabled:opacity-50 text-lg"
        >
          {loading ? "Adding..." : "Add Expense"}
        </button>
      </form>
    </div>
  );
}

import { useState, useEffect } from "react";
import { expenseAPI } from "../services/api";
import { format } from "date-fns";
import { HiTrash } from "react-icons/hi";
import toast from "react-hot-toast";

const MONTHS = [
  { value: "", label: "All Months" },
  { value: "1", label: "January" }, { value: "2", label: "February" },
  { value: "3", label: "March" }, { value: "4", label: "April" },
  { value: "5", label: "May" }, { value: "6", label: "June" },
  { value: "7", label: "July" }, { value: "8", label: "August" },
  { value: "9", label: "September" }, { value: "10", label: "October" },
  { value: "11", label: "November" }, { value: "12", label: "December" },
];

const METHOD_LABELS = { cash: "Cash", gpay: "GPay", credit_card: "Credit Card" };

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, [month, year]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (month) params.month = parseInt(month);
      if (year) params.year = parseInt(year);
      const data = await expenseAPI.list(params);
      setExpenses(data);
    } catch (err) {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;
    try {
      await expenseAPI.remove(id);
      setExpenses(expenses.filter((e) => e.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="pb-20 sm:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            min="2020"
          />
        </div>
      </div>

      {/* Total */}
      <div className="bg-primary-50 rounded-2xl p-4 mb-4 flex justify-between items-center">
        <span className="text-sm font-medium text-primary-700">
          {expenses.length} transaction{expenses.length !== 1 ? "s" : ""}
        </span>
        <span className="text-lg font-bold text-primary-700">
          ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : expenses.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No expenses found</p>
      ) : (
        <div className="space-y-2">
          {expenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:shadow-sm transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{exp.vendor}</span>
                  {exp.is_recurring && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Recurring</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>{format(new Date(exp.date), "dd MMM yyyy")}</span>
                  <span className="px-2 py-0.5 bg-gray-50 rounded-full">
                    {METHOD_LABELS[exp.payment_method] || exp.payment_method}
                  </span>
                  {exp.note && <span className="truncate max-w-[150px]">{exp.note}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-900">
                  ₹{exp.amount.toLocaleString("en-IN")}
                </span>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="text-gray-300 hover:text-red-500 transition"
                >
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

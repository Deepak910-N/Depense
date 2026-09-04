import { useState, useEffect } from "react";
import { expenseAPI } from "../services/api";
import { format } from "date-fns";
import { HiTrash } from "react-icons/hi";
import toast from "react-hot-toast";

const MONTHS = [
  { value: "", label: "All" },
  { value: "1", label: "Jan" }, { value: "2", label: "Feb" }, { value: "3", label: "Mar" },
  { value: "4", label: "Apr" }, { value: "5", label: "May" }, { value: "6", label: "Jun" },
  { value: "7", label: "Jul" }, { value: "8", label: "Aug" }, { value: "9", label: "Sep" },
  { value: "10", label: "Oct" }, { value: "11", label: "Nov" }, { value: "12", label: "Dec" },
];
const METHOD_LABELS = { cash: "Cash", gpay: "GPay", credit_card: "Card" };

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadExpenses(); }, [month, year]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (month) params.month = parseInt(month);
      if (year) params.year = parseInt(year);
      const data = await expenseAPI.list(params);
      setExpenses(data);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;
    try {
      await expenseAPI.remove(id);
      setExpenses(expenses.filter((e) => e.id !== id));
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Fixed header */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Expenses</h1>
        <div className="flex gap-2">
          <select value={month} onChange={(e) => setMonth(e.target.value)}
            className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white">
            {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)}
            className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" min="2020" />
        </div>
      </div>

      {/* Summary bar */}
      <div className="mx-4 mb-2 bg-primary-50 rounded-xl px-3 py-2 flex justify-between items-center shrink-0">
        <span className="text-xs font-medium text-primary-700">{expenses.length} transaction{expenses.length !== 1 ? "s" : ""}</span>
        <span className="text-sm font-bold text-primary-700">{"\u20B9"}{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto scroll-hide px-4 pb-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : expenses.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">No expenses found</p>
        ) : (
          <div className="space-y-1.5">
            {expenses.map((exp) => (
              <div key={exp.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3.5 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-gray-900 text-base truncate">{exp.vendor}</span>
                    {exp.is_recurring && <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full shrink-0">Auto</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span>{format(new Date(exp.date), "dd MMM")}</span>
                    <span className="px-1.5 py-0.5 bg-gray-50 rounded-full">{METHOD_LABELS[exp.payment_method] || exp.payment_method}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-base font-semibold text-gray-900">{"\u20B9"}{exp.amount.toLocaleString("en-IN")}</span>
                  <button onClick={() => handleDelete(exp.id)} className="text-gray-300 active:text-red-500 p-1">
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

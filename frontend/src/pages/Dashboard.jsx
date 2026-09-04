import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { dashboardAPI } from "../services/api";
import StreakTracker from "../components/StreakTracker";
import BudgetProgress from "../components/BudgetProgress";
import VendorPieChart from "../components/charts/VendorPieChart";
import MonthlyBarChart from "../components/charts/MonthlyBarChart";
import MonthComparison from "../components/charts/MonthComparison";

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [vendorData, setVendorData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview"); // overview | charts

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const [s, v, t, st, c] = await Promise.all([
        dashboardAPI.summary(),
        dashboardAPI.byVendor(),
        dashboardAPI.monthlyTrend(),
        dashboardAPI.streak(),
        dashboardAPI.monthComparison(),
      ]);
      setSummary(s); setVendorData(v); setTrendData(t); setStreak(st); setComparison(c);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">
          Hey, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 text-sm">Your spending overview</p>
      </div>

      {/* Tab toggle */}
      <div className="px-4 pb-2 shrink-0">
        <div className="flex bg-gray-100 rounded-xl p-0.5">
          {["overview", "charts"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                tab === t ? "bg-white text-primary-600 shadow-sm" : "text-gray-500"
              }`}
            >
              {t === "overview" ? "Overview" : "Charts"}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto scroll-hide px-4 pb-4 space-y-3">
        {tab === "overview" ? (
          <>
            {/* KPI Grid */}
            {summary && (
              <div className="grid grid-cols-2 gap-2.5">
                <KPICard label="This Month" value={"\u20B9" + summary.total.toLocaleString("en-IN")} />
                <KPICard label="Transactions" value={summary.transaction_count} />
                <KPICard label="Daily Avg" value={"\u20B9" + summary.daily_average.toLocaleString("en-IN")} />
                <KPICard label="Top Vendor" value={summary.top_vendor || "\u2014"} sub={summary.top_vendor ? "\u20B9" + summary.top_vendor_amount.toLocaleString("en-IN") : ""} />
              </div>
            )}
            <StreakTracker currentStreak={streak.current_streak} longestStreak={streak.longest_streak} />
            <BudgetProgress spent={summary?.total || 0} budget={summary?.budget} />
            <MonthComparison data={comparison} />
          </>
        ) : (
          <>
            <VendorPieChart data={vendorData} />
            <MonthlyBarChart data={trendData} />
          </>
        )}
      </div>
    </div>
  );
}

function KPICard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
      {sub && <p className="text-sm text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

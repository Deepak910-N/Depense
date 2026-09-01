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

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [summaryRes, vendorRes, trendRes, streakRes, compRes] = await Promise.all([
        dashboardAPI.summary(),
        dashboardAPI.byVendor(),
        dashboardAPI.monthlyTrend(),
        dashboardAPI.streak(),
        dashboardAPI.monthComparison(),
      ]);
      setSummary(summaryRes);
      setVendorData(vendorRes);
      setTrendData(trendRes);
      setStreak(streakRes);
      setComparison(compRes);
    } catch (err) {
      console.error("Dashboard load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hey, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your spending overview</p>
      </div>

      {/* KPI Row */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="This Month" value={`₹${summary.total.toLocaleString("en-IN")}`} />
          <KPICard label="Transactions" value={summary.transaction_count} />
          <KPICard label="Daily Avg" value={`₹${summary.daily_average.toLocaleString("en-IN")}`} />
          <KPICard
            label="Top Vendor"
            value={summary.top_vendor || "\u2014"}
            sub={summary.top_vendor ? `₹${summary.top_vendor_amount.toLocaleString("en-IN")}` : ""}
          />
        </div>
      )}

      {/* Streak + Budget + Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StreakTracker currentStreak={streak.current_streak} longestStreak={streak.longest_streak} />
        <BudgetProgress spent={summary?.total || 0} budget={summary?.budget} />
        <MonthComparison data={comparison} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VendorPieChart data={vendorData} />
        <MonthlyBarChart data={trendData} />
      </div>
    </div>
  );
}

function KPICard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

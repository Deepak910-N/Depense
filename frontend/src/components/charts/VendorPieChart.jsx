import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6",
  "#8b5cf6", "#ef4444", "#14b8a6", "#f97316", "#06b6d4",
];

export default function VendorPieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No data for this month
      </div>
    );
  }

  const top5 = data.slice(0, 5);
  const grandTotal = top5.reduce((s, d) => s + d.total, 0);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <h3 className="text-sm font-medium text-gray-600 mb-2">Spending by Vendor</h3>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={top5}
            dataKey="total"
            nameKey="vendor"
            cx="50%"
            cy="50%"
            outerRadius={65}
            innerRadius={35}
            paddingAngle={2}
            label={false}
            labelLine={false}
          >
            {top5.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `INR ${value.toLocaleString("en-IN")}`} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 space-y-1.5">
        {top5.map((d, idx) => (
          <div key={d.vendor} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <span className="text-gray-700 truncate">{d.vendor}</span>
            </div>
            <span className="text-gray-900 font-medium ml-2 whitespace-nowrap">
              {grandTotal > 0 ? Math.round((d.total / grandTotal) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

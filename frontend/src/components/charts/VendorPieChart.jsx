import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

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

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <h3 className="text-sm font-medium text-gray-600 mb-4">Spending by Vendor</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="vendor"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={50}
            paddingAngle={2}
            label={({ vendor, percent }) =>
              `${vendor} (${(percent * 100).toFixed(0)}%)`
            }
            labelLine={true}
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `INR ${value.toLocaleString("en-IN")}`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

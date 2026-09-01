import { HiArrowUp, HiArrowDown, HiMinus } from "react-icons/hi";

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function MonthComparison({ data }) {
  if (!data) return null;

  const { current_total, previous_total, change_percentage, current_month, previous_month } = data;

  let icon, colorClass, label;
  if (change_percentage === null || change_percentage === undefined) {
    icon = <HiMinus className="w-5 h-5" />;
    colorClass = "text-gray-500";
    label = "No previous data";
  } else if (change_percentage > 0) {
    icon = <HiArrowUp className="w-5 h-5" />;
    colorClass = "text-red-600";
    label = `${change_percentage}% more than ${MONTH_NAMES[previous_month]}`;
  } else if (change_percentage < 0) {
    icon = <HiArrowDown className="w-5 h-5" />;
    colorClass = "text-green-600";
    label = `${Math.abs(change_percentage)}% less than ${MONTH_NAMES[previous_month]}`;
  } else {
    icon = <HiMinus className="w-5 h-5" />;
    colorClass = "text-gray-500";
    label = `Same as ${MONTH_NAMES[previous_month]}`;
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <h3 className="text-sm font-medium text-gray-600 mb-3">vs Last Month</h3>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full bg-gray-50 ${colorClass}`}>{icon}</div>
        <div>
          <p className={`text-sm font-semibold ${colorClass}`}>{label}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {MONTH_NAMES[previous_month]}: INR {previous_total.toLocaleString("en-IN")} |{" "}
            {MONTH_NAMES[current_month]}: INR {current_total.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}

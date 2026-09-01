export default function BudgetProgress({ spent, budget }) {
  if (!budget || budget <= 0) return null;

  const pct = Math.min((spent / budget) * 100, 100);
  const overBudget = spent > budget;

  let barColor = "bg-green-500";
  if (pct >= 80) barColor = "bg-red-500";
  else if (pct >= 60) barColor = "bg-yellow-500";

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-600">Monthly Budget</h3>
        <span className={`text-sm font-semibold ${overBudget ? "text-red-600" : "text-gray-700"}`}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className={`${barColor} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Spent: INR {spent.toLocaleString("en-IN")}</span>
        <span>Budget: INR {budget.toLocaleString("en-IN")}</span>
      </div>
      {overBudget && (
        <p className="text-red-600 text-xs mt-2 font-medium">
          Over budget by INR {(spent - budget).toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}

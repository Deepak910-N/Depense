import { HiFire } from "react-icons/hi";

export default function StreakTracker({ currentStreak, longestStreak }) {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 text-white">
      <div className="flex items-center gap-3">
        <HiFire className="w-10 h-10" />
        <div>
          <p className="text-3xl font-bold">{currentStreak} day{currentStreak !== 1 ? "s" : ""}</p>
          <p className="text-orange-100 text-sm">Current logging streak</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-orange-400/40">
        <p className="text-sm text-orange-100">
          Best streak: <span className="font-semibold text-white">{longestStreak} days</span>
        </p>
      </div>
    </div>
  );
}

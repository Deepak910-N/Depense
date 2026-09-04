import { HiFire } from "react-icons/hi";

export default function StreakTracker({ currentStreak, longestStreak }) {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white flex items-center justify-between">
      <div className="flex items-center gap-3">
        <HiFire className="w-10 h-10 shrink-0" />
        <div>
          <p className="text-2xl font-bold">{currentStreak} day{currentStreak !== 1 ? "s" : ""}</p>
          <p className="text-orange-100 text-xs">Logging streak</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-orange-100">Best</p>
        <p className="text-xl font-bold">{longestStreak}</p>
      </div>
    </div>
  );
}

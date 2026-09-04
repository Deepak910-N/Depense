import { HiFire } from "react-icons/hi";

export default function StreakTracker({ currentStreak, longestStreak }) {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-3.5 text-white flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <HiFire className="w-8 h-8 shrink-0" />
        <div>
          <p className="text-xl font-bold">{currentStreak} day{currentStreak !== 1 ? "s" : ""}</p>
          <p className="text-orange-100 text-[10px]">Logging streak</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-orange-100">Best</p>
        <p className="text-lg font-bold">{longestStreak}</p>
      </div>
    </div>
  );
}

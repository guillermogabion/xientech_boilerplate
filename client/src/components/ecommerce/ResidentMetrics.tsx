import {
  BoxIconLine,
  GroupIcon,
} from "../../icons";

interface ResidentMetricsProps {
  residentCount: number;
  blotterCount: number;
  remainingBudget: number;
  totalAppropriation: number;
}

export default function ResidentMetrics({ 
  residentCount, 
  blotterCount, 
  remainingBudget, 
  totalAppropriation 
}: ResidentMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      
      {/* 1. Total Residents */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 min-w-0">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-gray-800 shrink-0">
          <GroupIcon className="text-blue-600 size-6" />
        </div>
        <div className="flex items-end justify-between mt-5 min-w-0">
          <div className="w-full min-w-0">
            <span className="text-sm text-gray-500 dark:text-gray-400 block truncate">
              Total Residents
            </span>
            <h4 
              className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90 truncate" 
              title={residentCount.toLocaleString()}
            >
              {residentCount.toLocaleString()}
            </h4>
          </div>
        </div>
      </div>

      {/* 2. Active Blotter */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 min-w-0">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl dark:bg-gray-800 shrink-0">
          <BoxIconLine className="text-red-600 size-6" />
        </div>
        <div className="flex items-end justify-between mt-5 min-w-0">
          <div className="w-full min-w-0">
            <span className="text-sm text-gray-500 dark:text-gray-400 block truncate">
              Active Blotters
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90 truncate">
              {blotterCount.toLocaleString()}
            </h4>
            <p className="text-xs text-gray-400 mt-1 truncate">Excludes settled</p>
          </div>
        </div>
      </div>

      {/* 3. Financial - Total Disbursed */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 min-w-0">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-gray-800 shrink-0">
          <span className="text-green-600 font-bold text-lg">₱</span>
        </div>
        <div className="flex items-end justify-between mt-5 min-w-0">
          <div className="w-full min-w-0">
            <span className="text-sm text-gray-500 dark:text-gray-400 block truncate">
              Total Disbursed
            </span>
            <h4 
              className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90 truncate"
              title={`₱${remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            >
              ₱{remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h4>
          </div>
        </div>
      </div>

      {/* 4. Financial - Unliquidated */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 min-w-0">
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl dark:bg-gray-800 shrink-0">
          <span className="text-orange-600 font-bold text-lg">!</span>
        </div>
        <div className="flex items-end justify-between mt-5 min-w-0">
          <div className="w-full min-w-0">
            <span className="text-sm text-gray-500 dark:text-gray-400 block truncate">
              Unliquidated
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90 truncate">
              {totalAppropriation.toLocaleString()}
            </h4>
            <p className="text-xs text-gray-400 mt-1 truncate">Pending reports</p>
          </div>
        </div>
      </div>

    </div>
  );
}
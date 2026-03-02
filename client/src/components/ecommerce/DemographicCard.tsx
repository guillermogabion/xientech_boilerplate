import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import CountryMap from "./CountryMap";

export default function DemographicCard({ data }: { data: any }) {
  const safeData = Array.isArray(data) ? data : data?.data || [];
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 text-center">
        Household Distribution
      </h3>
      <div className="space-y-5 mt-6">
        {safeData.map((item: any, index: number) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                {item.purok}
              </p>
            </div>
            <div className="flex w-full max-w-[200px] items-center gap-3">
              <div className="relative block h-2 w-full rounded bg-gray-200 dark:bg-gray-800">
                <div 
                   className="absolute left-0 top-0 h-full rounded bg-brand-500" 
                   style={{ width: `${Math.min((item.count / 100) * 100, 100)}%` }} 
                ></div>
              </div>
              <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                {item.count}
              </p>
            </div>
          </div>
        ))}
        {safeData.length === 0 && <p className="text-center text-gray-500">No data available</p>}
      </div>
    </div>
  );
}

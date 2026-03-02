import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
export default function Health({ healthData, totalResidents }: { healthData?: any, totalResidents: number }) {
  const uniqueVulnerable = healthData?.vulnerableCount || 0;
  const vulnerabilityRate = totalResidents > 0 
    ? Math.round((uniqueVulnerable / totalResidents) * 100) 
    : 0;

  const series = [vulnerabilityRate];

  // --- ADD THIS OPTIONS OBJECT HERE ---
  const options: ApexOptions = {
    colors: ["#465FFF"], // You can change this to "#10B981" for a health-green look
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "80%" },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: (val) => val + "%",
          },
        },
      },
    },
    fill: { type: "solid" },
    stroke: { lineCap: "round" },
    labels: ["Vulnerability Rate"], // This is where you put the label!
  };

  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const pwdCount = healthData?.pwd || 0;
  const seniorCount = healthData?.senior || 0;
  const pregnantCount = healthData?.pregnant || 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Health Vulnerability
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Distribution of priority health sectors
            </p>
          </div>
          {/* Dropdown UI goes here */}
        </div>

        <div className="relative">
          <div className="max-h-[330px]" id="chartDarkStyle">
            <Chart options={options} series={series} type="radialBar" height={330} />
          </div>
          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-500">
             Active Monitoring
          </span>
        </div>

        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          There are <strong>{uniqueVulnerable}</strong> residents currently 
          identified in the vulnerability list.
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div className="text-center">
          <p className="mb-1 text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">PWD</p>
          <p className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">{pwdCount}</p>
        </div>
        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>
        <div className="text-center">
          <p className="mb-1 text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">Seniors</p>
          <p className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">{seniorCount}</p>
        </div>
        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>
        <div className="text-center">
          <p className="mb-1 text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">Pregnant</p>
          <p className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">{pregnantCount}</p>
        </div>
      </div>
    </div>
  );
}

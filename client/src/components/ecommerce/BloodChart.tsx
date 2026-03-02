import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";

export default function BloodChart({ bloodData }: { bloodData?: any }) {
  // Extract categories (A+, B-, etc.) and counts
  const safeData = Array.isArray(bloodData) ? bloodData : bloodData?.data || [];
  
  const categories = safeData.map((item: any) => item.bloodType);
  const counts = safeData.map((item: any) => item.count);

  const series = [
    {
      name: "Residents",
      data: counts.length > 0 ? counts : [0, 0, 0, 0], // Fallback to zeroes
    },
  ];

  const options: ApexOptions = {
    // ... (Keep most of your existing options)
    colors: ["#EF4444"], // Red color for blood theme
    xaxis: {
      type: "category",
      categories: categories.length > 0 ? categories : ["No Data"],
      // ... rest of your xaxis settings
    },
    // Change chart type to 'bar' for better distribution visualization
    chart: {
      type: 'bar',
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '40%',
      }
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Blood Type Distribution
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Emergency medical readiness overview
          </p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[500px] xl:min-w-full">
          <Chart options={options} series={series} type="bar" height={310} />
        </div>
      </div>
    </div>
  );
}
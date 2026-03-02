import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useMemo } from "react";

export default function ClinicVisitChart({ visitData }: { visitData?: any }) {
  const safeData = Array.isArray(visitData) ? visitData : visitData?.data || [];
  
  const series = useMemo(() => [
    {
      name: "Patient Visits",
      data: safeData.length > 0 ? safeData.map((d: any) => d.count) : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    }
  ], [safeData]);

  const options: ApexOptions = useMemo(() => ({
    colors: ["#10B981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 310,
      toolbar: { show: false },
      animations: { enabled: false }, 
      // FIX 1: Prevent the chart from constantly trying to resize itself
      redrawOnParentResize: false, 
      redrawOnWindowResize: true,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: safeData.length > 0 
        ? safeData.map((d: any) => d.month) 
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      crosshairs: { show: true }, // Helps guide the eye without flickering
    },
    yaxis: {
      title: { text: "No. of Patients" },
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      // FIX 2: Move the tooltip to a fixed position or follow the marker better
      followCursor: false, 
      theme: "light",
      style: {
        fontSize: '12px',
      },
      y: {
        formatter: (val) => `${val} Patients`,
      },
    },
    markers: {
      size: 4, // Make markers visible so the hover has a target
      strokeWidth: 2,
      hover: { size: 6 }
    }
  }), [safeData]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Clinic Visit Trends
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Monthly patient traffic at the Barangay Health Center
          </p>
      </div>

      {/* FIX 3: min-height and stable overflow to prevent scrollbar jumping */}
      <div className="relative w-full overflow-hidden min-h-[320px]">
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[600px] xl:min-w-full"> 
            <Chart 
              options={options} 
              series={series} 
              type="area" 
              height={310} 
              width="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
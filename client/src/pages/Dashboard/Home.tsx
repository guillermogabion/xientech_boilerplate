import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   
  }, []);


  return (
    <>
      <div>Hi i am dash board</div>
    </>
  );
}


// import { useEffect, useState } from "react";
// import ResidentMetrics from "../../components/ecommerce/ResidentMetrics";
// import ClinicVisitChart from "../../components/ecommerce/ClinicVisitChart";
// import Health from "../../components/ecommerce/Health";
// import Hearing from "../../components/ecommerce/Hearing";
// import DemographicCard from "../../components/ecommerce/DemographicCard";
// import PageMeta from "../../components/common/PageMeta";
// import BloodChart from "../../components/ecommerce/BloodChart";

// export default function Home() {
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // TEMPORARY: Dummy data for presentation/demo
//     const dummyData = {
//       residents: { count: 1248 },
//       blotter: { total: 14, pending: 5 },
//       households: { stats: { total: 312 } },
//       puroks: [
//         { purok: "Purok 1", count: 145 },
//         { purok: "Purok 2", count: 210 },
//         { purok: "Purok 3", count: 88 },
//         { purok: "Purok 4", count: 176 },
//         { purok: "Purok 5", count: 120 },
//       ],
//       hearings: [
//         { id: 1, blotter: { caseNumber: "2026-001", incidentType: "Land Dispute" }, scheduledDate: "2026-02-20", status: "Scheduled" },
//         { id: 2, blotter: { caseNumber: "2026-005", incidentType: "Physical Injury" }, scheduledDate: "2026-02-22", status: "Scheduled" },
//         { id: 3, blotter: { caseNumber: "2026-009", incidentType: "Noise Complaint" }, scheduledDate: "2026-02-25", status: "Scheduled" },
//       ],
//       health: {
//         vulnerableCount: 85,
//         pwd: 24,
//         senior: 45,
//         pregnant: 16
//       },
//       bloodDist: [
//         { bloodType: "A+", count: 45 },
//         { bloodType: "B+", count: 32 },
//         { bloodType: "O+", count: 110 },
//         { bloodType: "AB+", count: 12 },
//         { bloodType: "O-", count: 5 },
//       ],
//       financeSummary: {
//         totalDisbursed: 450230.50,
//         unliquidatedCount: 3,
//       },
//       clinicTrends: [
//         { month: "Jan", count: 45 },
//         { month: "Feb", count: 52 },
//         { month: "Mar", count: 38 },
//         { month: "Apr", count: 65 },
//         { month: "May", count: 48 },
//         { month: "Jun", count: 72 },
//         { month: "Jul", count: 85 },
//         { month: "Aug", count: 90 },
//         { month: "Sep", count: 60 },
//         { month: "Oct", count: 55 },
//         { month: "Nov", count: 40 },
//         { month: "Dec", count: 30 },
//       ]
//     };

//     // Simulate a short loading time for a realistic feel
//     const timer = setTimeout(() => {
//       setData(dummyData);
//       setLoading(false);
//     }, 800);

//     return () => clearTimeout(timer);
//   }, []);

//   if (loading) return <div className="p-10 text-center">Loading Dashboard Data...</div>;

//   return (
//     <>
//       <PageMeta title="XIENTECH | Barangay Dashboard" description="Overview" />
//       <div className="grid grid-cols-12 gap-4 md:gap-6">
//         <div className="col-span-12 space-y-6 xl:col-span-7">
//           <ResidentMetrics 
//             residentCount={data?.residents?.count || 0} 
//             blotterCount={data?.blotter?.total || 0} 
//             remainingBudget={data?.financeSummary?.totalDisbursed || 0}
//             totalAppropriation={data?.financeSummary?.unliquidatedCount || 0}
//           />
//           <ClinicVisitChart visitData={data?.clinicTrends} />
//         </div>

//         <div className="col-span-12 xl:col-span-5">
//           <Health healthData={data?.health} totalResidents={data?.residents?.count || 0} />
//         </div>

//         <div className="col-span-12">
//           <BloodChart bloodData={data?.bloodDist} />
//         </div>

//         <div className="col-span-12 xl:col-span-5">
//           <DemographicCard data={data?.puroks || []} />
//         </div>

//         <div className="col-span-12 xl:col-span-7">
//           <Hearing hearings={data?.hearings || []} />
//         </div>
//       </div>
//     </>
//   );
// }
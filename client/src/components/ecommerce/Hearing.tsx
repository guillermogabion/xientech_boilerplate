import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";



// Define the table data using the interface

export default function Hearing({ hearings }: { hearings: any }) {
  const safeHearings = Array.isArray(hearings) ? hearings : hearings?.data || [];
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Upcoming Hearings
      </h3>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>Case Number</TableCell>
              <TableCell isHeader>Incident Type</TableCell>
              <TableCell isHeader>Date & Time</TableCell>
              <TableCell isHeader>Status</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeHearings.map((h: any) => (
              <TableRow key={h.id}>
                {/* Use ?. to safely access nested blotter data */}
                <TableCell className="font-medium">
                  {h.blotter?.caseNumber || "N/A"}
                </TableCell>
                <TableCell>{h.blotter?.incidentType || "General"}</TableCell>
                <TableCell>
                  {h.scheduledDate ? new Date(h.scheduledDate).toLocaleDateString() : "TBA"}
                </TableCell>
                <TableCell>
                  <Badge color={h.status === 'Scheduled' ? "warning" : "success"}>
                    {h.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {safeHearings.length === 0 && (
          <p className="text-center py-4 text-gray-500">No upcoming hearings scheduled.</p>
        )}
      </div>
    </div>
  );
}

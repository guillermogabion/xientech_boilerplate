import React, { useEffect, useState } from 'react';
import { logService, AuditLog } from '../../services/logService';
import { useDebounce } from '../../hooks/useDebounce'; // Highly recommended to add a debounce hook

const LogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  
  const debouncedSearch = useDebounce(search, 500);
  const limit = 10;

  useEffect(() => {
    fetchLogs();
  }, [page, debouncedSearch, moduleFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await logService.getAll(page, limit, debouncedSearch, moduleFilter);
      setLogs(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("Error loading logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 bg-white rounded-sm border border-stroke shadow-default">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-black">System Audit Logs</h2>
        
        <div className="flex gap-4">
          {/* Module Filter */}
          <select 
            className="rounded border border-stroke py-2 px-4 outline-none focus:border-primary"
            value={moduleFilter}
            onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Modules</option>
            <option value="PUROK">Purok</option>
            <option value="STREET">Street</option>
            <option value="BLOTTER">Blotter</option>
            <option value="USER">User</option>
          </select>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search action or user..."
            className="rounded border border-stroke py-2 px-4 outline-none focus:border-primary"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left">
              <th className="py-4 px-4 font-medium text-black">Timestamp</th>
              <th className="py-4 px-4 font-medium text-black">User</th>
              <th className="py-4 px-4 font-medium text-black">Module</th>
              <th className="py-4 px-4 font-medium text-black">Action</th>
              <th className="py-4 px-4 font-medium text-black">Details</th>
              <th className="py-4 px-4 font-medium text-black">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10">Loading logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10">No logs found.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-[#eee]">
                  <td className="py-5 px-4 text-sm">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-5 px-4 text-sm">
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                  </td>
                  <td className="py-5 px-4">
                    <span className="inline-flex rounded-full bg-opacity-10 py-1 px-3 text-xs font-medium bg-primary text-primary">
                      {log.module}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-sm font-bold">
                    {log.action}
                  </td>
                  <td className="py-5 px-4 text-sm max-w-xs truncate" title={log.details}>
                    {log.details}
                  </td>
                  <td className="py-5 px-4 text-sm text-gray-500">
                    {log.ipAddress || 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-sm">
          Showing page {page} of {totalPages || 1} ({total} total logs)
        </p>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border rounded disabled:opacity-30 hover:bg-gray-100"
          >
            Previous
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded disabled:opacity-30 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogPage;
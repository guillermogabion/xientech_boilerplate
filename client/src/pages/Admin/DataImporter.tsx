import React, { useState } from 'react';
import { Upload, CheckCircle, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { getSmartSuggestions } from '../../utils/mapping';
import { importService } from '../../services/importService';
import { toast } from 'react-hot-toast';

const XIENTECH_FIELDS = [
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'lastName', label: 'Last Name', required: true },
  { key: 'birthDate', label: 'Birth Date', required: true },
  { key: 'gender', label: 'Gender', required: false },
  { key: 'purokName', label: 'Purok/Zone', required: true },
  { key: 'streetName', label: 'Street', required: true },
  { key: 'householdNo', label: 'Household Number', required: true },
];

export default function DataImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isMapping, setIsMapping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // New State for Progress

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error("Please upload a valid CSV file");
        return;
      }
      setFile(selectedFile);
      Papa.parse(selectedFile, {
        header: true,
        preview: 1,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length > 0) {
            const headers = Object.keys(results.data[0] as object);
            setFileHeaders(headers);
            const smartMapping = getSmartSuggestions(headers);
            setMapping(smartMapping);
            setIsMapping(true);
            toast.success("File detected. Please verify mappings.");
          }
        },
      });
    }
  };

  const handleStartImport = () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const allData = results.data;
          const batchSize = 10;
          const totalRows = allData.length;
          let totalSuccess = 0;
          let totalFailed = 0;
          let allErrors = [];

          // Process in batches of 10
          for (let i = 0; i < totalRows; i += batchSize) {
            const chunk = allData.slice(i, i + batchSize);
            
            // Call the backend for this specific batch
            const response = await importService.bulkImportResidents(chunk, mapping);
            
            totalSuccess += response.success;
            totalFailed += response.failed;
            if (response.errors) allErrors.push(...response.errors);

            // Update progress bar based on actual completion
            const currentProgress = Math.round(((i + chunk.length) / totalRows) * 100);
            setProgress(currentProgress);
          }

          // Final Notification Logic
          if (totalSuccess > 0 && totalFailed === 0) {
            toast.success(`Successfully imported ${totalSuccess} residents!`);
          } else {
            toast.custom((t) => (
              <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg p-4 flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Import Complete</p>
                  <p className="mt-1 text-sm text-gray-500">✅ {totalSuccess} | ❌ {totalFailed}</p>
                  {allErrors.length > 0 && (
                    <div className="mt-2 max-h-32 overflow-y-auto text-xs text-red-500">
                      {allErrors.slice(0, 5).map((err, idx) => <div key={idx}>{err}</div>)}
                      {allErrors.length > 5 && <div>...and {allErrors.length - 5} more</div>}
                    </div>
                  )}
                </div>
              </div>
            ), { duration: 6000 });
          }

          setIsMapping(false);
          setFile(null);
        } catch (error: any) {
          toast.error(error.message || "Connection failed during batch processing");
        } finally {
          setLoading(false);
          setTimeout(() => setProgress(0), 2000);
        }
      }
    });
  };
  const isReady = XIENTECH_FIELDS.filter(f => f.required).every(f => mapping[f.key]);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Adaptable Resident Import</h2>
        <p className="text-gray-500 text-sm mt-1">Map Barangay CSV columns to Xientech Smart System fields.</p>
      </div>

      {/* Progress Bar UI */}
      {loading && (
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-blue-700 dark:text-white">Importing Data...</span>
            <span className="text-sm font-medium text-blue-700 dark:text-white">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {!isMapping ? (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center transition-colors hover:border-blue-400">
          <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-upload" />
          <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
            <Upload className="size-12 text-blue-500 mb-4" />
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Upload Barangay CSV File</span>
            <span className="text-xs text-gray-400 mt-2">Maximum file size: 10MB (.csv only)</span>
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {XIENTECH_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/[0.02] rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  {mapping[field.key] ? (
                    <CheckCircle className="size-5 text-green-500" />
                  ) : (
                    <AlertCircle className={`size-5 ${field.required ? 'text-orange-500' : 'text-gray-400'}`} />
                  )}
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{field.label}</p>
                    {field.required && <span className="text-[10px] text-orange-500 uppercase font-bold">Required</span>}
                  </div>
                </div>
                <ArrowRight className="text-gray-300" />
                <select 
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm w-64 outline-none"
                  onChange={(e) => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                  value={mapping[field.key] || ""}
                >
                  <option value="">-- Select CSV Column --</option>
                  {fileHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button disabled={loading} onClick={() => setIsMapping(false)} className="px-6 py-2 text-gray-500">
              Cancel
            </button>
            <button 
                onClick={handleStartImport}
                disabled={!isReady || loading}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition ${
                    isReady && !loading ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-300 text-gray-500'
                }`}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {loading ? "Importing..." : "Initialize Smart Import"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
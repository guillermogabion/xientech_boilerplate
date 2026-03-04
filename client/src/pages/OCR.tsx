import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const OCR: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [scanData, setScanData] = useState<any>(null);

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    setIsFrozen(false);
    setScanData(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: 1280, height: 720 }
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { console.error("Camera Error", err); }
  };

  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current || !selectedStudent) {
      alert("Please select a student first!");
      return;
    }

    setLoading(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Resizing to 1000px width for high-concurrency stability
    const width = 1000;
    const scale = width / video.videoWidth;
    canvas.width = width;
    canvas.height = video.videoHeight * scale;

    const ctx = canvas.getContext('2d');
    if (ctx) { ctx.drawImage(video, 0, 0, canvas.width, canvas.height); }

    const tracks = (video.srcObject as MediaStream).getTracks();
    tracks.forEach(t => t.stop());
    setIsFrozen(true);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');
      formData.append('student_id', selectedStudent); 

      try {
        // REPLACE WITH YOUR ACTUAL URL
        const response = await axios.post('https://ian7117-sheet-scanner.hf.space/api/scan', formData);
        
        if (response.data && response.data.report) {
            setScanData(response.data);
            const { total_score, max_score, percentage } = response.data;
            setText(`Score: ${total_score}/${max_score} (${percentage}%)`);
        } else {
            setText("Scan Failed: No data returned from server.");
        }
      } catch (err) {
        setText("Connection Error. Check if server is awake.");
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg', 0.85); // 0.85 is the "sweet spot" for OMR circle clarity
  };

  const saveToDatabase = async () => {
    if (!scanData) return;
    try {
        // Example logic for database persistence
        alert(`Successfully saved ${scanData.total_score} for student ${selectedStudent}`);
        startCamera();
    } catch (e) { alert("Save Failed"); }
  };

  return (
    <div className="flex flex-col items-center p-4 gap-4 bg-gray-50 min-h-screen">
      <div className="w-full max-w-lg">
        <label className="text-xs font-bold text-gray-500">SELECT STUDENT</label>
        <select 
          className="w-full p-3 bg-white border rounded-xl shadow-sm"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">-- Select Name --</option>
          <option value="101">John Doe</option>
          <option value="102">Jane Smith</option>
        </select>
      </div>

      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden bg-black aspect-[3/4] border-4 border-white shadow-xl">
         <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${isFrozen ? 'hidden' : 'block'}`} />
         <canvas ref={canvasRef} className={`w-full h-full object-cover ${isFrozen ? 'block' : 'hidden'}`} />
         {loading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                Processing 50 Questions...
            </div>
         )}
      </div>

      <button 
        onClick={isFrozen ? startCamera : captureAndProcess} 
        disabled={loading}
        className={`w-full max-w-lg py-4 rounded-xl font-bold text-white transition-all ${isFrozen ? "bg-slate-700" : "bg-blue-600 shadow-lg active:scale-95"}`}
      >
        {isFrozen ? "NEW SCAN" : "SCAN PAPER"}
      </button>

      {scanData && (
        <div className="w-full max-w-lg animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-white rounded-xl shadow-sm border p-4 mb-4 text-center">
                <p className="text-sm font-bold text-gray-400">RESULT</p>
                <h2 className="text-4xl font-black text-blue-600">{text}</h2>
                <button onClick={saveToDatabase} className="mt-3 w-full py-2 bg-green-500 text-white rounded-lg font-bold">SAVE TO GRADEBOOK</button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4 max-h-80 overflow-y-auto">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b pb-2">Detailed Review</h3>
                <div className="grid grid-cols-1 gap-1">
                    {Object.entries(scanData.report)
                      // SORTING FIX: Ensures Q10 comes after Q9, not Q1
                      .sort((a, b) => parseInt(a[0].replace('Q', '')) - parseInt(b[0].replace('Q', '')))
                      .map(([q, details]: any) => (
                        <div key={q} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
                            <span className="font-bold text-gray-500 w-8">{q}</span>
                            <div className="flex gap-4 flex-1 px-4">
                                <span className="text-gray-400">Scan: <b className="text-gray-700">{details.scanned}</b></span>
                                <span className="text-gray-400">Key: <b className="text-gray-700">{details.correct}</b></span>
                            </div>
                            <span className={details.is_correct ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                {details.is_correct ? "CORRECT ✓" : "WRONG ✗"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default OCR;
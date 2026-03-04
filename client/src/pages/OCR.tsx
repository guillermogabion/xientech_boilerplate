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
    setScanData(null); // Clear previous data for new scan
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

    const width = 1000;
    const scale = width / video.videoWidth;
    canvas.width = width;
    canvas.height = video.videoHeight * scale;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    // Stop camera to save mobile battery
    const tracks = (video.srcObject as MediaStream).getTracks();
    tracks.forEach(t => t.stop());
    setIsFrozen(true);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');
      formData.append('student_id', selectedStudent); 

      try {
        const response = await axios.post('https://ian7117-sheet-scanner.hf.space/api/scan', formData);
        
        // Citing previous backend logic: ensure keys match total_score, max_score, etc.
        const { total_score, max_score, percentage } = response.data;
        setScanData(response.data); 
        setText(`Score: ${total_score} / ${max_score} (${percentage}%)`);
        
      } catch (err) {
        setText("Scan Failed. Server Busy or Image Unclear.");
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg', 0.7); 
  };

  // Logic to save to your database
  const saveToDatabase = async () => {
    if (!scanData) return;
    try {
        // Replace with your actual DB endpoint
        // await axios.post('/api/save-grade', { student_id: selectedStudent, score: scanData.total_score });
        alert("Grade Saved Successfully!");
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
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                Processing Paper...
            </div>
         )}
      </div>

      <button 
        onClick={isFrozen ? startCamera : captureAndProcess} 
        disabled={loading}
        className={`w-full max-w-lg py-4 rounded-xl font-bold text-white transition-all ${isFrozen ? "bg-gray-600" : "bg-blue-600 active:scale-95"}`}
      >
        {isFrozen ? "RE-SCAN" : "SCAN PAPER"}
      </button>

      {scanData && (
        <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-xl shadow-sm border p-4 mb-4 text-center">
                <p className="text-sm font-bold text-gray-500">SCAN RESULT</p>
                <h2 className="text-3xl font-black text-blue-600">{text.split('\n')[0]}</h2>
                <button onClick={saveToDatabase} className="mt-2 text-sm text-green-600 font-bold underline">CONFIRM & SAVE GRADE</button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4 max-h-60 overflow-y-auto">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Questions Review</h3>
                <div className="grid grid-cols-1 gap-2">
                    {Object.entries(scanData.report).map(([q, details]: any) => (
                    <div key={q} className="flex justify-between items-center text-sm border-b pb-1">
                        <span className="font-medium text-gray-700">{q}</span>
                        <div className="flex gap-4">
                        <span className="text-gray-500">Scan: {details.scanned}</span>
                        <span className={details.is_correct ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                            {details.is_correct ? "✓" : `✗ (${details.correct})`}
                        </span>
                        </div>
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
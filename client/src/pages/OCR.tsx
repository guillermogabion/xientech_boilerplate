import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const OCR: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [students, setStudents] = useState<{id: string, name: string}[]>([]); // DB Students
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [scanData, setScanData] = useState<any>(null);

  // Load students from your database on mount
  useEffect(() => {
    startCamera();
    // fetchStudentsFromDB().then(setStudents); 
  }, []);

  const startCamera = async () => {
    setIsFrozen(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: 1280, height: 720 } // 720p is enough for OMR!
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

    // WORKAROUND: High-concurrency resize (1000px)
    const width = 1000;
    const scale = width / video.videoWidth;
    canvas.width = width;
    canvas.height = video.videoHeight * scale;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

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
        
        // --- FIXING THE "UNDEFINED" ERROR HERE ---
        const { total_score, max_score, percentage, report } = response.data;
        setScanData(response.data); // Save full report
        setText(`Scan Complete for ID: ${selectedStudent}\nScore: ${total_score} / ${max_score} (${percentage}%)`);
        
      } catch (err) {
        setText("Scan Failed. Server Busy or Connection Lost.");
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg', 0.7); 
  };

  return (
    <div className="flex flex-col items-center p-4 gap-4 bg-gray-50 min-h-screen">
      {/* 1. AUTOCOMPLETE / SELECTION */}
      <div className="w-full max-w-lg">
        <label className="text-xs font-bold text-gray-500">SELECT STUDENT BEFORE SCANNING</label>
        <select 
          className="w-full p-3 bg-white border rounded-xl shadow-sm"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">-- Search Student Name --</option>
          <option value="101">John Doe</option>
          <option value="102">Jane Smith</option>
        </select>
      </div>

      {/* 2. CAMERA VIEW */}
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden bg-black aspect-[3/4] border-4 border-white shadow-xl">
         <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${isFrozen ? 'hidden' : 'block'}`} />
         <canvas ref={canvasRef} className={`w-full h-full object-cover ${isFrozen ? 'block' : 'hidden'}`} />
         {loading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">Processing...</div>}
      </div>

      <button onClick={isFrozen ? startCamera : captureAndProcess} className="w-full max-w-lg py-4 bg-blue-600 text-white rounded-xl font-bold">
        {isFrozen ? "NEW SCAN" : "SCAN PAPER"}
      </button>

      {scanData?.report && (
        <div className="w-full max-w-lg mt-2 bg-white rounded-xl shadow-sm border p-4 max-h-60 overflow-y-auto">
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
      )}
    </div>
  );
};

export default OCR;
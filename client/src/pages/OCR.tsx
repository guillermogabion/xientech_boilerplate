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

    // --- WORKAROUND: BROWSER-SIDE RESIZE ---
    // Instead of 4K, we send a 1000px width image. 
    // This allows 100 teachers to scan simultaneously without crashing HF.
    const width = 1000;
    const scale = width / video.videoWidth;
    canvas.width = width;
    canvas.height = video.videoHeight * scale;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Optional: Turn to grayscale here to save even more data
    }

    const tracks = (video.srcObject as MediaStream).getTracks();
    tracks.forEach(t => t.stop());
    setIsFrozen(true);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');
      formData.append('student_id', selectedStudent); // Pass the DB ID

      try {
        const response = await axios.post('https://ian7117-sheet-scanner.hf.space/api/scan', formData);
        setText(`Scan Complete for ID: ${selectedStudent}\nScore: ${response.data.score}`);
      } catch (err) {
        setText("Scan Failed. Server Busy.");
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg', 0.7); // 0.7 quality is perfect for OMR circles
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

      <div className="w-full max-w-lg p-4 bg-white rounded-xl shadow-sm border border-dashed">
        <pre className="text-sm">{text || "Ready to scan..."}</pre>
      </div>
    </div>
  );
};

export default OCR;
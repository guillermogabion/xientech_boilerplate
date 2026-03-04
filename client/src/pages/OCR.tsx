import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const OCR: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<HTMLDivElement>(null); // For auto-scroll
  
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [scanData, setScanData] = useState<any>(null);

  useEffect(() => {
    startCamera();
  }, []);

  // Auto-scroll to results when they arrive
  useEffect(() => {
    if (scanData && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scanData]);

  const startCamera = async () => {
    setIsFrozen(false);
    setScanData(null);
    setText("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
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

    // Use 1280px for better detail on 50 tiny bubbles
    const width = 1280;
    const scale = width / video.videoWidth;
    canvas.width = width;
    canvas.height = video.videoHeight * scale;

    const ctx = canvas.getContext('2d');
    if (ctx) { 
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
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
        
        if (response.data && response.data.report) {
            setScanData(response.data);
            const { total_score, max_score, percentage } = response.data;
            setText(`Score: ${total_score}/${max_score} (${percentage}%)`);
        } else {
            setText("Scan Failed: Border not detected.");
            startCamera();
        }
      } catch (err) {
        setText("Server Error. Ensure the border is visible.");
        startCamera();
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg', 0.92); // Higher quality for the Warp Transform
  };

  return (
    <div className="flex flex-col items-center p-4 gap-4 bg-gray-100 min-h-screen pb-20">
      {/* Student Selector */}
      <div className="w-full max-w-lg bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block">Student Identity</label>
        <select 
          className="w-full p-3 bg-gray-50 border-none rounded-xl font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">-- Select Student Name --</option>
          <option value="101">John Doe</option>
          <option value="102">Jane Smith</option>
        </select>
      </div>

      {/* Camera / Preview Window */}
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden bg-black aspect-[3/4] border-8 border-white shadow-2xl">
         <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${isFrozen ? 'hidden' : 'block'}`} />
         <canvas ref={canvasRef} className={`w-full h-full object-cover ${isFrozen ? 'block' : 'hidden'}`} />
         
         {/* The Overlay Guide: Tells teacher where to put the paper */}
         {!isFrozen && (
            <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none flex items-center justify-center">
                <div className="w-full h-full border-2 border-white/50 rounded-lg border-dashed"></div>
            </div>
         )}

         {loading && (
            <div className="absolute inset-0 bg-blue-600/80 flex flex-col items-center justify-center text-white z-20 backdrop-blur-sm">
                <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mb-4"></div>
                <p className="font-black text-lg">FLATTENING IMAGE...</p>
                <p className="text-xs opacity-80">Locating 4-point black frame</p>
            </div>
         )}
      </div>

      <button 
        onClick={isFrozen ? startCamera : captureAndProcess} 
        disabled={loading}
        className={`w-full max-w-lg py-5 rounded-2xl font-black text-lg transition-all active:scale-95 ${isFrozen ? "bg-gray-800 text-white" : "bg-blue-600 text-white shadow-[0_8px_0_rgb(30,64,175)] mb-2"}`}
      >
        {isFrozen ? "↺ SCAN NEXT STUDENT" : "📸 CAPTURE & GRADE"}
      </button>

      {/* Results Section */}
      <div ref={resultRef}>
        {scanData && (
            <div className="w-full max-w-lg space-y-4">
                {/* Score Card */}
                <div className="bg-white rounded-3xl shadow-xl p-6 text-center border-b-8 border-green-500">
                    <p className="text-xs font-black text-gray-400 uppercase mb-1">Final Examination Grade</p>
                    <h2 className="text-6xl font-black text-gray-900">{scanData.total_score}<span className="text-2xl text-gray-300">/50</span></h2>
                    <div className="mt-4 py-2 px-4 bg-green-100 text-green-700 rounded-full inline-block font-bold text-sm">
                        Performance: {scanData.percentage}%
                    </div>
                </div>

                {/* COMPUTER VIEW DEBUG: The "Trust" factor */}
                <div className="bg-white p-3 rounded-2xl shadow-md">
                    <p className="text-[10px] font-black text-gray-400 uppercase text-center mb-2">Algorithm View (Corrected Perspective)</p>
                    <img 
                        src={`data:image/jpeg;base64,${scanData.debug_image}`} 
                        alt="Flattened OMR" 
                        className="w-full rounded-lg border-2 border-dashed border-gray-200" 
                    />
                </div>

                {/* Detailed List */}
                <div className="bg-white rounded-3xl shadow-md overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b">
                        <h3 className="font-black text-gray-700 uppercase text-sm">Item Analysis</h3>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto px-6 py-2">
                        {Object.entries(scanData.report)
                        .sort((a, b) => parseInt(a[0].replace('Q', '')) - parseInt(b[0].replace('Q', '')))
                        .map(([q, details]: any) => (
                            <div key={q} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                                <span className="font-black text-blue-500 w-10">{q}</span>
                                <div className="flex-1 flex gap-6 text-xs font-bold">
                                    <span className="text-gray-400">STUDENT: <span className="text-gray-900">{details.scanned}</span></span>
                                    <span className="text-gray-400">KEY: <span className="text-gray-900">{details.correct}</span></span>
                                </div>
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${details.is_correct ? "bg-green-500" : "bg-red-500"}`}>
                                    {details.is_correct ? "✓" : "✕"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default OCR;
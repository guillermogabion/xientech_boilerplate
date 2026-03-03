import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const OCR: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [text, setText] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // New state for true errors
  const [loading, setLoading] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 1920 } // Requesting taller resolution for paper
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setErrorMsg("Camera access denied. Please enable permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setLoading(true);
    setErrorMsg(null); // Clear previous errors
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');

      try {
        const response = await axios.post('https://ian7117-sheet-scanner.hf.space/api/scan', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        const data = response.data;

        if (data.error) {
          setErrorMsg(data.error); // Show the exact string from backend
        } else {
          const formattedText = `Student: ${data.student_name || "Unknown"}\nID: ${data.student_id || "N/A"}\n---------------------------\nResults:\n${JSON.stringify(data.exam_results, null, 2)}`;
          setText(formattedText);
        }
      } catch (err: any) {
        console.error("API Error Detailed:", err);
        // Extract the most descriptive error message possible
        const message = err.response?.data?.error || err.message || "Unknown Server Error";
        setErrorMsg(`Connection Failed: ${message}`);
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="flex flex-col items-center p-4 gap-4 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-bold text-blue-900 mt-2">Exam Sheet Scanner</h2>

      {/* 1. BIGGER CAMERA FEED - Adjusted for Portrait Paper */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border-2 border-blue-200 shadow-2xl bg-black aspect-[3/4]">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        
        {/* Scanning Animation Overlay */}
        {cameraActive && !loading && (
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)] animate-pulse"></div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <span className="text-white font-medium">Analyzing Sheet...</span>
          </div>
        )}
      </div>

      {/* 2. ERROR MESSAGE DISPLAY */}
      {errorMsg && (
        <div className="w-full max-w-lg bg-red-100 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-red-800 font-bold text-sm uppercase">System Error</p>
              <p className="text-red-700 font-mono text-xs mt-1">{errorMsg}</p>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-red-500 font-bold">✕</button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* 3. ACTION BUTTONS */}
      <div className="flex gap-3 w-full max-w-lg">
        <button 
          onClick={captureAndProcess}
          disabled={loading || !cameraActive}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold shadow-lg transition-all transform active:scale-95"
        >
          {loading ? "Please Wait..." : "SCAN PAPER"}
        </button>
        
        <button 
          onClick={() => { setText(""); setErrorMsg(null); }}
          className="bg-white border border-gray-300 hover:bg-gray-100 px-6 py-4 rounded-xl font-semibold shadow-sm"
        >
          Reset
        </button>
      </div>

      {/* 4. RESULTS AREA */}
      <div className="w-full max-w-lg bg-white p-5 rounded-2xl shadow-md border border-gray-100">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-3">Extracted Data</h3>
        <div className="min-h-[120px] text-gray-800 whitespace-pre-wrap font-mono text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
          {text || "Align the exam paper within the frame and tap Scan."}
        </div>
      </div>
    </div>
  );
};

export default OCR;
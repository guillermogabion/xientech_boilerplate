import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const OCR: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [text, setText] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFrozen, setIsFrozen] = useState<boolean>(false); // New: Tracks freeze state

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setIsFrozen(false);
    setText("");
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 1920 } 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setErrorMsg("Camera access denied.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop()); // Shuts down camera hardware
    }
  };

  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current || isFrozen) return;

    setLoading(true);
    setErrorMsg(null);
    const canvas = canvasRef.current;
    const video = videoRef.current;

    // 1. Snapshot: Draw current video frame to the canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Freeze: Stop the camera hardware immediately
    stopCamera();
    setIsFrozen(true);

    // 3. Process: Send the captured blob to the backend
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');

      try {
        const response = await axios.post('https://ian7117-sheet-scanner.hf.space/api/scan', formData);
        const data = response.data;

        if (data.error) {
          setErrorMsg(data.error);
        } else {
          const formattedText = `Student: ${data.student_name || "Unknown"}\nID: ${data.student_id || "N/A"}\n---------------------------\nResults:\n${JSON.stringify(data.exam_results, null, 2)}`;
          setText(formattedText);
        }
      } catch (err: any) {
        const message = err.response?.data?.error || err.message || "Server Error";
        setErrorMsg(`Connection Failed: ${message}`);
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="flex flex-col items-center p-4 gap-4 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-bold text-blue-900 mt-2">Exam Sheet Scanner</h2>

      {/* 1. CAMERA / FREEZE DISPLAY */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border-2 border-blue-200 shadow-2xl bg-black aspect-[3/4]">
        {/* Toggle between live Video and the frozen Canvas */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className={`w-full h-full object-cover ${isFrozen ? 'hidden' : 'block'}`}
        />
        <canvas 
          ref={canvasRef} 
          className={`w-full h-full object-cover ${isFrozen ? 'block' : 'hidden'}`}
        />
        
        {loading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <span className="text-white font-medium">Analyzing Sheet...</span>
          </div>
        )}
      </div>

      {/* 2. ERROR DISPLAY */}
      {errorMsg && (
        <div className="w-full max-w-lg bg-red-100 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-800 font-bold text-sm uppercase">Error</p>
          <p className="text-red-700 font-mono text-xs">{errorMsg}</p>
        </div>
      )}

      {/* 3. DYNAMIC BUTTONS */}
      <div className="flex gap-3 w-full max-w-lg">
        {!isFrozen ? (
          <button 
            onClick={captureAndProcess}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all active:scale-95"
          >
            SCAN PAPER
          </button>
        ) : (
          <button 
            onClick={startCamera}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all active:scale-95"
          >
            NEW SCAN
          </button>
        )}
      </div>

      {/* 4. RESULTS */}
      <div className="w-full max-w-lg bg-white p-5 rounded-2xl shadow-md border border-gray-100">
        <h3 className="text-xs font-black uppercase text-gray-400 mb-3">Extracted Data</h3>
        <div className="min-h-[120px] text-gray-800 whitespace-pre-wrap font-mono text-sm bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
          {text || "Results will appear here."}
        </div>
      </div>
    </div>
  );
};

export default OCR;
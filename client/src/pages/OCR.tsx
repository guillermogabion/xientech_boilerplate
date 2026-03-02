import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const OCR: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  // Start Camera on Page Load
  useEffect(() => {
    startCamera();
    return () => stopCamera(); // Cleanup on unmount
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } // Prefers back camera on phones
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Please allow camera access to use this feature.");
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
    const canvas = canvasRef.current;
    const video = videoRef.current;

    // 1. Draw current video frame to hidden canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Convert canvas to Blob (file-like object)
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');

      try {
        const response = await axios.post('http://10.207.237.236:8000/api/ocr', formData);
        setText(response.data.text || "No text found.");
      } catch (err) {
        setText("Error: Make sure Python server is on port 8000 and Tesseract is installed.");
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg');
  };

  return (
    <div className="flex flex-col items-center p-5 gap-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800">Real-Time OCR Scanner</h2>

      {/* 1. EMBEDDED CAMERA FEED */}
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border-4 border-white shadow-lg bg-black aspect-video">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Processing...</span>
          </div>
        )}
      </div>

      {/* HIDDEN CANVAS FOR CAPTURING */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 2. ACTION BUTTONS */}
      <div className="flex gap-4">
        <button 
          onClick={captureAndProcess}
          disabled={loading || !cameraActive}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-md transition-all active:scale-95"
        >
          {loading ? "Scanning..." : "Capture & Extract"}
        </button>
        
        <button 
          onClick={() => setText("")}
          className="bg-gray-300 hover:bg-gray-400 px-6 py-3 rounded-full font-semibold"
        >
          Clear Results
        </button>
      </div>

      {/* 3. DISPLAY AREA BELOW CAMERA */}
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-inner border border-gray-200">
        <h3 className="text-sm font-bold uppercase text-gray-400 mb-2">Extracted Details</h3>
        <div className="min-h-[100px] text-gray-700 whitespace-pre-wrap font-mono text-sm">
          {text || (loading ? "Waiting for results..." : "Captured text will appear here.")}
        </div>
      </div>
    </div>
  );
};

export default OCR;
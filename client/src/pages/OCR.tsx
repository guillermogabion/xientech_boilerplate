import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const OCR: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [text, setText] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFrozen, setIsFrozen] = useState<boolean>(false); // State to track "Freeze"

  // Starts the camera
  const startCamera = async () => {
    setIsFrozen(false);
    setText("");
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 1920 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setErrorMsg("Camera access denied.");
    }
  };

  // Stops the stream (This "Freezes" the video frame on screen)
  const freezeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop()); // Stop hardware camera
      setIsFrozen(true);
    }
  };

  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current || isFrozen) return;

    setLoading(true);
    setErrorMsg(null);
    
    const canvas = canvasRef.current;
    const video = videoRef.current;

    // 1. Draw frame to canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Freeze the view immediately
    freezeCamera();

    // 3. Convert to blob and send to Hugging Face
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
          setText(`Student: ${data.student_name}\nID: ${data.student_id}\n\nResults:\n${JSON.stringify(data.exam_results, null, 2)}`);
        }
      } catch (err: any) {
        setErrorMsg(err.response?.data?.error || "Server connection failed.");
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="flex flex-col items-center p-4 gap-4 bg-gray-50 min-h-screen">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border-2 border-blue-200 shadow-2xl bg-black aspect-[3/4]">
        {/* If frozen, the video element will hold the last frame naturally in many browsers, 
            but using the canvas to display the freeze is more reliable */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className={`w-full h-full object-cover ${isFrozen ? 'hidden' : 'block'}`}
        />
        {isFrozen && (
          <canvas 
            ref={canvasRef} 
            className="w-full h-full object-cover block"
          />
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-white mb-2"></div>
            <p className="text-white text-sm font-bold">ANALYZING...</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 w-full max-w-lg">
        {!isFrozen ? (
          <button 
            onClick={captureAndProcess}
            className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold"
          >
            SCAN NOW
          </button>
        ) : (
          <button 
            onClick={startCamera}
            className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold"
          >
            RETAKE / NEW SCAN
          </button>
        )}
      </div>

      {/* Error & Result UI as before... */}
    </div>
  );
};

export default OCR;
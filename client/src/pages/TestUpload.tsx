import React, { useState } from 'react';

declare global {
  interface Window {
    cloudinary: any;
  }
}

const TestUpload = () => {
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleOpenWidget = () => {
    // Check if the script loaded correctly
    if (!window.cloudinary) {
      alert("Cloudinary script not loaded. Check your index.html!");
      return;
    }

    // @ts-ignore
    window.cloudinary.openUploadWidget(
      {
        cloudName: "dxif6pha4" , // REPLACE WITH YOUR CLOUD NAME
        uploadPreset: "swgtnfnq",    // REPLACE WITH YOUR UNSIGNED PRESET
        sources: ["local", "camera"],
        multiple: false,
      },
      (error: any, result: any) => {
        if (!error && result.event === "success") {
          console.log("Upload Success:", result.info.secure_url);
          setImageUrl(result.info.secure_url);
        }
      }
    );
  };

  return (
    <div className="p-10 flex flex-col items-center gap-5">
      <h1 className="text-2xl font-bold">Cloudinary Test Page</h1>
      
      <button
        onClick={handleOpenWidget}
        className="bg-blue-600 text-white px-6 py-2 rounded shadow-md hover:bg-blue-700 transition"
      >
        Upload File
      </button>

      {imageUrl && (
        <div className="mt-5 border p-4 rounded bg-gray-50 text-center">
          <p className="text-sm text-gray-600 mb-2">Successfully Uploaded!</p>
          <img src={imageUrl} alt="Preview" className="max-w-xs rounded shadow-lg" />
          <p className="mt-2 text-xs text-blue-500 break-all">{imageUrl}</p>
        </div>
      )}
    </div>
  );
};

export default TestUpload;
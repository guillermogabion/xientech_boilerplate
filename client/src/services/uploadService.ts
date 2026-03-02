import axios from "axios";

const CLOUDINARY_UPLOAD_PRESET = "swgtnfnq"; 
const CLOUDINARY_CLOUD_NAME = "dxif6pha4";

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    formData
  );

  return response.data.secure_url;
};
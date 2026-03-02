import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon, UserIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { userService } from "../../services/userService";

const ROLES = ["SUPER_ADMIN", "ADMIN", "CAPTAIN", "COUNCILOR", "SECRETARY", "TREASURER", "STAFF", "BHW", "BNS", "TANOD", "SK_CHAIRMAN"];

const formatEnum = (text: string) => {
  return text.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  pic?: string;
}

interface SignUpFormProps {
  userToEdit?: User | null;
  onSuccess?: () => void;
}

export default function SignUpForm({ userToEdit = null, onSuccess = () => {} }: SignUpFormProps) {
  const navigate = useNavigate();
  const isEditMode = !!userToEdit;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(isEditMode);
  const [loading, setLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [adminExists, setAdminExists] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "STAFF",
    pic: "",
  });

  // Check for existing Admin on mount
  // useEffect(() => {
  //   const checkAdmins = async () => {
  //     try {
  //       const response = await userService.checkAdminStatus(); 
  //       // Logic: If any user in this organization has the role ADMIN
  //       const hasAdmin = response.data.some((u: User) => u.role === "ADMIN");
  //       setAdminExists(hasAdmin);
  //     } catch (err) {
  //       console.error("Verification error:", err);
  //     }
  //   };
  //   checkAdmins();
  // }, []);

  useEffect(() => {
    if (isEditMode && userToEdit) {
      setFormData({
        firstName: userToEdit.firstName || "",
        lastName: userToEdit.lastName || "",
        username: userToEdit.username || "",
        email: userToEdit.email || "",
        password: "",
        role: userToEdit.role || "STAFF",
        pic: userToEdit.pic || "",
      });
    }
  }, [isEditMode, userToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("Image too large (Max 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setFormData((prev) => ({ ...prev, pic: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isChecked && !isEditMode) {
      setErrorMessage("Please agree to the terms.");
      return;
    }

    setLoading(true);
    setSubmissionStatus("idle");

    try {
      const dataToSend: any = {
        ...formData,
        role: formData.role.toUpperCase(),
        // Backend expects designation as an array or string that it converts
      };

      if (isEditMode && !formData.password) delete dataToSend.password;

      if (isEditMode && userToEdit) {
        await userService.update(userToEdit.id, dataToSend);
        setSubmissionStatus("success");
        setTimeout(() => onSuccess(), 1500);
      } else {
        await userService.create(dataToSend);
        setSubmissionStatus("success");
        // Only navigate to signin if they just created the VERY first admin
        // otherwise, stay on the dashboard if an admin created a staff
        setTimeout(() => navigate(adminExists ? "/users" : "/signin"), 2000);
      }
    } catch (err: any) {
      setSubmissionStatus("error");
      setErrorMessage(err.response?.data?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {isEditMode ? "Update User" : "Create Account"}
          </h1>
          {errorMessage && <p className="mt-2 text-sm text-red-500">{errorMessage}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           {/* Profile Pic */}
           <div className="flex flex-col items-center mb-6">
            <div className="relative overflow-hidden bg-gray-100 rounded-full size-20 dark:bg-gray-800">
              {formData.pic ? (
                <img src={formData.pic} alt="Profile" className="object-cover w-full h-full" />
              ) : (
                <div className="flex items-center justify-center h-full"><UserIcon /></div>
              )}
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 text-xs text-brand-500">
              Change Photo
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
            <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>

          <Input label="Username" name="username" value={formData.username} onChange={handleChange} required />
          <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />

          <div className="relative">
            <Input label={`Password ${isEditMode ? '(Optional)' : ''}`} name="password" value={formData.password} onChange={handleChange} type={showPassword ? "text" : "password"} required={!isEditMode} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400">
              {showPassword ? <EyeIcon className="size-5" /> : <EyeCloseIcon className="size-5" />}
            </button>
          </div>

          <div>
            <Label>Role</Label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              className="w-full mt-1.5 h-11 px-4 text-sm bg-white border border-gray-300 rounded-lg dark:bg-gray-900 dark:border-gray-700"
            >
              {ROLES.filter(role => {
                // If an admin already exists in the org, don't allow creating another one
                // unless we are editing the existing admin.
                if (adminExists && role === "ADMIN") {
                  return isEditMode && userToEdit?.role === "ADMIN";
                }
                return true;
              }).map(r => (
                <option key={r} value={r}>{formatEnum(r)}</option>
              ))}
            </select>
          </div>

          {!isEditMode && (
            <div className="flex items-center gap-3">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <span className="text-xs text-gray-500">I agree to the terms</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full py-3 rounded-lg text-white font-medium ${submissionStatus === 'success' ? 'bg-green-500' : 'bg-brand-500'}`}
          >
            {loading ? "Saving..." : isEditMode ? "Update" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
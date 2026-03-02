import { useState } from "react";
import { authService } from "../../services/authService";
import { Link, useNavigate } from "react-router"; // Added useNavigate
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { generateClientHash } from '../../utils/crypto.ts';
import { useAuth } from "../../context/AuthContext.tsx";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const { login } = useAuth(); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "", // Changed from email to username to match your backend
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear the error message as soon as the user starts typing again
    if (errorMessage) setErrorMessage(""); 
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setLoading(true);
  setErrorMessage("");
  setSubmissionStatus("idle"); // Reset status

  try {
    if (!navigator.onLine) {
      const offlineData = localStorage.getItem("offline_identity");
      if (offlineData) {
        const cached = JSON.parse(offlineData);
        if (cached.username === formData.username) {
          const enteredHash = await generateClientHash(formData.username, formData.password);
          if (enteredHash === cached.password) {
            if (cached.token) localStorage.setItem("token", cached.token);
            
            const offlineUser = {
              username: cached.username,
              role: cached.role,
              designation: cached.designation || 'NULL' 
            };

            localStorage.setItem("user", JSON.stringify(offlineUser));
            login(offlineUser); 
            setSubmissionStatus("success");
            navigate("/", { replace: true }); // Use replace to prevent back-loops
            return; 
          } else {
            setErrorMessage("Invalid offline password.");
          }
        } else {
          setErrorMessage("User not recognized on this device.");
        }
      } else {
        setErrorMessage("No offline data found. Please login online first.");
      }
      setLoading(false); // Manually stop loading on local failures
      return;
    }

    // --- ONLINE LOGIC ---
    const data = await authService.login(formData);
    
    // 1. Update Storage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    if (data.user.offlineKey) {
      localStorage.setItem("offline_identity", JSON.stringify({
        username: data.user.username,
        role: data.user.role,
        designation: data.user.designation,
        password: data.user.offlineKey, 
        token: data.token
      }));
    }

    // 2. Update Global Context State
    login(data.user); 
    
    // 3. Navigate only after state is synced
    setSubmissionStatus("success");
    navigate("/", { replace: true });

  } catch (err: any) {
    // This block catches 401, 500, etc.
    // It keeps the user ON the page and just shows the message
    console.error("LOGIN FAILED:", err);
    setSubmissionStatus("error");
    setErrorMessage(
      err.response?.data?.message || 
      "Login failed. Please check your credentials or connection."
    );
  } finally {
    setLoading(false); // Stops the spinner without refreshing
  }
};

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your username and password to sign in!
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-lg dark:bg-red-500/10">
              {errorMessage}
            </div>
          )}

          <div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Username <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input 
                    name="username"
                    placeholder="Enter your username" 
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button className="w-full" size="sm" disabled={loading} type="submit">
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
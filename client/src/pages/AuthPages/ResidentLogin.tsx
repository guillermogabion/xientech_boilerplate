import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import ComponentCard from "../../components/common/ComponentCard";
import { residentAuthService } from "../../services/residentAuthService";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import { useAuth } from "../../context/AuthContext";
export default function ResidentLogin() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await residentAuthService.login(formData);
      
      const residentUser = {
        ...data.user,
        role: undefined,      
        designation: undefined, 
      };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(residentUser));
      login(residentUser);
      if (data.user.status === "INACTIVE") {
        navigate("/activate-account"); 
      } else {
        navigate("/request");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <ComponentCard title="Resident Portal">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Welcome, Resident!</h2>
              <p className="text-sm text-gray-500">Sign in to request certificates and view SK programs.</p>
            </div>

            {error && <div className="p-3 text-sm text-red-500 bg-red-100 rounded-lg">{error}</div>}

            <div>
              <Label>Username</Label>
              <Input 
                type="text" 
                placeholder="Enter username" 
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required 
              />
            </div>

            <div>
              <Label>Password / Birthdate</Label>
              <Input 
                type={showPassword ? "text" : "password"}
                placeholder="MMDDYYYY" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required 
              />
              <p className="mt-1 text-xs text-gray-400">Default password is your Birthdate (YYYY-MM-DD)</p>
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

            <Button className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center">
              <Link to="/forgot-password" size="sm" className="text-sm text-primary-500 hover:underline">
                Forgot Password?
              </Link>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import { residentAuthService } from "../../services/residentAuthService";

export default function ActivateAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  


  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    // 1. If no token, they didn't log in at all
    if (!token) {
      navigate("/resident-login");
      return;
    }

    // 2. If they are already ACTIVE, they don't belong here
    if (user.status === "ACTIVE") {
      navigate("/resident/dashboard");
      return;
    }
  }, [token, user, navigate]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
        setError("Passwords do not match!");
        return;
    }

    setLoading(true);
    setError("");

    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        // Call the service we just created
        await residentAuthService.activateAccount({
        residentId: Number(user.id),
        email: email,
        password: password, // This is the new permanent password
        });

        // 1. Update the local user status so ProtectedRoute doesn't redirect them back
        const updatedUser = { ...user, status: "ACTIVE" };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // 2. Success Feedback
        alert("Account successfully activated!");
        navigate("/request");
        
    } catch (err: any) {
        setError(err.response?.data?.message || "Failed to activate account. Try again.");
    } finally {
        setLoading(false);
    }
    };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <ComponentCard title="Activate Your Account">
          <form onSubmit={handleActivate} className="p-6 space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Please set a permanent email and a new password to secure your account.
            </p>

            {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}

            <div>
              <Label>Permanent Email</Label>
              <Input 
                type="email" 
                placeholder="email@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div>
              <Label>New Password</Label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <div>
              <Label>Confirm New Password</Label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>

            <Button className="w-full" disabled={loading}>
              {loading ? "Activating..." : "Complete Activation"}
            </Button>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
}
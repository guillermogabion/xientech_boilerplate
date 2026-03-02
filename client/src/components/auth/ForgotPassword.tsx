import { useState } from "react";
import { Link } from "react-router-dom"; // Consistent import
import { userService } from "../../services/userService";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { ChevronLeftIcon } from "../../icons";
import ComponentCard from "../common/ComponentCard";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await userService.forgotPassword(email);
      setMessage("A reset link has been sent to your email address.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /** * Added 'min-h-screen' and 'justify-center' to the outer wrapper 
     * to ensure the card itself sits in the center of the viewport.
     **/
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-lg">
        <ComponentCard title="Forgot Password">
          <div className="p-4 sm:p-6">
            <div className="mb-5 sm:mb-8">
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 mb-6 text-sm text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                <ChevronLeftIcon className="size-4" />
                Back to Sign In
              </Link>
              
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Reset your password
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Success/Error Alerts */}
            {message && (
              <div className="p-3 mb-4 text-sm text-green-600 bg-green-100 rounded-lg dark:bg-green-500/10 dark:text-green-400">
                {message}
              </div>
            )}
            {error && (
              <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-lg dark:bg-red-500/10">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email Address <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button className="w-full" size="sm" disabled={loading} type="submit">
                  {loading ? "Sending Link..." : "Send Reset Link"}
                </Button>
              </div>
            </form>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
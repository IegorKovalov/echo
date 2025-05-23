import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Sparkles, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/UI/LoadingSpinner";

const OTPVerificationPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { verifyOTP: contextVerifyOTP, resendOTP: contextResendOTP, loading: authLoading } = useAuth();
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  
  const inputRefs = useRef([]);
  
  // Set up timer for OTP expiration
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);
  
  // Set up countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);
  
  // Format time remaining as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  // Handle input change for OTP fields
  const handleChange = (index, value) => {
    if (value.match(/^[0-9]$/) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus to next input if value is entered
      if (value !== "" && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };
  
  // Handle key press to allow backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      inputRefs.current[index - 1].focus();
    }
  };
  
  // Handle paste for OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5].focus();
    }
  };
  
  // Verify OTP using AuthContext method
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits of the verification code");
      showError("Please enter all 6 digits of the verification code");
      return;
    }
    setError("");
    try {
      // Use contextVerifyOTP which handles its own loading and localStorage updates
      await contextVerifyOTP(userId, otpString);
      // Navigation on success is handled by AuthContext's verifyOTP method
      // showSuccess might be redundant if AuthContext handles it, but can be kept for now.
      showSuccess("Email verified successfully!");
    } catch (err) {
      const errorMessage = err.message || "Verification failed";
      setError(errorMessage);
      showError(errorMessage);
    }
  };
  
  // Resend OTP using AuthContext method
  const handleResendOTP = async () => {
    setResendDisabled(true);
    setCountdown(60);
    setError("");
    try {
      // Use contextResendOTP which handles its own loading
      await contextResendOTP(userId);
      showSuccess("Verification code resent to your email");
      setTimeLeft(600);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      const errorMessage = err.message || "Failed to resend verification code";
      setError(errorMessage);
      showError(errorMessage);
    } 
    // authLoading will become false when contextResendOTP finishes
    // setResendDisabled is handled by the countdown useEffect
  };
  
  // Show top-level spinner if AuthContext is performing an async operation
  if (authLoading && !error) { // Don't show spinner if there's an error message displayed
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-row bg-gray-950">
      {/* Left Column - OTP Form */}
      <div className="flex flex-1 items-center justify-center p-10">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <div className="flex justify-center">
              <div className="flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-purple-500" />
                <span className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Echo
                </span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">Verify Your Email</h1>
            <p className="text-gray-400">
              We've sent a 6-digit verification code to your email
            </p>
            {timeLeft > 0 && (
              <p className="text-sm text-yellow-400">
                Code expires in {formatTime(timeLeft)}
              </p>
            )}
            {timeLeft === 0 && (
              <p className="text-sm text-red-400">
                Code expired. Please request a new one.
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-900/30 p-3 border border-red-900">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="flex flex-col space-y-4">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-300">
                Verification Code
              </label>
              
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center rounded-md border border-gray-800 bg-gray-900 text-xl text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                ))}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={authLoading || timeLeft === 0} // Disable if context is loading or time expired
              className="w-full rounded-md bg-gradient-to-r from-purple-600 to-blue-600 py-2.5 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-70"
            >
              {authLoading ? "Processing..." : "Verify Account"} 
            </button>
            
            <div className="flex items-center justify-between">
              <button 
                type="button"
                onClick={handleResendOTP}
                disabled={resendDisabled || authLoading} // Disable if context is loading
                className="text-sm text-purple-400 hover:text-purple-300 disabled:text-gray-500"
              >
                {authLoading && resendDisabled ? "Processing..." : (resendDisabled 
                  ? `Resend code in ${countdown}s` 
                  : "Resend verification code")}
              </button>
              
              <Link
                to="/login"
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
      
      {/* Right Column - Hero Image */}
      <div className="flex-1 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=800')] opacity-10 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20"></div>
        <div className="relative flex h-full flex-col items-center justify-center p-10 text-white">
          <div className="max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold">
                One step closer to authentic connections
              </h2>
              <p className="text-gray-400">
                Verify your email to start sharing authentic moments that fade away. Your posts, voice notes, and interactions will disappear after a set time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage; 
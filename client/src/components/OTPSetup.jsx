import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const OTPSetup = () => {
  const [otpSecret, setOtpSecret] = useState("");
  const [otpAuthUrl, setOtpAuthUrl] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disableToken, setDisableToken] = useState("");
  const [isDisabling, setIsDisabling] = useState(false);
  const [step, setStep] = useState("initial"); // initial, setup, verify, success
  const [error, setError] = useState("");
  
  const { user, generateOTPSecret, enableOTP, disableOTP } = useAuth();
  
  const handleGenerateSecret = async () => {
    try {
      setError("");
      setIsSubmitting(true);
      const response = await generateOTPSecret();
      setOtpSecret(response.data.otpSecret);
      setOtpAuthUrl(response.data.otpAuthUrl);
      setShowQRCode(true);
      setStep("setup");
    } catch (err) {
      setError(err.message || "Failed to generate OTP secret");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setIsSubmitting(true);
      await enableOTP(verificationCode);
      setStep("success");
    } catch (err) {
      setError(err.message || "Failed to verify OTP");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDisableOTP = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setIsDisabling(true);
      await disableOTP(disableToken);
      setStep("initial");
      setDisableToken("");
    } catch (err) {
      setError(err.message || "Failed to disable OTP");
    } finally {
      setIsDisabling(false);
    }
  };
  
  // Effect to set initial step based on user's OTP status
  useEffect(() => {
    if (user?.otpEnabled) {
      setStep("success");
    } else {
      setStep("initial");
    }
  }, [user]);
  
  // Generate QR code URL for OTP setup
  const qrCodeUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(otpAuthUrl)}`;
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Two-Factor Authentication (2FA)
      </h3>
      
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {step === "initial" && (
        <div>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Enable two-factor authentication to add an extra layer of security to your account.
            Once enabled, you'll need to enter a verification code from your authenticator app
            when signing in.
          </p>
          
          <button
            onClick={handleGenerateSecret}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isSubmitting 
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "Setting up..." : "Set up two-factor authentication"}
          </button>
        </div>
      )}
      
      {step === "setup" && (
        <div>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            1. Install an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator
            on your mobile device.
          </p>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            2. Scan this QR code with your authenticator app:
          </p>
          
          <div className="mb-6 flex justify-center">
            {showQRCode && (
              <img 
                src={qrCodeUrl} 
                alt="QR Code for OTP setup" 
                className="border p-2 rounded"
              />
            )}
          </div>
          
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            3. If you can't scan the QR code, enter this code manually in your app:
          </p>
          
          <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded font-mono text-center">
            {otpSecret}
          </div>
          
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            4. Enter the 6-digit verification code shown in your authenticator app:
          </p>
          
          <form onSubmit={handleVerifyOTP} className="mb-4">
            <div className="mb-4">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                          shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 
                          focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Enter 6-digit code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isSubmitting 
                  ? "bg-blue-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Verifying..." : "Verify and Enable"}
            </button>
          </form>
        </div>
      )}
      
      {step === "success" && (
        <div>
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Two-factor authentication is enabled for your account.
          </div>
          
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            You'll need to enter a verification code from your authenticator app when signing in.
            To disable 2FA, enter the current code from your authenticator app.
          </p>
          
          <form onSubmit={handleDisableOTP} className="mb-4">
            <div className="mb-4">
              <input
                type="text"
                value={disableToken}
                onChange={(e) => setDisableToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                          shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 
                          focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Enter 6-digit code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isDisabling}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isDisabling 
                  ? "bg-red-400 cursor-not-allowed" 
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isDisabling ? "Disabling..." : "Disable Two-Factor Authentication"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default OTPSetup; 
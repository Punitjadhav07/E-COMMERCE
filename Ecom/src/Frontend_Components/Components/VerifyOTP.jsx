import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { sendOTP, verifyOTP, getOTPExpiry } from "../Api/api";
import "../Components_css/verifyotp.css";

export const VerifyOTP = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(0); // Will be set from backend
  const [canResend, setCanResend] = useState(false);

  // Fetch OTP expiry from backend on component mount and when email changes
  useEffect(() => {
    const fetchOTPExpiry = async () => {
      if (!email) return;

      try {
        const response = await getOTPExpiry(email);
        
        // If user was deleted (expired)
        if (response.data?.error && response.status === 410) {
          setError(response.data.error);
          setTimeout(() => {
            navigate("/register");
          }, 3000);
          return;
        }

        // Set time left from backend
        if (response.data?.timeLeft !== undefined) {
          setTimeLeft(response.data.timeLeft);
        }
      } catch (err) {
        if (err.response?.status === 410) {
          // User was deleted due to expiry
          setError(err.response?.data?.error || "OTP expired. User account deleted. Please register again.");
          setTimeout(() => {
            navigate("/register");
          }, 3000);
        } else {
          console.error("Error fetching OTP expiry:", err);
        }
      }
    };

    fetchOTPExpiry();
  }, [email, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && email) {
      setCanResend(true);
      // Check with backend if user should be deleted
      getOTPExpiry(email).catch((err) => {
        if (err.response?.status === 410) {
          setError(err.response?.data?.error || "OTP expired. User account deleted.");
          setTimeout(() => {
            navigate("/register");
          }, 3000);
        }
      });
    }
  }, [timeLeft, email, navigate]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, ""); // Only allow numbers

    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const digits = pastedData.split("").filter((char) => /[0-9]/.test(char));

    const newOtp = [...otp];
    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });

    setOtp(newOtp);
    setError("");
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    if (!email) {
      setError("Email not found. Please register again.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await verifyOTP(email, otpString);
      setSuccess("✅ Email verified successfully!");
      
      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      // Check if user was deleted (expired)
      if (err.response?.status === 410) {
        setError(err.response?.data?.error || "OTP expired. User account deleted. Please register again.");
        setTimeout(() => {
          navigate("/register");
        }, 3000);
      } else {
        // Wrong OTP - user NOT verified
        setError(err.response?.data?.error || "Invalid OTP. Please try again.");
        // Clear OTP on error
        setOtp(["", "", "", "", "", ""]);
        document.getElementById("otp-0")?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async (silent = false) => {
    if (!email) {
      setError("Email not found");
      return;
    }

    if (!silent) {
      setResendLoading(true);
    }
    setError("");
    setSuccess("");

    try {
      await sendOTP(email);
      setSuccess("✅ New OTP sent to your email!");
      setCanResend(false);
      
      // Fetch new expiry time from backend
      try {
        const response = await getOTPExpiry(email);
        if (response.data?.timeLeft !== undefined) {
          setTimeLeft(response.data.timeLeft);
        }
      } catch (expiryErr) {
        console.error("Error fetching OTP expiry:", expiryErr);
      }
      
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to send OTP. Please try again.";
      setError(errorMessage);
      console.error("Resend OTP error:", err.response?.data || err.message);
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="verifyOtpContainer">
        <div>
          <h1>Invalid Access</h1>
          <p className="errorText">Email not found. Please register first.</p>
          <button className="backButton" onClick={() => navigate("/register")}>
            Go to Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="verifyOtpContainer">
      <div>
        <h1>Verify Your Email</h1>
        <p className="emailText">We sent a verification code to:</p>
        <p className="emailDisplay">{email}</p>

        <div className="otpInputContainer">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="otpInput"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && <p className="errorText">{error}</p>}
        {success && <p className="successText">{success}</p>}

        <div className="timerContainer">
          {timeLeft > 0 ? (
            <p className="timerText">
              OTP expires in: <span className="timerValue">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="timerExpired">OTP has expired</p>
          )}
        </div>

        <div className="action_buttons">
          <button
            className="verifyButton"
            onClick={handleVerifyOTP}
            disabled={loading || otp.join("").length !== 6}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>

        <div className="resendContainer">
          <button
            className="resendButton"
            onClick={() => handleResendOTP()}
            disabled={resendLoading || !canResend}
          >
            {resendLoading ? "Sending..." : canResend ? "Resend OTP" : "Resend OTP (after expiry)"}
          </button>
        </div>

        <div className="backLinkContainer">
          <button className="backLink" onClick={() => navigate("/register")}>
            ← Back to Register
          </button>
        </div>
      </div>
    </div>
  );
};


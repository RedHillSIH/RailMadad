import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { generateOtp } from "../../actions/auth.actions";
import { useDispatch } from "react-redux";
import { axiosInstance } from "../../utils/axios";
import { useGlobalAlert } from "../../utils/AlertContext";

const ForgotPassword = ({ formData, setFormData, setPage, reset }) => {
  const dispatch = useDispatch();
  const [verified, setVerified] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { showAlert } = useGlobalAlert();

  const handleChangeTruncate = (e) => e.target.value.replace(/\D/g, "");

  const handleGenerateOTP = () => {
    if (!formData.phone || formData.phone.length !== 10) {
      showAlert("Please enter a valid phone number.", "warning");
      return;
    }
    dispatch(generateOtp(formData.phone));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone || formData.phone.length !== 10) {
      showAlert("Please enter a valid phone number.", "warning");
      return;
    }
    if (!formData.otp || formData.otp.length !== 6) {
      showAlert("Please enter a valid OTP.", "warning");
      return;
    }
    if (!verified) {
      showAlert("Please verify the reCAPTCHA.", "warning");
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/verify-otp", {
        phone: formData.phone,
        otp: formData.otp,
      });

      if (response.data.message === "OTP verified successfully") {
        setShowNewPassword(true);
      }
    } catch (error) {
      showAlert(
        error.response?.data?.message || "Error verifying OTP",
        "error"
      );
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.newPassword || formData.newPassword.length < 6) {
      showAlert("Password must be at least 6 characters long", "warning");
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/reset-password", {
        phone: formData.phone,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });

      showAlert(response.data.message, "success");
      reset();
    } catch (error) {
      showAlert(
        error.response?.data?.message || "Error resetting password",
        "error"
      );
    }
  };

  return (
    <>
      {!showNewPassword ? (
        <form className="h-full" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-y-4 mt-6">
            <input
              type="tel"
              inputMode="numeric"
              pattern="\d*"
              value={formData.phone}
              required
              onChange={(e) => {
                const phone = handleChangeTruncate(e);
                setFormData((prev) => ({ ...prev, phone }));
              }}
              placeholder="Phone Number"
              className="input"
            />

            <button
              type="button"
              className="btn-primary"
              onClick={handleGenerateOTP}
            >
              Generate OTP
            </button>

            <input
              type="text"
              inputMode="numeric"
              value={formData.otp}
              required
              onChange={(e) =>
                setFormData({ ...formData, otp: handleChangeTruncate(e) })
              }
              placeholder="OTP"
              className="input"
            />

            <ReCAPTCHA
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              onChange={() => setVerified(true)}
            />

            <button type="submit" className="btn-primary mt-4">
              Verify OTP
            </button>

            <span
              className="text-[11px] font-medium cursor-pointer hover:underline text-[#444] text-end"
              onClick={reset}
            >
              Go Back
            </span>
          </div>
        </form>
      ) : (
        <form className="h-full" onSubmit={handleResetPassword}>
          <div className="flex flex-col gap-y-4 mt-6">
            <input
              type="password"
              value={formData.newPassword || ""}
              required
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              placeholder="New Password"
              className="input"
              minLength={6}
            />

            <button type="submit" className="btn-primary mt-4">
              Reset Password
            </button>

            <span
              className="text-[11px] font-medium cursor-pointer hover:underline text-[#444] text-end"
              onClick={reset}
            >
              Cancel
            </span>
          </div>
        </form>
      )}
    </>
  );
};

export default ForgotPassword;

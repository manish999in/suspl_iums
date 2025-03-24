import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import loginBg from "../assets/img/login_backgrond.jpg";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(""); // State for error message
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    // Placeholder for future password change logic
    console.log("Password change submitted with:", { oldPassword: "[HIDDEN]", newPassword: "[HIDDEN]" });

    // Redirect to another page (for example, a confirmation page)
    navigate("/password-change-confirmation");
  };

  return (
    <div className="upperLoginBody">
      <div className="containerBody">
        <div className="cover">
          <div className="front">
            <img src={loginBg} alt="Login Background" />
            <div className="text">
              <span className="text-1">
                Learning Management
                <br />
                Systems
              </span>
              <span className="text-2"> (LMS) Let's get connected</span>
            </div>
          </div>
          <div className="back">
            <div className="text">
              <span className="text-1">
                Complete miles of journey
                <br />
                with one step
              </span>
              <span className="text-2">Let's get started</span>
            </div>
          </div>
        </div>
        <div className="forms">
          <div className="form-content">
            <div className="login-form">
              <div className="title">Change Password</div>
              {error && <div className="error-message">{error}</div>} {/* Display error message */}
              <form onSubmit={handleSubmit}>
                <div className="input-boxes">
                  <div className="input-box input-boxLogin">
                    <FontAwesomeIcon icon={faLock} />
                    <input
                      type="password"
                      placeholder="Enter your old password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-box input-boxLogin">
                    <FontAwesomeIcon icon={faLock} />
                    <input
                      type="password"
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-box input-boxLogin">
                    <FontAwesomeIcon icon={faLock} />
                    <input
                      type="password"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="button input-box">
                    <input type="submit" value="Submit" />
                  </div>
                  <div className="text sign-up-text">
                    Remembered your password?{" "}
                    <a href="/login">Login now</a>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;

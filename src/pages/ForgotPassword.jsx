import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import loginBg from "../assets/img/login_backgrond.jpg";

const ForgetPassword = () => {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for future password recovery logic
    console.log("Password recovery submitted with:", { userId, email: "[HIDDEN]" });

    // Redirect to another page (for example, a confirmation page)
    navigate("/password-recovery-confirmation");
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
              <div className="title">Forget Password</div>
              <form onSubmit={handleSubmit}>
                <div className="input-boxes">
                  <div className="input-box input-boxLogin">
                    <FontAwesomeIcon icon={faUser} />
                    <input
                      type="text"
                      placeholder="Enter your user ID"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-box input-boxLogin">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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

export default ForgetPassword;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { storeInCookies, storeInLocalStorage } from "../utils/CryptoUtils";

import {
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import loginBg from "../assets/img/login_backgrond.jpg";
import { API_ENDPOINTS, privateAxios } from "../utils/api";
import Cookies from "js-cookie";
import config from "../properties/config";

const Login = () => {


  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const generateShortHash = (hashedPassword) => {
    return hashedPassword.substring(0, 8);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    const publicIp = await getClientIp(); // Ensure this returns the IP correctly
    // Hash the password using MD5 before sending to the server
    const hashedPassword = CryptoJS.MD5(password).toString();
    const shortHash = generateShortHash(hashedPassword);

    const data = {
      emailId,
      password: shortHash,
      publicIp,
    };

    // console.log(data, ":::::::::::");
    // alert(data);

    // Debugging logs

    try {
      const response = await privateAxios.post(API_ENDPOINTS.login, data, {
        headers: {
          Flag: "login",
        },
      });
      Cookies.remove("token");
      Cookies.remove("uData");
      Cookies.remove("AESDecKey");
      localStorage.clear();
      const { rType, token, rMessage, uData, AESDecKey } = response.data;
      // console.log("meg,", rMessage);
      if (rType === "Y") {
        // changes
        if (uData.userStatus === "A") {
          // changes

          storeInLocalStorage("activeMenuId", "dashboard");
          storeInLocalStorage("token", token);
          storeInLocalStorage("uData", JSON.stringify(uData));
          storeInLocalStorage("rfshfg", "n"); // added to remove treemenu bug on admin login case

          storeInCookies("publicIp", publicIp);
          storeInCookies("token", token);
          storeInCookies("AESDecKey", AESDecKey);
          storeInCookies("uData", JSON.stringify(uData));
          // Navigate to dashboard
          navigate(config.baseUrl);
        } else if (uData.userStatus === "U" || uData.userStatus === "EM") {
          storeInLocalStorage("activeMenuId", "deptRole");
          storeInLocalStorage("token", token);
          storeInLocalStorage("tempUData", JSON.stringify(uData));

          storeInCookies("publicIp", publicIp);
          storeInCookies("token", token);
          storeInCookies("AESDecKey", AESDecKey);
          storeInCookies("tempUData", JSON.stringify(uData));
     
          navigate(config.baseUrl);
        }
      } else {
        // Login failed, show error message
        setError(rMessage || "Login failed. Please check your credentials.");
        console.log("rmessage: ", error);
      }
    } catch (error) {
      console.log("Error: ", error);

      console.error("Login failed :", error.response?.data || error.message);
      setError(
        error.response?.data?.rMessage ||
          "Login failed due to an error. Please try again."
      );
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // changes
  function getClientIp() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.ipify.org?format=json", false); // `false` makes the request synchronous
    xhr.send();

    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      return data.ip;
    } else {
      console.error("Error fetching IP:", xhr.statusText);
    }
  }

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
              <div className="title">Login</div>
              {error && <div className="error-message1">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="input-boxes">
                  <div className="input-box input-boxLogin">
                    <FontAwesomeIcon icon={faUser} />

                    <input
                      type="text"
                      placeholder="Enter your email"
                      value={emailId}
                      onChange={(e) => setEmailId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-box input-boxLogin">
                    <FontAwesomeIcon icon={faLock} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {password && (
                      <div
                        className="toggle-password"
                        onClick={togglePasswordVisibility}
                      >
                        <FontAwesomeIcon
                          icon={showPassword ? faEyeSlash : faEye}
                        />
                      </div>
                    )}
                  </div>
                  <div className="text">
                    {/* <a href="/forgot-password"  onClick={(e) => {
                                                e.preventDefault(); // Prevent the default navigation behavior

                                                localStorage.setItem('activeMenuId', "forgotpassword"); // Store the active menu ID in localStorage

                                                // Only navigate if it's a valid route and doesn't force reload
                                                navigate( "/suspl-iums");
                                            }}>Forgot password?</a> */}
                  </div>
                  <div className="button input-box">
                    <input
                      type="submit"
                      value={loading ? "Loading..." : "Submit"}
                      disabled={loading}
                    />
                  </div>
                  {/* <div className="text sign-up-text">
                    Don't have an account?{" "}
                    <label htmlFor="flip">Signup now</label>
                  </div> */}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

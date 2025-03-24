import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const LoggedInElsewhere = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "isLoggedIn" && e.newValue === "true") {
        // The user is logged in elsewhere, trigger the logout or alert
        alert("You are logged in on another tab.");
        navigate("/logged-in-elsewhere");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  const handleLogout = () => {
    // Clear cookies and local storage
    Cookies.remove("token");
    Cookies.remove("uData");
    Cookies.remove("AESDecKey");
    localStorage.clear();

    // Broadcast logout event to other tabs
    localStorage.setItem("isLoggedIn", "false");

    // Redirect to login page
    navigate("/");
  };

  return (
    <div className="logout-page">
      <h2>You are already logged in on another tab</h2>
      <p>Please log out from the other tab to continue in this tab.</p>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default LoggedInElsewhere;

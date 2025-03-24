import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const withSessionCheck = (WrappedComponent) => {
  return (props) => {
    const navigate = useNavigate();

    useEffect(() => {
      const handleStorageChange = (e) => {
        if (e.key === "isLoggedIn" && e.newValue === "false") {
          alert("You have been logged out due to a session in another tab.");
          navigate("/logged-in-elsewhere");
        }
      };

      window.addEventListener("storage", handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }, [navigate]);

    return <WrappedComponent {...props} />;
  };
};

export default withSessionCheck;

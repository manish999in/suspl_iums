import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS for styling
import '../styles/LoginMessage.css'
import config from "../properties/config";

const LoginMessage = () => {
  const navigate = useNavigate(); // Hook to navigate to the login page

  useEffect(() => {
    // Remove 'activeMenuId' from localStorage before redirecting
   
    
    // Redirect to the login page after 5 seconds
    const timer = setTimeout(() => {
      localStorage.clear();
      navigate(config.baseUrl); // Redirect to login page
    }, 5000); // 5 seconds delay

    // Cleanup timeout if the component is unmounted
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="newContainer d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="newCard p-5 bg-white shadow rounded">
        <div className="newTitle text-center mb-4">
          <h2>Logout Successfully</h2>
        </div>
        <div className="newField text-center mb-4">
          <span className="d-block mb-3">You have successfully logged out. You will be redirected to the login page shortly.</span>
        </div>


      </div>
    </div>
  );
};

export default LoginMessage;

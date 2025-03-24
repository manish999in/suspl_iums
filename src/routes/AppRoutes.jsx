import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Layout from "../components/Layout"; // Ensure the path is correct
import NotFound from "../pages/NotFound"; // Import the NotFound component
import PathRoute from "./PathRoute";
import config from "../properties/config";
import { retrieveFromLocalStorage, retrieveFromCookies } from "../utils/CryptoUtils";
import { GlobalContextProvider } from "../context/GlobalContextProvider";
import WithoutLoginPathRoute from "./WithoutLoginPathRoute";

const AppRoutes = () => {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!Cookies.get("token") && !!Cookies.get("uData")
  ); // Initial check for token

  useEffect(() => {
    const checkTokeninCookie = () => {
      const token = (Cookies.get("token")); // Update authentication state

      if (!token) {
        localStorage.clear();
      }
    };

    checkTokeninCookie(); // Initial check on component mount
    const interval = setInterval(checkTokeninCookie, 1); // Periodic checks

    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  // Check authentication status on a regular basis
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!Cookies.get("token") && !!Cookies.get("uData")); // Update authentication state
    };

    checkAuth(); // Initial check on component mount
    const interval = setInterval(checkAuth, 1); // Periodic checks

    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  return (
    <>
      <div
        className={`app ${isAuthenticated ? "with-sidebar" : "without-sidebar"
          }`}
      >
        {isAuthenticated ? (
          <GlobalContextProvider>
            <Layout>
              <Routes>

                {/* Add NotFound route here for any undefined paths */}
                <Route path="*" element={<NotFound />} />{" "}
                {/* Render NotFound for any undefined paths */}

                <Route path={config.baseUrl}
                  element={<PathRoute />}
                />



              </Routes>

            </Layout>
          </GlobalContextProvider>
        ) : (
          <Routes>

            {<Route
              path={config.baseUrl}
              element={<WithoutLoginPathRoute />}
            />}


          </Routes>
        )}
      </div>
    </>
  );
};

export default AppRoutes;

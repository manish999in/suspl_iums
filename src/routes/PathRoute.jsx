import React, { Suspense, useState, useEffect } from "react";
import { retrieveFromLocalStorage, retrieveFromCookies } from "../utils/CryptoUtils";
import { treemenu } from "../properties/config";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import LoadingPage from "../components/LoadingPage";

const PathRoute = () => {

  const uData = retrieveFromCookies("uData");
  const menuId = retrieveFromLocalStorage("activeMenuId");

  if (!uData && !menuId) {
    return <Login />;
  }

  const menuPath = retrieveFromCookies("menuPath");

 
    if (menuPath) {
      try {
      
        const DynamicComponent = React.lazy(() => import(menuPath));

        return (
          <Suspense fallback={<LoadingPage/>}>
            {React.createElement(DynamicComponent)} 
          </Suspense>
        );

      } catch (err) {
        return <NotFound />;
      }
    }else {

    const ComponentToRender = treemenu[menuId] || NotFound;

    return <ComponentToRender />;
  }
};

export default PathRoute;

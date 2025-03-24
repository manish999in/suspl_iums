import ErrorPopup from "../components/ErrorPopup";
import ChangePassword from "../pages/ChangePassowrd";
import DeptRole from "../pages/DeptRole";
import ForgetPassword from "../pages/ForgotPassword";
import Login from "../pages/Login";
import LoginMessage from "../pages/LoginMessage";
import SessionTimeout from "../pages/SessionTimeout";
import { retrieveFromLocalStorage } from "../utils/CryptoUtils";
import React from "react";

const treemenu = {
    forgotpassword: ForgetPassword,
    SessionTimeout: SessionTimeout,
    changepassword: ChangePassword,
    deptRole: DeptRole,
    loginMessage:LoginMessage,
    defaultError: ErrorPopup, 
  };

const WithoutLoginPathRoute = () => {


  const menuId = retrieveFromLocalStorage("activeMenuId");

  const ComponentToRender = treemenu[menuId] || Login;
  return <ComponentToRender />;
};

export default WithoutLoginPathRoute;

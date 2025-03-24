// src/properties/config.js
import SalutationMaster from "../hrms/SalutationMaster";
import DdoMaster from "../user-management/DdoMaster";
import ThemeChangePage from "../components/ThemeChangePage";
import Quicklinkspage from "../pages/Quicklinkspage";
import ReligionMaster from "../hrms/ReligionMaster";
import RelationshipMaster from "../hrms/RelationshipMaster";
import DepartmentMaster from "../hrms/DepartmentMaster";
import LocationProfileMaster from "../user-management/LocationProfileMaster";
import UserTypeMaster from "../user-management/UserTypeMaster";
import SalaryBillType from "../hrms/SalaryBillType";
import ForgetPassword from "../pages/ForgotPassword";
import SessionTimeout from "../pages/SessionTimeout";
import ChangePassword from "../pages/ChangePassowrd";
import DeptRole from "../pages/DeptRole";
import MaritalStatusMaster from "../hrms/MaritalStatusMaster";
import LoanNatureMaster from "../hrms/LoanNatureMaster";
import FinancialMaster from "../hrms/FinancialMaster";
import DisciplineMaster from "../hrms/DisciplineMaster";
import ClassMaster from "../hrms/ClassMaster";
import Dashboard from "../pages/Dashboard";
import CityCategoryMaster from "../hrms/CityCategoryMaster";
import CreateUser from "../user-management/CreateUser";
import NatureMaster from "../hrms/NatureMaster";
import DesignationMaster from "../hrms/DesignationMaster";
import LoginMessage from "../pages/LoginMessage";
import ErrorPopup from "../components/ErrorPopup";
import ManageEmployee from "../hrms/EmployeeMaster/ManageEmployee";
import DepartmentHeadMaster from "../hrms/DepartmentHeadMaster";
import PageUnderMaintenance from "../pages/PageUnderMaintenance";
import WebsiteUnderMaintenance from "../pages/WebsiteUnderMaintenance";

const config = {
  baseUrl: "/suspl-iums",
  apiBaseUrl: "/suspl-iums",
  compName: "EduMatrix",
  compAdd1: "Edumatrix Group",
  compAdd2: "Noida, UP, India",
  compAdd3: "INDIA",
  logoPath: "../img/h-logo.png",
  headerTitle: "EduMatrix",
  footerText: "© 2024 EduMatrix All rights reserved.",
  themePath: "./img/",
  encDecKey: "RamRam"
  // Add more configurations as needed
};

export default config; // This is the default export

// Tree-menu pages
const treemenu = {
  themeChangepage: ThemeChangePage,
  quicklinks: Quicklinkspage,
  forgotpassword: ForgetPassword,
  SessionTimeout: SessionTimeout,
  changepassword: ChangePassword,
  deptRole: DeptRole,
  dashboard: Dashboard,
  loginMessage:LoginMessage,
  defaultError: ErrorPopup,
  PageUnderMaintenance:PageUnderMaintenance,
  WebsiteUnderMaintenance:WebsiteUnderMaintenance,

  // Testing pages

  100101:DdoMaster,

  createUser : CreateUser,
};
export { treemenu }; // This is the default export
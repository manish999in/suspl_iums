import { useNavigate } from "react-router-dom";
import {
  retrieveFromLocalStorage,
  retrieveFromCookies,
  storeInCookies,
  storeInLocalStorage,
} from "../utils/CryptoUtils";
import config from "../properties/config";
import Cookies from "js-cookie";
import useCheckServiceAvailability from "./useCheckServiceAvailability";

const useCheckResponseStatus = () => {
  const navigate = useNavigate();
  const { checkServiceAvailability } = useCheckServiceAvailability();

  const checkResponseStatus = (response, service = "user") => {
    try {
      // checkServiceAvailability(response,service);
      console.log(response,"----ghh-");
      // console.log(response.code ,"--------|||||||||response.code");

      if(response.code && response.code === "503"){
        if(service === 'user'){
          Cookies.remove("menuPath");
          storeInLocalStorage("activeMenuId","WebsiteUnderMaintenance");
          navigate(config.baseUrl);
        }else{
          Cookies.remove("menuPath");
          storeInLocalStorage("activeMenuId","PageUnderMaintenance");
          navigate(config.baseUrl);
        }
      }
      else if(response.data.code && response.data.code === "503" ){
        if(service === 'user'){
          Cookies.remove("menuPath");
          storeInLocalStorage("activeMenuId","WebsiteUnderMaintenance");
          navigate(config.baseUrl);
        }else{
          Cookies.remove("menuPath");
          storeInLocalStorage("activeMenuId","PageUnderMaintenance");
          navigate(config.baseUrl);
        }
      }
      else if(response.data.code === "505" ){
          Cookies.remove("menuPath");
          storeInLocalStorage("activeMenuId","PageUnderMaintenance");
          navigate(config.baseUrl);
      }

      if (response.status === 203 || response.status === 401) {
        Cookies.remove("menuPath");
        storeInLocalStorage("activeMenuId", "SessionTimeout");

        navigate(config.baseUrl);

        // Redirect to session timeout page
      } else if (response.code === "500") {
        if (response.errorPage === "defaultError") {
          Cookies.remove("menuPath");
          storeInLocalStorage("activeMenuId", response.errorPage);
          navigate(config.baseUrl);
        }
      } else if (response.data.code === "500") {
        if (response.data.errorPage === "defaultError") {
          Cookies.remove("menuPath");
          storeInLocalStorage("activeMenuId", response.data.errorPage);
          navigate(config.baseUrl);
        }
      } else {
        // Return response data if status is not 203 or 401
        return response.data;
      }
    } catch (error) {
      // Handle the error if the request fails
      console.error("Request failed:", error);
      if (error.response && error.response.status === 503) {
        if (service === "user") {
        } else {
          Cookies.remove("menuPath");
          storeInLocalStorage("activeMenuId", "PageUnderMaintenance");
          navigate(config.baseUrl);
        }
      }
    }
  };

  return { checkResponseStatus };
};

export default useCheckResponseStatus;

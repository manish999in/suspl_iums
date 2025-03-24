import { useNavigate } from "react-router-dom";
import { retrieveFromLocalStorage, retrieveFromCookies, storeInCookies, storeInLocalStorage } from "../utils/CryptoUtils";
import config from "../properties/config";
import Cookies from 'js-cookie';



const useCheckServiceAvailability = () => {
  const navigate = useNavigate();

  const checkServiceAvailability =(response , service = 'user') => {
  
    response
    .then((res) => {
      // Process the response if status is not 503
      if (res.status === 503 ) {
        if(service === 'user'){
  
        }else{
          Cookies.remove("menuPath");
          storeInLocalStorage("activeMenuId","PageUnderMaintenance");
          navigate(config.baseUrl);
        }
        // Perform the alert when status code is 503 (Service Unavailable)
        // alert("Service is currently unavailable. Please try again later.");
      } else {
        // Handle the response in case of other status codes
        console.log("Response received:", res);
      }
    })
    .catch((error) => {
      // Handle the error if the request fails
      console.error("Request failed:", error);
      if (error.response && error.response.status === 503) {
        if(service === 'user'){
  
        }else{
          Cookies.remove("menuPath");
          storeInLocalStorage("activeMenuId","PageUnderMaintenance");
          navigate(config.baseUrl);
        }
      }
    });
  }
  
    return { checkServiceAvailability };
};

export default useCheckServiceAvailability;

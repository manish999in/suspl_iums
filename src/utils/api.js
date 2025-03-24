// src/services/api.js
import axios from "axios";
import Cookies from "js-cookie";
import {retrieveFromLocalStorage,retrieveFromCookies,storeInCookies,storeInLocalStorage} from "../utils/CryptoUtils";
import config from "../properties/config";
import useCheckServiceAvailability from "../hooks/useCheckServiceAvailability"




// const REST_API_START_URL = "http://192.168.88.109:8091/";
const REST_API_START_URL = "http://192.168.89.248:9598/api/user/";
// const REST_API_START_URL = "http://43.254.41.220:8085/suspl-iums-be/";

//Page Api Call

// const RESTAPI_URL = "http://43.254.411.220"; // Base URL
const RESTAPI_URL = "http://192.168.89.248"; // Base URL local
// const RESTAPI_URL = "http://192.168.88.109"; // Base URL local 
const REST_PORT = "9598";                   // Port local
// const REST_PORT = "8085";                   // Port
const REST_API_START = "suspl-iums-be";          // API start path


// API Endpoints
export const API_ENDPOINTS = {
  login: `${REST_API_START_URL}login`,
  treeMenu: `${REST_API_START_URL}treeMenuAll`,
  treeMenuSQ: `${REST_API_START_URL}treeMenuSQ`,
  treeMenuTest: `${REST_API_START_URL}treeMenu`,
  logout: `${REST_API_START_URL}logout`,
};

// Create an Axios instance for private requests
export const privateAxios = axios.create({
  baseURL: REST_API_START_URL,
});

// Interceptor to add the token and headers for all requests
privateAxios.interceptors.request.use(
  (config) => {
    const token = retrieveFromCookies("token"); // Use Cookies to get token
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    // config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle responses and check for unauthorized access
privateAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status } = error.response || {};
    if (status === 401 || status === 403) {
      Cookies.remove("token");
      window.location.href = config.baseUrl;
    }
    return Promise.reject(error);
  }
);

export const getUserRights = ( requestBody) => {
  // Construct the complete URL
  const url = `${RESTAPI_URL}:${REST_PORT}/api/user/userRights`;
  // const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/userRights`;


  // console.log("Sending request to:", url, "with body:", requestBody); // Improved logging

  // Sending the POST request using privateAxios
  return privateAxios.post(
    url,
    { encData: requestBody },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Token from local storage
        "Content-Type": "application/json",
      },
    }
  );
};
// -*---------------------------------------------********************************
export const getSave = (module, pagename, requestBody,service='user') => {
  module = String(module);
  pagename = String(pagename);
  // Construct the complete URL
  const url = `${RESTAPI_URL}:${REST_PORT}/api/${service}/${module}/${pagename}/save`;
    // const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${module}/${pagename}/save`;


  // console.log("Sending request to:", url, "with body:", requestBody); // Improved logging

  // Sending the POST request using privateAxios
  return privateAxios.post(
    url,
    { encData: requestBody },
    {
      headers: {
        Authorization: `Bearer ${retrieveFromCookies("token")}`, // Token from local storage
        "Content-Type": "application/json",
      },
    }
  );
};

export const getDelete = (module, pagename, requestBody,service='user') => {
  // const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${module}/${pagename}/delete`;

  module = String(module);
  pagename = String(pagename);
  const url = `${RESTAPI_URL}:${REST_PORT}/api/${service}/${module}/${pagename}/delete`;

  // console.log("Sending request to:", url, "with body:", requestBody); // Improved logging

  return privateAxios.post(
    url,
    { encData: requestBody },
    {
      headers: {
        Authorization: `Bearer ${retrieveFromCookies("token")}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const getList = (module, pagename, requestBody,service='user') => {
  // const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${module}/${pagename}/`;
  const url = `${RESTAPI_URL}:${REST_PORT}/api/${service}/${module}/${pagename}/`;


  console.log("Sending request to:", url, "with body:", requestBody); // Improved logging

  return privateAxios.post(
    url,
    { encData: requestBody },
    {
      headers: {
        Authorization: `Bearer ${retrieveFromCookies("token")}`,
        "Content-Type": "application/json",
      },
    }
  );

   
};

export const getUpdate = (module, pagename, requestBody,services='user') => {
  // const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${module}/${pagename}/update`;
  const url = `${RESTAPI_URL}:${REST_PORT}/api/${services}/${module}/${pagename}/update`;
   

  // console.log("Sending request to:", url, "with body:", requestBody); // Improved logging

  return privateAxios.post(
    url,
    { encData: requestBody },
    {
      headers: {
        Authorization: `Bearer ${retrieveFromCookies("token")}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const getViewRecord = (module, pagename, requestBody,service='user') => {
  // const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${module}/${pagename}/viewRecords`;
  const url = `${RESTAPI_URL}:${REST_PORT}/api/${service}/${module}/${pagename}/viewRecords`;


  // console.log("Sending request to:", url, "with body:", requestBody); // Improved logging

  return privateAxios.post(
    url,
    { encData: requestBody },
    {
      headers: {
        Authorization: `Bearer ${retrieveFromCookies("token")}`,
        "Content-Type": "application/json",
      },
    }
  );
};
export const getRecordByCount = (module, pagename, requestBody,service='user') => {
  // const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${module}/${pagename}/count`;
  const url = `${RESTAPI_URL}:${REST_PORT}/api/${service}/${module}/${pagename}/count`;


  // console.log("Sending request to:", url, "with body:", requestBody); // Improved logging

  return privateAxios.post(
    url,
    { encData: requestBody },
    {
      headers: {
        Authorization: `Bearer ${retrieveFromCookies("token")}`,
        "Content-Type": "application/json",
      },
    }
  );
};

// ---------------------------------------------------------------------------------------------------

export const getSaveFile = (module, pagename, file, textData, service = 'user') => {
  // Construct the complete URL
  const url = `${RESTAPI_URL}:${REST_PORT}/api/${service}/${module}/${pagename}/save`;

  // Create a FormData object
  const formData = new FormData();

  // Append the file and text data (JSON or stringified data)
  formData.append("file", file);  // Append the file
  formData.append("encData", JSON.stringify(textData));  // Append encData (converted to JSON string)

  // Send the request using Axios (or any HTTP client)
  return privateAxios.post(url, formData, {
    headers: {
      Authorization: `Bearer ${retrieveFromCookies("token")}`,  // Token from local storage
      // Don't manually set Content-Type, FormData handles it automatically
    },
  });
};

// --------------------------------------DropDownApi--------------------------------

export const getDropDown = async (query, ddRcds,setDDRcds, pagename, secretKey,service='user') => {
  try {
    const keys = processData(query.fields);
    const ciphertext = encAESData(secretKey, query);
    // const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${pagename}/dropDownData`;
    const url = `${RESTAPI_URL}:${REST_PORT}/api/${service}/${pagename}/dropDownData`;

    console.log("Sending request to:", url, "with body:", query); // Improved logging

    const response = await privateAxios.post(
      url,
      { encData: ciphertext },
      {
        headers: {
          Authorization: `Bearer ${retrieveFromCookies("token")}`,
          "Content-Type": "application/json",
        },
      }
    );

    // console.log("Full response from backend:", response);
    // const responseData = checkResponseStatus(response);
    const responseData = response.data;

    if (responseData.rData) {
      const recJson = JSON.parse(responseData.rData);
      const decryptedData = decAESData(secretKey, recJson);
      console.log("Decrypted Data Dropdown:", decryptedData);

      const arraySize = decryptedData.recData.length;
      const newRecords = [];
      let newItem = {};

      for (let i = 0; i < arraySize; i++) {
        let j = 0;
         newItem = {
          value: decryptedData.recData[i][keys[j]], // First key
          label: decryptedData.recData[i][keys[++j]] || '', // Second key, default to empty string
        };

        // // Check if the item already exists in the current state
        // const exists = ddRcds.some(item => item.value === newItem.value);

        // // If it does not exist, add to newRecords
        // if (!exists) {
          newRecords.push(newItem);
        // }
      }

      // Update the state with the new records
      setDDRcds(prevState => [
        // ...prevState,  // Retains the previous state
        ...newRecords, // Adds the new records
      ]);
    } else {
      // console.error("encryptData is undefined in the backend response.");
      setDDRcds([]);
    }

  } catch (error) {
    console.error("Error retrieving data:", error);
  }
};

export const getDataApi = (module, pagename, requestBody,service='user') => {
  // const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${module}/${pagename}/data`;
  let url;
   if(pagename){
    url = `${RESTAPI_URL}:${REST_PORT}/api/${service}/${module}/${pagename}/data`;
  }else{
    url = `${RESTAPI_URL}:${REST_PORT}/api/${service}/${module}/data`;
  }
  // console.log("Sending request to:", url, "with body:", requestBody); // Improved logging
  return privateAxios.post(
    url,
    { encData: requestBody },
    {
      headers: {
        Authorization: `Bearer ${retrieveFromCookies("token")}`,
        "Content-Type": "application/json",
      },
    }
  );
};

const processData = (dataString) => {
  // Split the string by commas
  return dataString.split(',');
};




export const getDropDownComplex = async (query, ddRcds,setDDRcds, pagename, secretKey,service='user') => {
  try {
    const keys = processData(query.fieldsRev);
    const ciphertext = encAESData(secretKey, query);
    // const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${pagename}/dropDownData`;
    const url = `${RESTAPI_URL}:${REST_PORT}/api/${service}/${pagename}/dropDownDataComplex`;

    // console.log("Sending request to:", url, "with body:", query); // Improved logging

    const response = await privateAxios.post(
      url,
      { encData: ciphertext },
      {
        headers: {
          Authorization: `Bearer ${retrieveFromCookies("token")}`,
          "Content-Type": "application/json",
        },
      }
    );

    // console.log("Full response from backend:--------------", response);
    // const responseData = checkResponseStatus(response);
    const responseData = response.data;

    if (responseData.rData) {
      const recJson = JSON.parse(responseData.rData);
      const decryptedData = decAESData(secretKey, recJson);
      // console.log("Decrypted Data:", decryptedData);

      const arraySize = decryptedData.recData.length;
      const newRecords = [];
      const newItem = {};

      for (let i = 0; i < arraySize; i++) {
        let j = 0;
        const newItem = {
          value: decryptedData.recData[i][keys[j]], // First key
          label: decryptedData.recData[i][keys[++j]] || '', // Second key, default to empty string
        };

        // Check if the item already exists in the current state
        // const exists = ddRcds.some(item => item.value === newItem.value);

        // If it does not exist, add to newRecords
        // if (!exists) {
          newRecords.push(newItem);
        // }
      }

      // Update the state with the new records
      setDDRcds(() => [
        ...newRecords, // Include newRecords to the previous state
      ]);
    } else {
      // console.error("encryptData is undefined in the backend response.");
      setDDRcds([]);

    }

    setResponseMessage("Data retrieved successfully: " + JSON.stringify(responseData));
  } catch (error) {
    console.error("Error retrieving data:", error);
    setResponseMessage("Error retrieving data: " + error.message);
    setDDRcds([]);

  }
};




//////////////////////////////////////////////////////////////////////////////////////////////////////////

// // src/services/api.js
// import axios from "axios";
// import Cookies from "js-cookie";
// import {retrieveFromLocalStorage,retrieveFromCookies,storeInCookies,storeInLocalStorage} from "../utils/CryptoUtils";
// import config from "../properties/config";



// // const REST_API_START_URL = "http://192.168.90.227:8008/suspl-iums-be/";
// // const REST_API_START_URL = "http://localhost:8091/";
// const REST_API_START_URL = "http://43.254.41.220:8085/suspl-iums-be/";

// //Page Api Call

// const RESTAPI_URL = "http://43.254.41.220"; // Base URL
// // const RESTAPI_URL = "http://localhost"; // Base URL local
// // const RESTAPI_URL = "http://192.168.90.227"; // Base URL local 
// // const REST_PORT = "8091";                   // Port local
// const REST_PORT = "8085";                   // Port
// const REST_API_START = "suspl-iums-be";          // API start path


// // API Endpoints
// export const API_ENDPOINTS = {
//   login: `${REST_API_START_URL}login`,
//   treeMenu: `${REST_API_START_URL}treeMenuAll`,
//   treeMenuSQ: `${REST_API_START_URL}treeMenuSQ`,
//   treeMenuTest: `${REST_API_START_URL}treeMenu`,
//   logout: `${REST_API_START_URL}logout`,
// };

// // Create an Axios instance for private requests
// export const privateAxios = axios.create({
//   baseURL: REST_API_START_URL,
// });

// // Interceptor to add the token and headers for all requests
// privateAxios.interceptors.request.use(
//   (config) => {
//     const token = retrieveFromCookies("token"); // Use Cookies to get token
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
//     config.headers["Content-Type"] = "application/json";
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Interceptor to handle responses and check for unauthorized access
// privateAxios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const { status } = error.response || {};
//     if (status === 401 || status === 403) {
//       Cookies.remove("token");
//       window.location.href = config.baseUrl;
//     }
//     return Promise.reject(error);
//   }
// );

// export const getUserRights = ( requestBody) => {
//   // Construct the complete URL
//   // const url = `${RESTAPI_URL}:${REST_PORT}/userRights`;
//   const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/userRights`;


//   // console.log("Sending request to:", url, "with body:", requestBody); // Improved logging

//   // Sending the POST request using privateAxios
//   return privateAxios.post(
//     url,
//     { encData: requestBody },
//     {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("token")}`, // Token from local storage
//         "Content-Type": "application/json",
//       },
//     }
//   );
// };
// // -*---------------------------------------------********************************
// export const getSave = (module, pagename, requestBody) => {
//   // Construct the complete URL
//   // const url = `${RESTAPI_URL}:${REST_PORT}/${module}/${pagename}/save`;
//     const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${module}/${pagename}/save`;


//   // console.log("Sending request to:", url, "with body:", requestBody); // Improved logging

//   // Sending the POST request using privateAxios
//   return privateAxios.post(
//     url,
//     { encData: requestBody },
//     {
//       headers: {
//         Authorization: `Bearer ${retrieveFromCookies("token")}`, // Token from local storage
//         "Content-Type": "application/json",
//       },
//     }
//   );
// };

// export const getDelete = (module, pagename, requestBody) => {
//   const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${module}/${pagename}/delete`;
//   // const url = `${RESTAPI_URL}:${REST_PORT}/${module}/${pagename}/delete`;


//   // console.log("Sending request to:", url, "with body:", requestBody); // Improved logging

//   return privateAxios.post(
//     url,
//     { encData: requestBody },
//     {
//       headers: {
//         Authorization: `Bearer ${retrieveFromCookies("token")}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );
// };

// export const getList = (module, pagename, requestBody) => {
//   const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${module}/${pagename}/`;
//   // const url = `${RESTAPI_URL}:${REST_PORT}/${module}/${pagename}/`;


//   // console.log("Sending request to:", url, "with body:", requestBody); // Improved logging

//   return privateAxios.post(
//     url,
//     { encData: requestBody },
//     {
//       headers: {
//         Authorization: `Bearer ${retrieveFromCookies("token")}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );
// };

// export const getUpdate = (module, pagename, requestBody) => {
//   const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${module}/${pagename}/update`;
//   // const url = `${RESTAPI_URL}:${REST_PORT}/${module}/${pagename}/update`;
   

//   // console.log("Sending request to:", url, "with body:", requestBody); // Improved logging

//   return privateAxios.post(
//     url,
//     { encData: requestBody },
//     {
//       headers: {
//         Authorization: `Bearer ${retrieveFromCookies("token")}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );
// };

// export const getViewRecord = (module, pagename, requestBody) => {
//   const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${module}/${pagename}/viewRecords`;
//   // const url = `${RESTAPI_URL}:${REST_PORT}/${module}/${pagename}/viewRecords`;


//   // console.log("Sending request to:", url, "with body:", requestBody); // Improved logging

//   return privateAxios.post(
//     url,
//     { encData: requestBody },
//     {
//       headers: {
//         Authorization: `Bearer ${retrieveFromCookies("token")}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );
// };
// export const getRecordByCount = (module, pagename, requestBody) => {
//   const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${module}/${pagename}/count`;
//   // const url = `${RESTAPI_URL}:${REST_PORT}/${module}/${pagename}/count`;


//   // console.log("Sending request to:", url, "with body:", requestBody); // Improved logging

//   return privateAxios.post(
//     url,
//     { encData: requestBody },
//     {
//       headers: {
//         Authorization: `Bearer ${retrieveFromCookies("token")}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );
// };

// // ---------------------------------------------------------------------------------------------------
// export const getSaveFile = (module, pagename, file, textData) => {
//   // Construct the complete URL
//   const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${module}/${pagename}/save`;
//   // const url = `${RESTAPI_URL}:${REST_PORT}/${module}/${pagename}/save`;


//   // console.log("Sending request to:", url);

//   // Create a FormData object
//   const formData = new FormData();

//   // Append the file and text data
//   formData.append("file", file); // Assuming file is a File object
//   formData.append("data", new Blob([JSON.stringify(textData)], { type: 'application/json' })); // Append JSON as a Blob

//   // Sending the POST request using privateAxios
//   return privateAxios.post(url, formData, {
//     headers: {
//       Authorization: `Bearer ${retrieveFromCookies("token")}`, // Token from local storage
//       // Content-Type will be set to multipart/form-data automatically
//     },
//   });
// };

// // --------------------------------------DropDownApi--------------------------------

// export const getDropDown = async (query, ddRcds,setDDRcds, pagename, secretKey) => {
//   try {
//     const keys = processData(query.fields);
//     const ciphertext = encAESData(secretKey, query);
//     const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${pagename}/dropDownData`;
//     // const url = `${RESTAPI_URL}:${REST_PORT}/${pagename}/dropDownData`;

//     // console.log("Sending request to:", url, "with body:", query); // Improved logging

//     const response = await privateAxios.post(
//       url,
//       { encData: ciphertext },
//       {
//         headers: {
//           Authorization: `Bearer ${retrieveFromCookies("token")}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // console.log("Full response from backend:", response);
//     // const responseData = checkResponseStatus(response);
//     const responseData = response.data;

//     if (responseData.rData) {
//       const recJson = JSON.parse(responseData.rData);
//       const decryptedData = decAESData(secretKey, recJson);
//       // console.log("Decrypted Data:", decryptedData);

//       const arraySize = decryptedData.recData.length;
//       const newRecords = [];

//       for (let i = 0; i < arraySize; i++) {
//         let j = 0;
//         const newItem = {
//           value: decryptedData.recData[i][keys[j]], // First key
//           label: decryptedData.recData[i][keys[++j]] || '', // Second key, default to empty string
//         };

//         // Check if the item already exists in the current state
//         const exists = ddRcds.some(item => item.value === newItem.value);

//         // If it does not exist, add to newRecords
//         if (!exists) {
//           newRecords.push(newItem);
//         }
//       }

//       // Update the state with the new records
//       setDDRcds(() => [
//         ...newRecords, // Include newRecords to the previous state
//       ]);
//     } else {
//       // console.error("encryptData is undefined in the backend response.");
//     }

//   } catch (error) {
//     console.error("Error retrieving data:", error);
//   }
// };

// export const getDataApi = (module, pagename, requestBody) => {
//   const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${module}/${pagename}/data`;
//   // const url = `${RESTAPI_URL}:${REST_PORT}/${module}/${pagename}/data`;
//   // console.log("Sending request to:", url, "with body:", requestBody); // Improved logging
//   return privateAxios.post(
//     url,
//     { encData: requestBody },
//     {
//       headers: {
//         Authorization: `Bearer ${retrieveFromCookies("token")}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );
// };

// const processData = (dataString) => {
//   // Split the string by commas
//   return dataString.split(',');
// };




// export const getDropDownComplex = async (query, ddRcds,setDDRcds, pagename, secretKey) => {
//   try {
//     const keys = processData(query.fieldsRev);
//     const ciphertext = encAESData(secretKey, query);
//     const url = `${RESTAPI_URL}:${REST_PORT}/${REST_API_START}/${pagename}/dropDownData`;
//     // const url = `${RESTAPI_URL}:${REST_PORT}/${pagename}/dropDownDataComplex`;

//     // console.log("Sending request to:", url, "with body:", query); // Improved logging

//     const response = await privateAxios.post(
//       url,
//       { encData: ciphertext },
//       {
//         headers: {
//           Authorization: `Bearer ${retrieveFromCookies("token")}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // console.log("Full response from backend:--------------", response);
//     // const responseData = checkResponseStatus(response);
//     const responseData = response.data;

//     if (responseData.rData) {
//       const recJson = JSON.parse(responseData.rData);
//       const decryptedData = decAESData(secretKey, recJson);
//       // console.log("Decrypted Data:", decryptedData);

//       const arraySize = decryptedData.recData.length;
//       const newRecords = [];

//       for (let i = 0; i < arraySize; i++) {
//         let j = 0;
//         const newItem = {
//           value: decryptedData.recData[i][keys[j]], // First key
//           label: decryptedData.recData[i][keys[++j]] || '', // Second key, default to empty string
//         };

//         // Check if the item already exists in the current state
//         const exists = ddRcds.some(item => item.value === newItem.value);

//         // If it does not exist, add to newRecords
//         if (!exists) {
//           newRecords.push(newItem);
//         }
//       }

//       // Update the state with the new records
//       setDDRcds(() => [
//         ...newRecords, // Include newRecords to the previous state
//       ]);
//     } else {
//       // console.error("encryptData is undefined in the backend response.");
//     }

//     setResponseMessage("Data retrieved successfully: " + JSON.stringify(responseData));
//   } catch (error) {
//     console.error("Error retrieving data:", error);
//     setResponseMessage("Error retrieving data: " + error.message);
//   }
// };


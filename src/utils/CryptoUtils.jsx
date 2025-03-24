import CryptoJS from "crypto-js";
import Cookies from 'js-cookie';
import config from "../properties/config";


// Your secret key (use something complex and secure)
const SECRET_KEY = config.encDecKey ;

// Encrypt data using AES (synchronously)
const encryptData = (data) => {
  return CryptoJS.AES.encrypt((data), SECRET_KEY).toString();
};

// Decrypt data using AES (synchronously)
const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return (bytes.toString(CryptoJS.enc.Utf8));
};

// Store encrypted data in LocalStorage
const storeInLocalStorage = (key, data) => {
  const encryptedData = encryptData(String(data));
  localStorage.setItem(key, encryptedData);
};

// Retrieve encrypted data from LocalStorage
const retrieveFromLocalStorage = (key) => {
  const encryptedData = localStorage.getItem(key);
  if (encryptedData) {
    return decryptData(encryptedData);
  }
  return null;
};

// Store encrypted data in Cookies
const storeInCookies = (key, data) => {
  const encryptedData = encryptData(String(data));
  Cookies.set(key, encryptedData, { expires: 1 }); // Expires in 1 days
};

// Retrieve encrypted data from Cookies
const retrieveFromCookies = (key) => {
  const encryptedData = Cookies.get(key);
  if (encryptedData) {
    return decryptData(encryptedData);
  }
  return null;
};

export { storeInLocalStorage, retrieveFromLocalStorage, storeInCookies, retrieveFromCookies };

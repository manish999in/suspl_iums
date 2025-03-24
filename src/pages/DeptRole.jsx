
import React, { useEffect, useState } from "react";
import "../styles/DeptRole.css";
import {retrieveFromLocalStorage,retrieveFromCookies,storeInCookies,storeInLocalStorage} from "../utils/CryptoUtils";


import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { getUserRights } from "../utils/api";
import SelectComponent from "../components/SelectComponent";

import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import config from "../properties/config";

const DeptRole = () => {
  Cookies.remove("uData");

  const navigate = useNavigate();
  const { checkResponseStatus } = useCheckResponseStatus();

  const [resetSelect, setResetSelect] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [apiData, setApiData] = useState([]); // Initialize as an empty array
  const [locDdoArray, setLocDdoArray] = useState([]);
  const [dept, setDept] = useState([]);
  const [role, setRole] = useState([]);

  const [errorMessages, setErrorMessages] = useState({
    ddoLocationSelected: "",
    deptSelected: "",
    roleSelected: "",
  });

  const [rcds, setRcds] = useState({
    userId: "",
    publicIp: "",
    createdBy: "",
    ddoLocationSelected: "",
    deptSelected: "",
    roleSelected: "",
  });

  // Updated validation function
  const validateFields = () => {
    const errors = {};

    // Check if each field is selected, if not, assign an error message
    if (!rcds.ddoLocationSelected) errors.ddoLocationSelected = "DDO Location is required";
    if (!rcds.deptSelected) errors.deptSelected = "Department is required";
    if (!rcds.roleSelected) errors.roleSelected = "Role is required";

    return errors;
  };


  const getUserDetails = async () => {


    let response;
    let uDataCookie = retrieveFromCookies("tempUData");
    const uData = uDataCookie ? JSON.parse(uDataCookie) : {};

    const id = uData.id || "NoUser";

    let secretKey = retrieveFromCookies("AESDecKey");
    const ciphertext = encAESData(secretKey, { id });
    response = await getUserRights(ciphertext);

    const responseData = checkResponseStatus(response);

    if (responseData.rData) {
      const recJson = JSON.parse(responseData.rData);
      const decryptedData = decAESData(secretKey, recJson);

      const jsonFormData = JSON.parse(decryptedData.recData);

      console.log(jsonFormData);
      

      setApiData(jsonFormData);
      setOriginalData(jsonFormData.flat());


      if (Array.isArray(jsonFormData)) {
        const uniqueLocDdoArray = [];

        // Populate the array with unique combinations
        jsonFormData.flat().forEach((item) => {
          const combinationValue = {
            value: `${item.locId}~${item.ddoId}`, // Set value as locId~ddoId
            label: `${item.loc}~${item.ddoName}`, // Set label as loc~ddoName
          };

          // Check for duplicates before adding
          const isDuplicate = uniqueLocDdoArray.some(
            (entry) => entry.value === combinationValue.value
          );
          if (!isDuplicate) {
            uniqueLocDdoArray.push(combinationValue);
          }
        });

        setLocDdoArray(uniqueLocDdoArray);
        console.log(uniqueLocDdoArray);
      } else {
        console.error("Decrypted data is not an array:", decryptedData.recData);
      }
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  useEffect(() => {
    if (rcds.ddoLocationSelected) {
      console.log("Selected DDO Location:", rcds.ddoLocationSelected);
      const selectedValue = rcds.ddoLocationSelected;
      const [locId, ddoId] = selectedValue.split("~");

      // Filter original data to get matches
      const matches = originalData.filter(
        (item) => item.locId === locId && item.ddoId === ddoId
      );

      console.log("Matched items for departments:", matches);

      // Map the matches to department options
      const deptOptionsArray = matches.map((item) => ({
        value: item.deptId, // Use a unique identifier for the value
        label: item.dept, // Customize label as needed
      }));

      // Update the state with department options
      setDept(deptOptionsArray);
    }
  }, [rcds.ddoLocationSelected, originalData]); // Depend on the selected DDO location and originalData

  useEffect(() => {
    if (rcds.deptSelected) {
      console.log("Selected DDO Location:", rcds.deptSelected);
      const deptIdSelected = rcds.deptSelected;

      // Filter original data to get matches
      const matches = originalData.filter(
        (item) => item.deptId === deptIdSelected
      );

      console.log("Matched items for departments:", matches);

      // Map the matches to department options
      const roleOptionsArray = matches.map((item) => ({
        value: item.rid, // Use a unique identifier for the value
        label: item.roleName, // Customize label as needed
      }));

      // Update the state with department options
      setRole(roleOptionsArray);
    }
  }, [rcds.deptSelected, originalData]);


  const onSubmitUserType = async () => {
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      // If validation errors, set the error messages and prevent submission
      setErrorMessages(errors);
      return;
    }
    const selectedValue = rcds.ddoLocationSelected;
    const [locId, ddoId] = selectedValue.split("~");
    const deptIdSelected = rcds.deptSelected;
    const roleSelected = rcds.roleSelected;

    // Filter original data to get matches
    const matches = originalData.filter(
      (item) =>
        item.locId === locId &&
        item.ddoId === ddoId &&
        item.deptId === deptIdSelected &&
        item.rid === roleSelected
    );

    console.log(matches);
    // console.log(matches);

    let userSelected = matches[0];
    console.log(userSelected ,"-----------------------");
    console.log(userSelected.userDetId);

    let uDataCookie = retrieveFromCookies("tempUData");
    const uData = uDataCookie ? JSON.parse(uDataCookie) : {};


    const userDetId = userSelected.userDetId;

    storeInCookies("userDptRole", JSON.stringify(userSelected));
    storeInCookies("userDetId", userDetId);
    Cookies.remove("tempUData");
    // Cookies.set("uData", JSON.stringify(uData));
    storeInCookies("uData", JSON.stringify(uData));
    localStorage.clear();
    storeInLocalStorage("activeMenuId", "dashboard");

  };

  return (
    <div className="newContainer">
      <div className="newCard">
        <div className="newTitle">Select Department and Role</div>

          <div className="newField">
            <SelectComponent
              options={locDdoArray}
              label="DDO~Location"
              id="ddoLocation"
              selectedValue={rcds.ddoLocationSelected}
              resetValue={resetSelect}
              onSelects={(value) =>
                setRcds((prevState) => ({
                  ...prevState,
                  ddoLocationSelected: value,
                }))
              }
              errorMessage={errorMessages.ddoLocationSelected}
              autofocus ={true}
            />
          </div>
          <div className="newField">
            <SelectComponent
              options={dept}
              label="Department"
              id="Department"
              selectedValue={rcds.deptSelected}
              resetValue={resetSelect}
              onSelects={(value) =>
                setRcds((prevState) => ({
                  ...prevState,
                  deptSelected: value,
                }))
              }
              errorMessage={errorMessages.deptSelected}
            />
          </div>
          <div className="newField">
            <SelectComponent
              options={role}
              label="Roles"
              id="Roles"
              selectedValue={rcds.roleSelected}
              resetValue={resetSelect}
              onSelects={(value) =>
                setRcds((prevState) => ({
                  ...prevState,
                  roleSelected: value,
                }))
              }
              errorMessage={errorMessages.roleSelected}
            />
            <div className="d-flex justify-content-center align-items-center">
              <button
                className="btn btn-primary m-2"
                type="button"
                onClick={onSubmitUserType}
              >
                Submit
              </button>
              <button
                className="btn btn-danger m-2"
                onClick={() => {
                  localStorage.clear();
                  Cookies.remove("AESDecKey");
                  Cookies.remove("publicIp");
                  Cookies.remove("token");
                  Cookies.remove("userDetId");
                  Cookies.remove("userDptRole");
                  Cookies.remove("uData");

                  navigate(config.baseUrl);
                }}
              >
                Back
              </button>
            </div>
          </div>

      </div>
    </div>
  );
};

export default DeptRole;

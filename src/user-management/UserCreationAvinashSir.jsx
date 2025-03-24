import React, { useState, useEffect, useRef, useContext } from "react";
import "../styles/inputStyle.css";
import FormText from "../components/FormText";
import SelectComponent from "../components/SelectComponent";
import FormCheckbox from "../components/FormCheckbox";
import FormButton from "../components/FormButton";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../styles/AdvancedSearch.css";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import ErrorMessageABD from "../components/ErrorMessageABD";

import {
  getDelete,
  getList,
  getSave,
  getUpdate,
  getViewRecord,
  getDropDown,
} from "../utils/api";
import AgGridTable from "../components/AgGridTable";
import Breadcrumbs from "../components/Breadcrumbs";
import icon from "../properties/icon";
import { retrieveFromLocalStorage, retrieveFromCookies, storeInLocalStorage } from "../utils/CryptoUtils";
import AdvanceSearchModal from "../components/AdvanceSearchModal";
import { GlobalContext } from "../context/GlobalContextProvider";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import CustomModal from "../components/CustomModal";
import FormMultiSelect from "../components/FormMultiSelect";
import FilterTags from "../components/FilterTags";




const UserCreation = () => {
  const deleteCooldown = useRef(false);


  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [resetSelect, setResetSelect] = useState(false);
  const [errorVisibleComponent, setErrorMessageVisibleComponent] =
    useState(false);
  const [errorType, setErrorType] = useState();
  const [errorDivMessage, setErrorDivMessage] = useState("");
  const [deptRcds, setDeptRcds] = useState([
    { value: "", label: "" },
  ])

  const [locationDdo, setLocationDdo] = useState([
    { value: "", label: "" },
  ])
  const [errorMessages, setErrorMessages] = useState({
    userType: "",
    empCode: "",
    dynamicValue: "",
    empName: "",
    fatherName: "",
    department: "",
    designation: "",
    email: "",
    isActive: "",
    college: "",
  }); // handling error

  // changes
  const [rcds, setRcds] = useState({
    userTypeId: "",
    userType: "EM",
    empCode: "",
    empName: "",
    dynamicValue: "",
    fatherName: "",
    department: "",
    designation: "",
    email: "",
    isActive: "",
    userId: "",
    publicIp: "",
    createdBy: "",
    modifiedBy: "",
  });

  const {
    s_user,
    columnDefsApi,
    setColumnDefsApi,
    rowData,
    setRowData,
    tableData,
    setTableData,
    refreshAGGrid,
    setrefreshAGGrid,
    tableHeader,
    setTableHeader,
    reloadTableFlag,
    setReloadTableFlag,
    highlightRow,
    setHighlightRow,
  } = useContext(GlobalContext);

  const [userTypeRcds, setUserypeRcds] = useState([{ value: "", label: "" }]);

  const secretKey = retrieveFromCookies("AESDecKey");

  const saveButtonRef = useRef(null); // Reference for the Save button

  const [searchRcds, setSearchRcds] = useState({
    userType: "",
    empCode: "",
    empName: "",
    department: "",
    designation: "",
  });
  const [showSave, setShowSave] = useState(true);
  const [loading, setLoading] = useState(false); // Loading state
  const { checkResponseStatus } = useCheckResponseStatus();

  const data = {
    uName: "Select User Type",
    eCode: "Emp Code",
    eHolder: "Enter Employee Code",
    lName: "location-DDO(s) ",
    dName: "Department",
    dHolder: "Department",
    fName: "Father Name",
    fHolder: "Enter Father Name",
    eName: "Email",
    eholder: "Email",
    dsName: "Designation",
    dsHolder: "Designation",
    idholder: "Login Id",
    idName: "Login Id",
    pHolder: "Enter Password",
    pName: "Password",
    exName: "Expiry Date",
    exHolder: "Expiry Date",
    rName: "Role",
    mrName: " Is BackOffice Modules Required?",
    epName: "Is Employee Portal Access",
    adName: "Module Admin Code",
    adHolder: "Module Admin Code",
    anName: "Module Admin Name",
    anHolder: "Module Admin Name",
    userType: "userType",
    empCode: "empCode",
    empName: "empName",
    fatherName: "fatherName",
    department: "department",
    designation: "designation",
    email: "email",
    isActive: "isActive",
    // college: "college",
    save: "Save",
    delete: "Delete",
    update: "Update",
    back: "Back",
    reset: "Reset",
  };
  const handleBack = () => {
    deleteCooldown.current = false;

    if (saveButtonRef.current) {
      saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // Alternatively, clear form data and reset state if needed
    setRcds({
      userTypeId: "",
      userType: "",
      empCode: "",
      empName: "",
      fatherName: "",
      department: "",
      designation: "",
      email: "",
      isActive: "",
      college: "",
      userId: "",
    });
  };

  const handleReset = () => {
    // Reset rcds to its initial state
    setRcds({
      userTypeId: "",
      userType: "",
      empCode: "",
      empName: "",
      fatherName: "",
      department: "",
      designation: "",
      email: "",
      isActive: "",
      college: "",
    });

    setErrorMessages("");
  };

  const handleChange = (evt) => {

    const { name, value, type, checked } = evt.target;

    console.log(name, value, " /////////////////////////////////////");

    setRcds((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    }));

    // Remove the error for the current field while typing
    setErrorMessages((prevErrors) => ({
      ...prevErrors,
      [name]: "", // Clear error message for the current field
    }));
  };

  const handleSearchChange = (evt) => {
    const { name, value } = evt.target;
    setSearchRcds((prevState) => ({
      ...prevState,
      [name]: value,
    }));

  };

  const validateFields = () => {
    const errors = {};
    if (!rcds.userType) errors.userType = "User Type is required";
    if (!rcds.empCode) errors.empCode = "Employee Code is required";
    if (!rcds.empName) errors.empName = "Employee Name is required";
    if (!rcds.fatherName) errors.fatherName = "Father Name is required";
    if (!rcds.department) errors.department = "Department is required";
    if (!rcds.designation) errors.designation = "Designation is required";
    if (!rcds.email) errors.email = "Email is required";
    //if (!rcds.college) errors.college = "College is required";
    return errors;
  };

  const handleCreate = async (evt) => {
    evt.preventDefault(); // Prevent default form submission
    setLoading(true); // Start loading state
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      setLoading(false);
      return;
    }
    setShowSave(false)

    const updatedRcds = {
      ...rcds,
      userId: s_user.userId, // Ensure userId is included
      publicIp: s_user.publicIp, // Ensure publicIp is included
    };
    try {
      // Encrypt the updated rcds with the userId
      const ciphertext = encAESData(secretKey, updatedRcds);
      console.log("Encrypted Data: ", ciphertext);

      let responseData;

      console.log(rcds, "varun");

      if (rcds.userTypeId) {
        // Update the existing record
        const response = await getUpdate("user", "userTypeMaster", ciphertext);
        console.log("Update response from backend:", response.data);

        responseData = checkResponseStatus(response);

      } else {
        // Send data to the backend
        const response = await getSave("user", "userTypeMaster", ciphertext);
        console.log("Response from backend:", response.data);
        responseData = checkResponseStatus(response);
        console.log(responseData);
      }

      setRcds({
        // Replace with your initial state for rcds
        userTypeId: null,
        userType: "",
        empCode: "",
        empName: "",
        fatherName: "",
        department: "",
        designation: "",
        email: "",
        isActive: "",
        userId: rcds.userId,
        publicIp: rcds.publicIp,
        //college: "",
      });

      if (responseData) {
        // Check if the operation was successful
        if (responseData.rType === "Y") {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);
          console.log("Decrypted Data:", decryptedData);

          // Clear the form fields by resetting rcds to its initial state

          setErrorMessageVisibleComponent(true);
          setErrorType(true);
          setErrorDivMessage(responseData.rMessage);
          setShowSave(true)
          // Automatically hide the message after it has been shown
          setTimeout(() => {
            setErrorMessageVisibleComponent(false);
            setErrorDivMessage("");

          }, 4000); // Adjust time as needed
        } else {
          setErrorMessageVisibleComponent(true);
          setErrorDivMessage(responseData.rMessage);

          setShowSave(true);
          setTimeout(() => {
            setErrorMessageVisibleComponent(false);
            setErrorDivMessage("");

          }, 4000);

        }

        // Refresh the data list after saving
        getData();
      }
    } catch (error) {
      console.error("Error during create/update:", error);
    } finally {
      setLoading(false); // End loading state
      deleteCooldown.current = false;

    }
  };

  const getData = async () => {
    try {

      const menuId = retrieveFromLocalStorage("activeMenuId");
      // Encrypt the searchRcds data
      const ciphertext = encAESData(secretKey, { menuId });
      // Encrypt the searchRcds data

      // Send request to get the list
      const response = await getList("user", "userTypeMaster", ciphertext, {});

      console.log("Full response from backend:", response);
      const responseData = checkResponseStatus(response);

      console.log(responseData);

      if (responseData.rType === "Y") {
        if (responseData.rData) {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);

          console.log(decryptedData);

          const header = JSON.parse(decryptedData.recData.header);

          let updatedData = [];
          if (decryptedData.recData.data) {
            const dataRec = JSON.parse(decryptedData.recData.data);

            // Add serialNo to the data
            updatedData = dataRec.map((item, index) => ({
              ...item,
              serialNo: index + 1, // Auto-increment serialNo
            }));
          }


          const updatedHeader = header
            .sort((a, b) => {
              if (a.order_by < b.order_by) return -1;  
              if (a.order_by > b.order_by) return 1;   
              return 0;                               
            })
            .map(({ width, ...item }) => ({
              ...item,
              cellStyle: {
                textAlign: item.cellStyle,
                whiteSpace: "normal", // Allow text to wrap
                wordWrap: "break-word",
              },
              autoHeight: true, // Automatically adjust the row height to fit content
            }));

          console.log(updatedHeader);

          setTimeout(() => {
            setTableData(updatedData); // for changing table data
            setColumnDefsApi(updatedHeader);
            setRowData(updatedData); // for globally keeping the Table data
          }, 500);
        }
      } else {
        setColumnDefsApi([]);
      }


    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const userTypeQuery = {
    table: "cparam",
    fields: "pdoc,descp1",
    condition:
      " 1=1 and code='USER' and serial='USERTYPE' ",
    orderBy: "",
  };

  const getDropDownData = async () => {
    try {
      getDropDown(
        userTypeQuery,
        userTypeRcds,
        setUserypeRcds,
        "common",
        secretKey
      );
    } catch { }
  };

  useEffect(() => {
    getDropDownData();
    getData();
  }, []);

  const dynamicQuery = {
    table: "vw_user_type_details",
    fields: "typ, name",
    condition: `typ = '${rcds.userType}'`,
    orderBy: "",
  };

  const getDeptDropDownData = async () => {
    getDropDown(dynamicQuery, deptRcds, setDeptRcds, "common", secretKey);
  };


  useEffect(() => {
    if (rcds.userType) {
      getDeptDropDownData();
    }
  }, [rcds.userType]);

  const locationDdoQuery = {
    table: "ddo d, leave_location_mast  l, ddolocationmapping dlm ",
    fields: "concat( l.LOCATION_NAME, '~',d.DDONAME) as location_ddo_name, concat(dlm.DDO_ID,'~',  dlm.LOCATION_CODE,'~',dlm.id) as location_ddo_id",
    condition: "d.DDO_ID=dlm.DDO_ID and l.LOCATION_CODE=dlm.LOCATION_CODE",
    orderBy: ""
}

const getLocationDdoDropDownData = async () => {
  getDropDown(locationDdoQuery, locationDdo, setLocationDdo, "common", secretKey);
};

const [templocationDdo, setTempLocationDdo] = useState([{ value: "", label: "" }]);

useEffect(() => {
  const newLocationDdo = locationDdo.map((temp) => ({
    value: temp.label,
    label: temp.value,
  }));

  setTempLocationDdo(newLocationDdo);
}, [locationDdo]);

useEffect(() => {
  if (rcds.userType) {
    getLocationDdoDropDownData(); 
  }
}, [rcds.userType]);

  const getUserTypeLabel = (userTypeId) => {
    const userType = userTypeRcds.find((item) => item.value === userTypeId);
    return userType ? userType.label : "";
  };

  const viewRecord = async (userTypeId) =>{
    try {
      deleteCooldown.current = true;
      setErrorMessages("");
      const ciphertext = encAESData(secretKey, userTypeId);
      const response = await getViewRecord(
        "user",
        "userTypeMaster",
        ciphertext
      );

      const responseData = checkResponseStatus(response);

      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);
        console.log("Decrypted Data:", decryptedData);
        const dataToRec = JSON.parse(decryptedData.recData);

        const dataToSet = dataToRec[0];

        setRcds({
          userTypeId: dataToSet.userTypeId,
          userType: dataToSet.userType,
          empCode: dataToSet.empCode,
          empName: dataToSet.empName,
          fatherName: dataToSet.fatherName,
          department: dataToSet.department,
          designation: dataToSet.designation,
          email: dataToSet.email,
          college: dataToSet.college,
          isActive: dataToSet.isActive.toUpperCase() === "Y" ? "Y" : "N",
          userId: s_user.userId,
          publicIp: s_user.publicIp,     
        });
      }

    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  };

  const handleDelete = async (userTypeId) => {
    setHighlightRow(true);
    deleteCooldown.current = true;
    setShowSave(false)
    setLoading(true);

    try {
      const ciphertext = encAESData(secretKey, userTypeId);

      const response = await getDelete(
        "user",
        "userTypeMaster",
        ciphertext,
        {}
      );

      console.log("Delete response from backend:", response.data);
      const responseData = checkResponseStatus(response);

      if (responseData.rData) {
        const jsonData = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, jsonData);
        console.log("Decrypted Data:", decryptedData);
      } else {
        console.error("encryptData is undefined in the backend response.");
      }

      getData();
      if (responseData.rType === "Y") {

        setErrorMessageVisibleComponent(true);
        setErrorType(true);
        setErrorDivMessage(responseData.rMessage);
        setShowSave(true)
        setTimeout(() => {
          setErrorMessageVisibleComponent(false);
          setErrorDivMessage("");

        }, 4000); // Adjust time as needed
      } else {
        setErrorMessageVisibleComponent(true);
        setErrorType(false);
        setErrorDivMessage(response.data.rMessage);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    } finally {
      setLoading(false); // End loading state

      setShowSave(true)
      // Set the cooldown
      setTimeout(() => {
        deleteCooldown.current = false;

      }, 4000);
      setHighlightRow(false); //changes

    }

  };

  const columnDefs = [
    {
      headerName: 'Serial No.',
      field: 'serialNo',
      sortable: false,
      cellStyle: { textAlign: "center" },
      width: 100,
      headerClass: 'ag-header-cell',
    },
    ...columnDefsApi,
    {
      headerName: 'Action',
      field: 'button',
      cellStyle: { textAlign: "center" },
      cellRenderer: (params) => (
        <>
          <span
            className="manipulation-icon edit-color mx-3"
            onClick={() => {
              const id = { userTypeId: params.data.userTypeId };  // Access the row data to get the roleId
              setHighlightRow(true); //changes
              viewRecord(id)
                ;  // Call viewRecord function with the id
              window.scrollTo({ top: 0, behavior: "smooth" });  // Scroll to the top
            }}
          >
            <FontAwesomeIcon icon={faEdit} className='icon-size' />
          </span>

          <span
            className={`manipulation-icon delete-color ${deleteCooldown.current ? 'disabled' : ''} mx-1`}
            onClick={() => {
              const confirmDelete = window.confirm("Are you sure you want to delete this record?");
              if (confirmDelete) {
                if (!deleteCooldown.current) {  // Check if it's not editing and no delete cooldown
                  const id = { userTypeId: params.data.userTypeId };
                  handleDelete(id);
                }
              }
            }}
            style={{
              pointerEvents: deleteCooldown.current ? 'none' : 'auto',  // Disable pointer events during editing or cooldown
              opacity: deleteCooldown.current ? 0.5 : 1,  // Reduce opacity to indicate disabled state
              cursor: deleteCooldown.current ? 'not-allowed' : 'pointer',
            }}
          >
            <FontAwesomeIcon icon={faTrash} className='icon-size' />
          </span>

        </>
      ),
      sortable: false,
      filter: false,  // No filtering for actions columns
      // flex: 1,
      cellClass: 'ag-center-cols-cell',  // Optional: center the edit icon
      width: 100,
    },
  ];

  //////////////////////////**** new header format *///////////////////////////////////

  useEffect(() => {
    if (columnDefsApi && columnDefsApi.length > 0) {
      setTableHeader(columnDefs);
    }
  }, [columnDefsApi]);


  const filterTableData = () => {

    const filteredData = rowData
      .filter((apiDataRec) => {
        // Define filter conditions
        const matchesUserType = searchRcds.userType ? apiDataRec.userTypeCode === searchRcds.userType : true;

        const matchesEmployeeName = searchRcds.empName
          ? apiDataRec.empDetail.toLowerCase().includes(searchRcds.empName.toLowerCase())
          : true;

        const matchesDepartment = searchRcds.department ? apiDataRec.deptCode === searchRcds.department : true;

        const matchesDesignation = searchRcds.designation
          ? apiDataRec.designation.toLowerCase().includes(searchRcds.designation.toLowerCase())
          : true;

        const matchesIsActive = searchRcds.isActive ? apiDataRec.isActive === searchRcds.isActive : true;
        // Return true if both conditions are met
        return matchesIsActive && matchesDesignation && matchesDepartment && matchesEmployeeName && matchesUserType;
      })
      .map((item, sno) => ({
        serialNo: sno + 1,
        userType: item.userType,
        empDetail: item.empDetail,
        department: item.department,
        designation: item.designation,
        isActive: item.isActive,
        userTypeId: item.userTypeId,
      }));

    setTableData(filteredData);
    setIsOpen(false);
  };

  const resetTable = () => {
    setrefreshAGGrid(true);
    setTableHeader(columnDefs);
    setTableData(rowData);
    setSelectedValues([]);
  };


  ///////////////////////////////////*************shortcuts**********////////////////////////////////////////////////////////


  useKeyboardShortcut(
    "S",
    (e) => { // Pass the event to the callback
      handleCreate(e); // Now `e` is available here
    },
    { ctrl: true }
  );

  useKeyboardShortcut(
    "R",
    () => { // Pass the event to the callback // Set the reload flag to true to show the spinner
      setReloadTableFlag(true);
      resetTable(); // Now `e` is available here

      // After 3 seconds, set the reload flag to false to hide the spinner
      setTimeout(() => {
        setReloadTableFlag(false);
      }, 600);

    },
    { alt: true }
  );

  useKeyboardShortcut(
    "S",
    () => {
      if (modalIsOpen) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    },
    { alt: true }
  );

  useKeyboardShortcut(
    "C",
    () => {
      if (customModalIsOpen) {
        setCustomModelIsOpen(false);
      } else {
        setCustomModelIsOpen(true);
      }
    },
    { alt: true }
  );


  const [customModalIsOpen, setCustomModelIsOpen] = React.useState(false);

  function openModal() {
    setCustomModelIsOpen(true);
  }

  const [selectedValues, setSelectedValues] = useState([]);




  return (
    <>
      <div className="rightArea">
        <div className="container-fluid px-1">
          <Breadcrumbs />
        </div>
        <div className="container-body mx-3 mb-2">
          <form action="" className="mb-5">
            <div className="row mb-3">
              <p className="card-title h6">
                {retrieveFromLocalStorage("pageName")}
              </p>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="row mb-3">

                  <div className="col-md-6">
                    <SelectComponent
                      autofocus={true}
                      label={data.uName}
                      name="userType"
                      selectedValue={rcds.userType}
                      options={userTypeRcds}
                      errorMessage={errorMessages.userType}
                      onChange={handleChange}
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          userType: value,
                        }))
                      }
                      icon={icon.star}
                    />
                  </div>

                  <div className="col-md-6">
                    <SelectComponent
                      autofocus={true}
                      label={getUserTypeLabel(rcds.userType)}
                      name="userType"
                      selectedValue={rcds.userType}
                      options={deptRcds}
                      errorMessage={errorMessages.userType}
                      onChange={handleChange}
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          dynamicValue: value,
                        }))
                      }
                      icon={icon.star}
                    />
                  </div>

                </div>

                <div className="row mb-3">

                  <div className="col-md-6">
                    <SelectComponent
                      autofocus={true}
                      label={data.lName}
                      name="userType"
                      selectedValue={rcds.userType}
                      options={templocationDdo}
                      errorMessage={errorMessages.userType}
                      onChange={handleChange}
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          userType: value,
                        }))
                      }
                      icon={icon.star}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <FormText
                      label={ `${getUserTypeLabel(rcds.userType)} Code`}
                      name={data.designation}
                      value={rcds[data.department]}
                      errorMessage={errorMessages.department}
                      holder={`${getUserTypeLabel(rcds.userType)} Code `}
                      onChange={handleChange}
                      icon={icon.star}
                      disable={true}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormText
                      label={`${getUserTypeLabel(rcds.userType)} Name `}
                      name={data.designation}
                      value={rcds[data.designation]}
                      holder={`${getUserTypeLabel(rcds.userType)} Name `}
                      errorMessage={errorMessages.designation}
                      onChange={handleChange}
                      icon={icon.star}
                      disable={true}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <FormText
                      label={data.dName}
                      name={data.department}
                      value={rcds[data.department]}
                      holder={data.dHolder}
                      errorMessage={errorMessages.department}
                      onChange={handleChange}
                      icon={icon.star}
                      disable={true}
                    />
                  </div>


                  <div className="col-md-6">
                    <FormText
                      label={data.fName}
                      name={data.designation}
                      value={rcds[data.designation]}
                      holder={data.fHolder}
                      errorMessage={errorMessages.designation}
                      onChange={handleChange}
                      icon={icon.star}
                      disable={true}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <FormText
                      label={data.dsName}
                      name={data.designation}
                      value={rcds[data.designation]}
                      holder={data.dsHolder}
                      errorMessage={errorMessages.designation}
                      onChange={handleChange}
                      icon={icon.star}
                      disable={true}
                    />
                  </div>


                  <div className="col-md-6">
                    <FormText
                      label={data.eName}
                      name={data.designation}
                      value={rcds[data.designation]}
                      holder={data.eholder}
                      errorMessage={errorMessages.designation}
                      onChange={handleChange}
                      icon={icon.star}
                      disable={true}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <FormText
                      label={data.idName}
                      name={data.designation}
                      value={rcds[data.designation]}
                      holder={data.idholder}
                      errorMessage={errorMessages.designation}
                      onChange={handleChange}
                      icon={icon.star}
                    />
                  </div>


                  <div className="col-md-6">
                    <FormText
                      label={data.pName}
                      name={data.designation}
                      value={rcds[data.designation]}
                      holder={data.pHolder}
                      errorMessage={errorMessages.designation}
                      onChange={handleChange}
                      icon={icon.star}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <FormCheckbox
                      label={data.mrName}
                      name="isActive"
                      checked={rcds.isActive === "Y"} // Check if isAdmin is "Y" for checked
                      onChange={(evt) => {
                        if (evt && evt.target) {
                          const { checked } = evt.target; // Get the checked state
                          setRcds((prevState) => ({
                            ...prevState,
                            isActive: checked ? "Y" : "N", // Update isAdmin based on checked state
                          }));
                        }
                      }}

                      iconClass={icon.star} // Font Awesome icon for admin
                      errorMessage={errorMessages.isActive} // Pass the error message if applicable
                    />
                  </div>


                  <div className="col-md-2">
                    <FormCheckbox
                      label={data.epName}
                      name="isActive"
                      checked={rcds.isActive === "Y"} // Check if isAdmin is "Y" for checked
                      onChange={(evt) => {
                        if (evt && evt.target) {
                          const { checked } = evt.target; // Get the checked state
                          setRcds((prevState) => ({
                            ...prevState,
                            isActive: checked ? "Y" : "N", // Update isAdmin based on checked state
                          }));
                        }
                      }}

                      iconClass={icon.star} // Font Awesome icon for admin
                      errorMessage={errorMessages.isActive} // Pass the error message if applicable
                    />
                  </div>
                </div>


                <div className="row mb-3">

                  <div className="col-md-6">
                    <FormCheckbox
                      label={data.acName}
                      name="isActive"
                      checked={rcds.isActive === "Y"} // Check if isAdmin is "Y" for checked
                      onChange={(evt) => {
                        if (evt && evt.target) {
                          const { checked } = evt.target; // Get the checked state
                          setRcds((prevState) => ({
                            ...prevState,
                            isActive: checked ? "Y" : "N", // Update isAdmin based on checked state
                          }));
                        }
                      }}

                      iconClass={icon.star} // Font Awesome icon for admin
                      errorMessage={errorMessages.isActive} // Pass the error message if applicable
                    />
                  </div>

                </div>

                <div className="row">
                  <div className="col-md-12">
                    {
                      showSave && <FormButton
                        btnType1={data.save}
                        btnType3={data.update}
                        btnType4={data.back}
                        btnType5={data.reset}
                        onClick={handleCreate}
                        onBack={handleBack}
                        onReset={handleReset}
                        showUpdate={!!rcds.userTypeId}
                        rcds={rcds}
                        loading={loading}
                      />
                    }
                  </div>
                </div>
              </div>

            </div>
          </form>

        </div>
        {errorVisibleComponent && (
          <div className="d-flex justify-content-center align-items-center my-4">
            <ErrorMessageABD
              text={errorDivMessage}
              isSuccess={errorType}
              isVisible={errorVisibleComponent}
              setVisible={setErrorMessageVisibleComponent} // Pass the function to reset visibility
            />
          </div>
        )}

        <div className="container-body mx-3 mb-3">
          <p className="h6 card-title list-header">
            {" "}
            <small>
              {" "}
              List of User Type detail<span className="parenthesis">(</span>s
              <span className="parenthesis">)</span>
            </small>
          </p>


          <div

            className="refresh-table "
            id="refresh-table"
            aria-label="" data-bs-toggle="tooltip" data-bs-placement="auto" title={`Refresh Data {Shift + R}`}
            onClick={(e) => {
              e.preventDefault();
              setReloadTableFlag(true);

              setTimeout(() => {
                setReloadTableFlag(false);
              }, 600);

              resetTable();
            }}
          >
            {
              reloadTableFlag ? (
                <div className="spinner-border text-primary" role="status">
                </div>
              ) : (
                <i className={`${icon.refresh} text-primary`}></i>
              )
            }
          </div>




          <div className="ag-theme-alpine">
            <AdvanceSearchModal
              setSearchRcds={setSearchRcds}
              modalIsOpen={modalIsOpen}
              setIsOpen={setIsOpen}>

              <div className="card advanceSearchModal">
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <SelectComponent
                        autofocus={true}
                        label={data.uName}
                        name={data.userType}
                        selectedValue={searchRcds.userType}
                        resetValue={resetSelect}
                        onSelects={(value) =>
                          setSearchRcds((prevState) => ({
                            ...prevState,
                            userType: value,
                          }))
                        }
                        icon={icon.arrowDown}
                        options={userTypeRcds}
                      />
                    </div>

                    <div className="col-md-4">

                      <FormText
                        label={data.edField}
                        name={data.empName}
                        holder={data.enHolder}
                        value={searchRcds[data.empName]}
                        errorMessage={errorMessages.empName} // Pass the error message for mappedAlias
                        onChange={handleSearchChange}
                        icon={icon.user}
                      />
                    </div>

                    <div className="col-md-4">
                      <SelectComponent
                        label={data.dName}
                        name={data.department}
                        selectedValue={searchRcds.department}
                        resetValue={resetSelect}
                        onSelects={(value) =>
                          setSearchRcds((prevState) => ({
                            ...prevState,
                            department: value,
                          }))
                        }

                        icon={icon.arrowDown}
                        options={deptRcds}
                      />
                    </div>

                    <div className="col-md-4">
                      <FormText
                        label={data.dsName}
                        name={data.designation}
                        holder={data.dsHolder}
                        value={searchRcds[data.designation]}

                        onChange={handleSearchChange}
                        icon={icon.user}

                      />
                    </div>
                    <div className="col-md-4">
                      <SelectComponent
                        label={data.acName}
                        name={data.isActive}
                        selectedValue={searchRcds.isActive}
                        resetValue={resetSelect}
                        onSelects={(value) =>
                          setSearchRcds((prevState) => ({
                            ...prevState,
                            isActive: value,
                          }))
                        }
                        icon={icon.arrowDown}
                        options={[
                          { value: "Y", label: "Yes" },
                          { value: "N", label: "No" },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12 d-flex justify-content-center align-items-center">
                      <button
                        className="me-1 btn btn-primary btn-color btn-sm"
                        onClick={filterTableData}
                      >
                        Search
                      </button>
                      <button
                        className="btn btn-warning btn-color btn-sm ms-2"
                        onClick={() => {
                          setSearchRcds({
                            semester: "",
                            alias: "",
                            isActive: "",
                          });
                          resetTable();
                        }}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>


            </AdvanceSearchModal>


            <div
              className={`d-flex align-items-center p-2 border rounded-3 addRemoveButtoninCustomModal ${selectedValues.length === 0 ? '' : 'addRemoveButtonHighlight'}`}
              tabIndex={1}
              onClick={openModal}
              aria-label=""
              data-bs-toggle="tooltip"
              data-bs-placement="auto"
            >
              <span>
                <i className={`${icon.column} me-2`}></i>
                Remove Column
              </span>
            </div>

            <CustomModal
              width="30%"
              left="55%"
              top="40%"
              setIsOpen={setCustomModelIsOpen}
              modalIsOpen={customModalIsOpen}
              header="Add to remove Column"
            >
              <div className="card advanceSearchModal">
                <div className="card-body">
                  <div className="row mb-3">
                    <FilterTags
                      columnDefs={columnDefs}
                      columnDefsApi={columnDefsApi}
                      setTableHeader={setTableHeader}
                      selectedValues={selectedValues}
                      setSelectedValues={setSelectedValues}
                    />
                  </div>

                </div>
              </div>
            </CustomModal>

            <AgGridTable
              rowData={tableData}
              columnDefs={tableHeader}
              hardRefreshFlag={refreshAGGrid}
              setrefreshAGGrid={setrefreshAGGrid}
              highlightRow={highlightRow}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default UserCreation;

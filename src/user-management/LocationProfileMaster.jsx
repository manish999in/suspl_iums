import React, { useContext, useEffect, useRef, useState } from 'react';
import "../styles/inputStyle.css";
import FormText from "../components/FormText";
import FormCheckbox from "../components/FormCheckbox";
import FormButton from "../components/FormButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../styles/AdvancedSearch.css";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import ErrorMessageABD from "../components/ErrorMessageABD";
import FormRadio from "../components/FormRadio";

import icon from "../properties/icon";

import {
  getDelete,
  getList,
  getSave,
  getUpdate,
  getViewRecord,
  getRecordByCount,
  getDropDown
} from "../utils/api";
import AgGridTable from '../components/AgGridTable';
import Breadcrumbs from '../components/Breadcrumbs';
import SelectComponent from '../components/SelectComponent';
import { retrieveFromLocalStorage, retrieveFromCookies, storeInLocalStorage } from "../utils/CryptoUtils";
import AdvanceSearchModal from '../components/AdvanceSearchModal';
import { GlobalContext } from '../context/GlobalContextProvider';
import useKeyboardShortcut from '../hooks/useKeyboardShortcut';
import CustomModal from '../components/CustomModal';
import FormMultiSelect from '../components/FormMultiSelect';
import FilterTags from '../components/FilterTags';



const LocationProfileMaster = () => {


  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [showSave, setShowSave] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetSelect, setResetSelect] = useState(false);

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

  const [errorVisibleComponent, setErrorMessageVisibleComponent] =
    useState(false);
  const [errorType, setErrorType] = useState();
  const [errorDivMessage, setErrorDivMessage] = useState("");

  const [affrcds, setaffRcds] = useState([
    { value: "", label: "" }
  ]);

  const deleteCooldown = useRef(false);

  const [clgTypeRcds, setclgTypeRcds] = useState([
    { value: "", label: "" },
  ])

  const [clgCatgRcds, setclgCatgRcds] = useState([
    { value: "", label: "" },
  ])

  const [name, setName] = useState("");
  const [errorMessages, setErrorMessages] = useState({
    isHeadquarter: "N",
    isUniv: "",
    isActive: "",
    educationType: "",
    isGovernment: "",
    displayName: "",
    capacity: "",
    block: "",
    tehsil: "",
    website: "",
    address: "",
    email: "",
    phone: "",
    mobile: "",
    contactPerson: "",
    collegeName: "",
    collegeCode: "",
    district: "",
    collegeCategory: "",
    collegeType: "",
    affiliationType: "",
    place: "",
  }); // handling error

  const toggleSearchBar = () => {
    setIsOpen(!isOpen);
  };



  // changes
  const [rcds, setRcds] = useState({
    id: "",
    isHeadquarter: "N",
    isUniv: "",
    isActive: "N",
    educationType: "",
    isGovernment: "",
    displayName: "",
    capacity: "",
    block: "",
    tehsil: "",
    website: "",
    address: "",
    email: "",
    phone: "",
    mobile: "",
    contactPerson: "",
    collegeName: "",
    collegeCode: "",
    district: "",
    collegeCategory: "",
    collegeType: "",
    affiliationType: "",
    place: "",
    userId: "", 
    publicIp: "", 
    createdBy: "",
    modifiedBy: "",
  });

  const secretKey = retrieveFromCookies("AESDecKey");

  const saveButtonRef = useRef(null); // Reference for the Save button

  const [searchRcds, setSearchRcds] = useState({
    isUniv: "",
    isActive: "",
    collegeName: "",
    collegeCode: "",
    collegeCategory: "",
    collegeType: "",
    affiliationType: "",
  });

  const [apiData, setApiData] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [recordCounts, setRecordCounts] = useState(0);
  const [loading, setLoading] = useState(false); // Loading state
  const { checkResponseStatus } = useCheckResponseStatus();
  const [isEditing, setIsEditing] = useState(false); // state initaialize
  const data = {
    pcName: "College/Location Code",
    pcHolder: "College/Location Code",
    pName: "College/Location Name",
    pHolder: "Enter College/Location Name",
    afName: "Affiliation Type ",
    lPName: "College/Location Type",
    lPHolder: "Enter College/Location",
    lcName: "College/Location Category",
    lcholder: "Enter College/Location",
    cpName: " Contact Person",
    cpHolder: "Enter Contact Person",
    isHeadQuarter: "Is HeadQuarter?",
    mNumber: "Mobile Number",
    mHoder: "Enter Mobile Number",
    pNumber: "Phone Number",
    pHolderNum: "Enter Phone Number",
    emailLB: "Email",
    eHolder: " Enter Email",
    aName: "Address",
    aHolder: "Enter Address",
    wName: "Website",
    wHolder: "Enter Website ",
    tName: "Tehsil",
    tHolder: "Enter Tehsil Name",
    bName: "Block",
    bHolder: "Enter Block",
    cName: "Capacity",
    cHolder: "Enter Capacity",
    dsName: "Display Name",
    dsHolder: "Enter Display Name",
    plName: "Place Name",
    plHolder: "Enter Place Holder",
    dName: "District",
    dHolder: "Enter District Name",
    gName: "isGovernment",
    acName: "isActive",
    etType: "Education Type",
    isHeadquarter: "isHeadquarter",
    isUniv: "isUniv",
    isActive: "isActive",
    educationType: "educationType",
    isGovernment: "isGovernment",
    displayName: "displayName",
    capacity: "capacity",
    block: "block",
    tehsil: "tehsil",
    website: "website",
    address: "address",
    email: "email",
    phone: "phone",
    mobile: "mobile",
    contactPerson: "contactPerson",
    collegeName: "collegeName",
    collegeCode: "collegeCode",
    district: "district",
    collegeCategory: "collegeCategory",
    collegeType: "collegeType",
    affiliationType: "affiliationType",
    place: "place",
    save: "Save",
    delete: "Delete",
    update: "Update",
    back: "Back",
    reset: "Reset",
    maxContact: 255,
    maxClgCode: 15,
    maxPlace: 20,

  };
  const handleBack = () => {
    // Scroll back to the save button
    deleteCooldown.current = false;
    if (saveButtonRef.current) {
      saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
    }



    // Alternatively, clear form data and reset state if needed
    setRcds({
      id: "",
      isHeadquarter: "",
      isUniv: "",
      isActive: "",
      educationType: "",
      isGovernment: "",
      displayName: "",
      capacity: "",
      block: "",
      tehsil: "",
      website: "",
      address: "",
      email: "",
      phone: "",
      mobile: "",
      contactPerson: "",
      collegeName: "",
      collegeCode: "",
      district: "",
      collegeCategory: "",
      collegeType: "",
      affiliationType: "",
      place: "",
      userId: "",
    });

    setResponseMessage("");
    setIsEditing(false);
  };

  const handleReset = () => {
    // Reset rcds to its initial state

    setRcds({

      id: null,
      isHeadquarter: "",
      isUniv: "",
      isActive: "",
      educationType: "",
      isGovernment: "",
      displayName: "",
      capacity: "",
      block: "",
      tehsil: "",
      website: "",
      address: "",
      email: "",
      phone: "",
      mobile: "",
      contactPerson: "",
      collegeName: "",
      collegeCode: "",
      district: "",
      collegeCategory: "",
      collegeType: "",
      affiliationType: "",
      place: "",
    });

    setErrorMessages("");
  };


  const affiliateQuery = {
    table: "cparam",
    fields: "pdoc,DESCP1",
    condition: "code='COLLEGE' and serial='AFFILIATED'",
    orderBy: "",

  }

  const getAffDropDownData = async () => {

    getDropDown(affiliateQuery, affrcds, setaffRcds, "common", "12345");
  }

  useEffect(() => {
    getAffDropDownData();
  }, []);

  const clgTypeQuery = {
    table: "cparam",
    fields: "pdoc,DESCP1",
    condition: "code='COLLEGE' and serial='TYPE' AND PARAM1='Y'",
    orderBy: "",
  }

  const getClgTypeDropDownData = async () => {
    getDropDown(clgTypeQuery, clgTypeRcds, setclgTypeRcds, "common", "12345");
  }



  useEffect(() => {
    getClgTypeDropDownData();
  }, []);

  const clgCatgQuery = {
    table: "cparam",
    fields: "pdoc,DESCP1",
    condition: "code='COLLEGE' and serial='CATEGORY'",
    orderBy: "",
  }

  const getClgCatgDropDownData = async () => {
    getDropDown(clgCatgQuery, clgCatgRcds, setclgCatgRcds, "common", "12345");
  }

  useEffect(() => {
    getClgCatgDropDownData();
  }, []);

  const handleChange = (evt) => {
    const { name, value, type, checked } = evt.target;

    setRcds((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    }));

    // Clear the error message for the current field while typing
    setErrorMessages((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleSearchChange = (evt) => {
    const { name, value, type, checked } = evt.target;
    setSearchRcds((prevState) => ({
      ...prevState,
      [name]: value,
    }));

  };



  const validateFields = () => {
    const errors = {};
    if (!rcds.educationType) errors.educationType = "Education Type is required";
    if (!rcds.capacity) errors.capacity = "Capacity is required";
    if (!rcds.block) errors.block = "Block is required";
    if (!rcds.tehsil) errors.tehsil = "Tehsil is required";
    if (!rcds.website) errors.website = "Website is required";
    if (!rcds.address) errors.address = "Address is required";
    if (!rcds.email) errors.email = "Email is required";
    // if (!rcds.phone) errors.phone = "Phone is required";
    if (!rcds.phone) {
      errors.phone = "Phone is required";
    } else if (isNaN(rcds.phone) || rcds.phone <= 0) {
      errors.phone = "Phone  must be  Numeric";
    }
    // if (!rcds.mobile) errors.mobile = "Mobile is required";
    if (!rcds.mobile) {
      errors.mobile = "Mobile is required";
    } else if (isNaN(rcds.mobile) || rcds.mobile <= 0) {
      errors.mobile = "Mobile  must be  Numeric";
    }
    // if (!rcds.contactPerson) errors.contactPerson = "Contact Person is required";

    if (!rcds.contactPerson) {
      errors.contactPerson = "Contact Person is required";
    } else if (isNaN(rcds.contactPerson) || rcds.contactPerson <= 0) {
      errors.contactPerson = "Contact Person must be  Numeric";
    }
    if (!rcds.collegeName) errors.collegeName = "College Name is required";
    if (!rcds.collegeCode) errors.collegeCode = "College Code is required";
    if (!rcds.district) errors.district = "District is required";
    if (rcds.isHeadquarter === "N") {
      if (!rcds.collegeCategory) errors.collegeCategory = "College Category is required";
      if (!rcds.collegeType) errors.collegeType = "College Type is required";
    }
    if (!rcds.affiliationType) errors.affiliationType = "Affiliation Type is required";
    if (!rcds.place) errors.place = "Place is required";
    if (!rcds.displayName) errors.displayName = "Display Name is required";
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
    setShowSave(false);

    const updatedRcds = {
      ...rcds, // Spread the existing fields from rcds
      userId: s_user.userId, // Include userId
      publicIp: s_user.publicIp, // Include publicIp
    };

    try {
      // Encrypt the updated rcds with the userId
      const ciphertext = encAESData(secretKey, updatedRcds);

      let responseData;

      if (rcds.id) {
        // Update the existing record
        deleteCooldown.current = false;
        const response = await getUpdate("user", "profileMaster", ciphertext);
        responseData = checkResponseStatus(response);
      } else {
        // Send data to the backend
        const response = await getSave("user", "profileMaster", ciphertext);
        responseData = checkResponseStatus(response);
      }

      if (responseData) {
        // Check if the operation was successful
        if (responseData.rType === "Y") {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);

          // Clear the form fields by resetting rcds to its initial state
          setRcds({
            id: null,
            isHeadquarter: "",
            isUniv: "",
            isActive: "",
            educationType: "",
            isGovernment: "",
            displayName: "",
            capacity: "",
            block: "",
            tehsil: "",
            website: "",
            address: "",
            email: "",
            phone: "",
            mobile: "",
            contactPerson: "",
            collegeName: "",
            collegeCode: "",
            district: "",
            place: "",
            collegeCategory: "",
            collegeType: "",
            affiliationType: "",
            userId: rcds.userId,
            publicIp: rcds.publicIp,
          });
          setResetSelect(true); // for dropdown search

          setErrorMessageVisibleComponent(true);
          setErrorType(true);
          setErrorDivMessage(responseData.rMessage);
          setShowSave(true);

          // Adjust time as needed
        } else {
          setErrorMessageVisibleComponent(true);
          setErrorType(false);
          setErrorDivMessage(responseData.rMessage);
        }

        // Refresh the data list after saving
        getData();
      }
    } catch (error) {
      console.error("Error during create/update:", error);
    } finally {
      setLoading(false); // End loading state

      deleteCooldown.current = false;
      setShowSave(true);
      // Automatically hide the message after it has been shown
      setTimeout(() => {
        setErrorMessageVisibleComponent(false);
        setErrorDivMessage("");
      }, 4000);

      setHighlightRow(false); // changes
    }
  };
  useEffect(() => {
    if (resetSelect) {
      // Reset the select component after render
      setResetSelect(false);
    }
  }, [resetSelect]);



  const getData = async () => {
    try {
      const ciphertext = encAESData(secretKey, searchRcds);

      // Send request to get the list
      const response = await getList("user", "profileMaster", ciphertext);

      console.log("Full response from backend: getList", response);
      const responseData = checkResponseStatus(response);

      console.log(responseData);

      if (responseData.rType === "Y") {
        if (responseData.rData) {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);
          console.log(decryptedData);

          let updatedData = [];
          if (decryptedData.recData) {

            // Add serialNo to the data
            updatedData = JSON.parse(decryptedData.recData).map((item, index) => ({
              ...item,
              serialNo: index + 1, // Auto-increment serialNo
            }));
          }
          setRowData(updatedData);
          setApiData(updatedData);
        }
      }
      else {
        if (responseData.rData === "no data available") {
          setApiData([]);
        }
      }

      setResponseMessage(
        "Data sent successfully: " + JSON.stringify(responseData)
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      setResponseMessage("Error fetching data: " + error.message);
    }
  };

  useEffect(() => {
    getData();
    window.scrollTo({ top: 0, behavior: "smooth" });

  }, []);


  const viewRecord = async (id) => {
    deleteCooldown.current = true;
    try {
      setErrorMessages("");
      const ciphertext = encAESData(secretKey, { id });

      const response = await getViewRecord("user", "profileMaster", ciphertext);

      const responseData = checkResponseStatus(response);

      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);
        console.log("Decrypted Data in view:", decryptedData);

        const dataToSet = JSON.parse(decryptedData.recData)[0]; // Assuming you want the first item

        // Update rcds state with the decrypted data
        setRcds({
          id: dataToSet.id,
          educationType: dataToSet.educationType,
          displayName: dataToSet.displayName,
          capacity: dataToSet.capacity,
          block: dataToSet.block,
          tehsil: dataToSet.tehsil,
          website: dataToSet.website,
          address: dataToSet.address,
          email: dataToSet.email,
          phone: dataToSet.phone,
          mobile: dataToSet.mobile,
          collegeName: dataToSet.collegeName,
          contactPerson: dataToSet.contactPerson,
          collegeCode: dataToSet.collegeCode,
          collegeCategory: dataToSet.collegeCategory,
          collegeType: dataToSet.collegeType,
          affiliationType: dataToSet.affiliationType,
          place: dataToSet.place,
          district: dataToSet.district,
          isActive: dataToSet.is_active === "Y" ? "Y" : "N",
          isGovernment: dataToSet.isGovernment === "Y" ? "Y" : "N",
          isHeadquarter: dataToSet.isHeadquarter === "Y" ? "Y" : "N",
          userId: s_user.userId,
          publicIp: s_user.publicIp,
        });
      } else {
        console.error("encryptData is undefined in the backend response.");
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
    } finally {
    }
  };

  const handleDelete = async (id) => {
   
    setIsDeleting(true);
    setShowSave(false)
    let response;
    setLoading(true);
    if (!isEditing) {
      try {
        const ciphertext = encAESData(secretKey, { id });
        response = await getDelete("user", "profileMaster", ciphertext);
        console.log("Delete response from backend:", response.data);
        const responseData = checkResponseStatus(response);
        if (responseData.rData) {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);
          console.log("Decrypted Data:", decryptedData);
        } else {
          console.error("encryptData is undefined in the backend response.");
        }
        getData(); // Refresh the table data
        if (responseData.rType === "Y") {
          setErrorMessageVisibleComponent(true);
          setErrorType(true);
          setErrorDivMessage(response.data.rMessage);
        } else {
          setErrorMessageVisibleComponent(true);
          setErrorType(false);
          setErrorDivMessage(response.data.rMessage);
        }
      } catch (error) {
        console.error("Error deleting data:", error);
        setErrorMessageVisibleComponent(true);
        setErrorType(false);
        setErrorDivMessage(response.data.rMessage);
        setShowSave(true);
        setTimeout(() => {
          deleteCooldown.current = false

          setLoading(false);
          setIsDeleting(false);
        }, 4000);
      }
      finally {
        setLoading(false);
        setIsDeleting(false);
        setShowSave(true)
        // Set the cooldown
        setTimeout(() => {
          deleteCooldown.current = false;
        }, 4000);
      }
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
      getData();
    }, 500);

    setTimeout(() => {
      resetTable();
    }, 500);
  }, []);

  const columnDefs = [
    {
      headerName: "Serial No.",
      field: "serialNo",
      sortable: true,
      width: 100,
      cellStyle: { textAlign: "center" },
    },

    {
      headerName: 'College Type',
      field: 'collegeType',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      flex: 2,
    },
    {
      headerName: 'College Code',
      field: 'collegeCode',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      flex: 1,
    },
    {
      headerName: 'College Name',
      field: 'collegeName',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      flex: 1,
    },
    {
      headerName: 'Is Active',
      field: 'isActive',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      flex: 1,

    },
    {
      headerName: 'Capacity',
      field: 'capacity',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      flex: 1,
    },
    {
      headerName: "Action",
      field: "button",
      enableMenu: true,
      cellRenderer: (params) => (
        <>
          <span
            className="manipulation-icon edit-color mx-3"
            onClick={() => {
              const id = params.data.id;
              setHighlightRow(true);
              viewRecord(id); 
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <FontAwesomeIcon icon={faEdit} className="icon-size" />
          </span>

          <span
            className={`manipulation-icon delete-color ${deleteCooldown.current ? "disabled" : ""
              } mx-1`}
            onClick={() => {
              setHighlightRow(false);
              if (!deleteCooldown.current) {
                const confirmDelete = window.confirm(
                  "Are you sure you want to delete this record?"
                );
                if (confirmDelete) {
                  const id = params.data.id;
                  setHighlightRow(true);
                  handleDelete(id);
                  setHighlightRow(false);
                } else {
                  setHighlightRow(false);
                }
              }
            }}
            style={{
              pointerEvents:
                isEditing || deleteCooldown.current ? "none" : "auto",
              opacity: isEditing || deleteCooldown.current ? 0.5 : 1,
              cursor:
                isEditing || deleteCooldown.current ? "not-allowed" : "pointer",
            }}
          >
            <FontAwesomeIcon icon={faTrash} className="icon-size" />
          </span>
        </>
      ),
      sortable: false,
      filter: false,
      cellStyle: { textAlign: "center" },
      width: 100,
    },
  ];

  //////////////////////////****  new header format  ****///////////////////////////////////

  useEffect(() => {
    if (columnDefsApi && columnDefsApi.length > 0) {
      setTableHeader(columnDefs);
    }
  }, [columnDefsApi]);

  const filterTableData = () => {

    const filteredData = apiData
      .filter((apiDataRec) => {

        // Define filter conditions
        const matchesCollegeCode = searchRcds.collegeCode ? apiDataRec.collegeCode.toLowerCase().includes(searchRcds.collegeCode.toLowerCase()) : true;
        const mathesCollegeName = searchRcds.collegeName ? apiDataRec.collegeName.toLowerCase().includes(searchRcds.collegeName.toLowerCase()) : true;
        const matchesCollegeType = searchRcds.collegeType ? apiDataRec.collegeTypeCode === searchRcds.collegeType : true;
        const matchesIsActive = searchRcds.isActive ? apiDataRec.isActive === searchRcds.isActive : true;

        return matchesCollegeCode && mathesCollegeName && matchesCollegeType && matchesIsActive;

      }).map((item, sno) => ({
        serialNo: sno + 1,     
        collegeType: item.collegeType,  
        collegeCode: item.collegeCode, 
        collegeName: item.collegeName,  
        isActive: item.isActive,   
        capacity: item.capacity,   
        id: item.id,
      }));

    setApiData(filteredData);
    setIsOpen(false);
  };

  const resetTable = () => {
    setrefreshAGGrid(true);
    setTableHeader(columnDefs);
    setApiData(rowData);
    setSelectedValues([]);
  };
  ///////////////////////////////////*************shortcuts**********////////////////////////////////////////////////////////

  useKeyboardShortcut(
    "S",
    (e) => {
      handleCreate(e);
    },
    { ctrl: true }
  );

  useKeyboardShortcut(
    "R",
    () => {
      setReloadTableFlag(true);
      resetTable();

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

  ////////////////////////////////////////********Code for add remove headers********/////////////////////////////////////////////////////

  const [customModalIsOpen, setCustomModelIsOpen] = React.useState(false);

  function openModal() {
    setCustomModelIsOpen(true);
  }

  const [selectedValues, setSelectedValues] = useState([]);

  useEffect(() => {
    columnDefs;
  }, []);

  return (
    <>
      <div className="rightArea">
        <div className="container-fluid px-1">
          <Breadcrumbs />
        </div>

        <div className="container-body mx-3 mb-2">

          <form action="" className="mb-5">
            <div className="card">
              <div className="card-body">
                <div className="row mb-3">

                  <div className="col-md-4">
                    <FormText
                    autofocus={true}
                      label={data.pcName}
                      name={data.collegeCode}
                      holder={data.pcHolder}
                      value={rcds[data.collegeCode]}
                      errorMessage={errorMessages.collegeCode} // Pass the error message for roleName
                      onChange={handleChange}
                      icon={icon.user} // Example FontAwesome icon; change as needed
                      bdr="1px solid #ccc" // Border style
                      padds="0px" // Padding for the select input
                      Maxlength={data.maxClgCode}
                    />
                  </div>


                  <div className="col-md-4">
                    <FormText
                  
                      label={data.pName}
                      name={data.collegeName}
                      holder={data.pHolder}
                      value={rcds[data.collegeName]}
                      errorMessage={errorMessages.collegeName} // Pass the error message for mappedAlias
                      onChange={handleChange}
                      icon={icon.mapAlias} // Example FontAwesome icon; change as needed
                      bdr="1px solid #ccc" // Border style
                      padds="0px" // Padding for the select input
                      Maxlength={data.mAliasLength}
                    />
                  </div>
                  <div className="col-md-3 ms-lg-5">
                    <FormCheckbox
                   
                      label={data.isHeadQuarter}
                      name="isHeadquarter"
                      checked={rcds.isHeadquarter === "Y"} // Ensure this reflects the current state
                      onChange={(evt) => {
                        const { checked } = evt.target;
                        setRcds((prevState) => ({
                          ...prevState,
                          isHeadquarter: checked ? "Y" : "N", // Set "Y" or "N" based on the checkbox state
                        }));
                      }}
                      errorMessage={errorMessages.isHeadquarter}
                    />

                  </div>
                </div>

                <div className="row mb-3">



                  <div className="col-md-4">
                    <SelectComponent
                   
                      label={data.afName}
                      name="affiliationType"
                      selectedValue={rcds.affiliationType}
                      options={
                        affrcds
                      }

                      errorMessage={errorMessages.affiliationType}
                      onChange={handleChange}
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          affiliationType: value,
                        }))
                      }
                      icon={icon.default}

                    />

                  </div>
                  {rcds.isHeadquarter !== "Y" && (
                    <>

                      <div className="col-md-4">
                        <SelectComponent
                      
                          label={data.lPName}
                          name="collegeType"
                          value={rcds.collegeType}
                          options={
                            clgTypeRcds
                          }

                          errorMessage={errorMessages.collegeType}
                          onChange={handleChange}
                          onSelects={(value) =>
                            setRcds((prevState) => ({
                              ...prevState,
                              collegeType: value,
                            }))
                          }
                          icon={icon.house}
                          bdr="1px solid #ccc"
                          padds="0"
                        />
                      </div>
                      <div className="col-md-4">
                        <SelectComponent
                      
                          label={data.lcName}
                          name="collegeCategory"
                          selectedValue={rcds.collegeCategory}
                          options={clgCatgRcds}
                          errorMessage={errorMessages.collegeCategory}
                          onChange={handleChange}
                          onSelects={(value) =>
                            setRcds((prevState) => ({
                              ...prevState,
                              collegeCategory: value,
                            }))
                          }
                          icon={icon.house}
                          bdr="1px solid #ccc"
                          padds="0"
                        />
                      </div>
                    </>
                  )}

                </div>

                <div className="row mb-3">

                  <div className="col-md-4">
                    <FormText
                   
                      label={data.cpName}
                      name={data.contactPerson}
                      holder={data.cpHolder}
                      value={rcds[data.contactPerson]}
                      errorMessage={errorMessages.contactPerson} // Pass the error message for roleName
                      onChange={handleChange}
                      icon={icon.user} // Example FontAwesome icon; change as needed
                      Maxlength={10}
                    />
                  </div>

                  <div className="col-md-4">
                    <FormText
                  
                      label={data.mNumber}
                      name={data.mobile}
                      holder={data.mHoder}
                      value={rcds[data.mobile]}
                      errorMessage={errorMessages.mobile} // Pass the error message for mappedAlias
                      onChange={handleChange}
                      icon={icon.phone} // Example FontAwesome icon; change as needed
                      Maxlength={10}

                    />
                  </div>


                  <div className="col-md-4">
                    <FormText
                  
                      label={data.pNumber}
                      name={data.phone}
                      holder={data.pHolderNum}
                      value={rcds[data.phone]}
                      errorMessage={errorMessages.phone} // Pass the error message for roleName
                      onChange={handleChange}
                      icon={icon.phone} // Example FontAwesome icon; change as needed
                      Maxlength={10}
                    />
                  </div>

                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <FormText
                 
                      label={data.emailLB}
                      name={data.email}
                      holder={data.eHolder}
                      value={rcds[data.email]}
                      errorMessage={errorMessages.email} // Pass the error message for mappedAlias
                      onChange={handleChange}
                      icon={icon.user} // Example FontAwesome icon; change as needed
                      bdr="1px solid #ccc" // Border style
                      padds="0px" // Padding for the select input
                    // Maxlength={data.mAliasLength}
                    />
                  </div>

                  <div className="col-md-4">
                    <FormText
                
                      label={data.aName}
                      name={data.address}
                      holder={data.aHolder}
                      value={rcds[data.address]}
                      errorMessage={errorMessages.address}
                      onChange={handleChange}
                      icon={icon.house}
                      bdr="1px solid #ccc"
                      padds="0px"
                    />
                  </div>
                  <div className="col-md-4">
                    <FormText
                  
                      label={data.wName}
                      name={data.website}
                      holder={data.wHolder}
                      value={rcds[data.website]}
                      errorMessage={errorMessages.website}
                      onChange={handleChange}
                      icon={icon.magnifyingglass}
                      bdr="1px solid #ccc"
                      padds="0px"
                    />
                  </div>

                </div>



                <div className="row mb-3">

                  <div className="col-md-4">
                    <FormText
                   
                      label={data.tName}
                      name={data.tehsil}
                      holder={data.tHolder}
                      value={rcds[data.tehsil]}
                      errorMessage={errorMessages.tehsil} // Pass the error message for roleName
                      onChange={handleChange}

                      icon={icon.location} // Example FontAwesome icon; change as needed
                      bdr="1px solid #ccc" // Border style
                      padds="0px" // Padding for the select input
                    />
                  </div>


                  <div className="col-md-4">
                    <FormText
                  
                      label={data.bName}
                      name={data.block}
                      holder={data.bHolder}
                      value={rcds[data.block]}
                      errorMessage={errorMessages.block} // Pass the error message for mappedAlias
                      onChange={handleChange}
                      icon={icon.location} // Example FontAwesome icon; change as needed
                      bdr="1px solid #ccc" // Border style
                      padds="0px" // Padding for the select input
                    // Maxlength={data.mAliasLength}
                    />
                  </div>

                  <div className="col-md-4">
                    <FormText

                      label={data.cName}
                      name={data.capacity}
                      holder={data.cHolder}
                      value={rcds[data.capacity]}
                      errorMessage={errorMessages.capacity} // Pass the error message for roleName
                      onChange={handleChange}
                      icon={icon.default} // Example FontAwesome icon; change as needed
                      bdr="1px solid #ccc" // Border style
                      padds="0px" // Padding for the select input
                    />
                  </div>

                </div>


                <div className="row mb-3">




                  <div className="col-md-4">
                    <FormText
                  
                      label={data.dsName}
                      name={data.displayName}
                      holder={data.dsHolder}
                      value={rcds[data.displayName]}
                      errorMessage={errorMessages.displayName} // Pass the error message for mappedAlias
                      onChange={handleChange}
                      icon={icon.default} // Example FontAwesome icon; change as needed
                      bdr="1px solid #ccc" // Border style
                      padds="0px" // Padding for the select input
                    // Maxlength={data.mAliasLength}
                    />
                  </div>


                  <div className="col-md-4">
                    <FormText
                   
                      label={data.plName}
                      name={data.place}
                      holder={data.plHolder}
                      value={rcds[data.place]}
                      errorMessage={errorMessages.place} // Pass the error message for roleName
                      onChange={handleChange}
                      icon={icon.location} // Example FontAwesome icon; change as needed
                      bdr="1px solid #ccc" // Border style
                      padds="0px" // Padding for the select input
                      Maxlength={data.maxPlace}
                    />
                  </div>


                  <div className="col-md-4">
                    <FormText
                 
                      label={data.dName}
                      name={data.district}
                      holder={data.dHolder}
                      value={rcds[data.district]}
                      errorMessage={errorMessages.district}
                      onChange={handleChange}
                      icon={icon.location}
                      bdr="1px solid #ccc"
                      padds="0px"

                    />
                  </div>
                </div>

                <div className="row mb-3">

                  <div className="col-md-4">

                    <FormCheckbox
                  
                      name="isGovernment"
                      label={data.gName}
                      checked={rcds.isGovernment === "Y"}
                      onChange={(evt) => {
                        const { checked } = evt.target;
                        setRcds((prevState) => ({
                          ...prevState,
                          isGovernment: checked ? "Y" : "N", // Set to "Y" if checked, else "N"
                        }));
                      }}

                      errorMessage={errorMessages.isGovernment}
                    />

                  </div>


                  <div className="col-md-4">
                    <FormCheckbox
                  
                      name="isActive"
                      checked={rcds.isActive === "Y"} 
                      onChange={(evt) => {
                        if (evt && evt.target) {
                          const { checked } = evt.target; 
                          setRcds((prevState) => ({
                            ...prevState,
                            isActive: checked ? "Y" : "N", 
                          }));
                        }
                      }}
                      label="isActive" 
                      errorMessage={errorMessages.isActive} 
                    />
                  </div>



                  <div className="col-md-4">


                    <FormRadio

                      label="Education Type"
                      name="educationType"
                      options={[
                        { label: "Co-education", value: "coeducation" },
                        { label: "Girls Only", value: "girls" },
                      ]}
                      value={rcds.educationType}
                      onChange={(evt) => {
                        setRcds((prevState) => ({
                          ...prevState,
                          educationType: evt.target.value, 
                        }));
                      }}
                      errorMessage={errorMessages.educationType}
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
                        showUpdate={!!rcds.id}
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
            <ErrorMessageABD
              text={errorDivMessage}
              isSuccess={errorType}
              isVisible={errorVisibleComponent}
              setVisible={setErrorMessageVisibleComponent}
            />
        )}

        <div className="container-body mx-3 mb-3">
          <p className="h6 card-title list-header">
            {" "}
            <small>
              {" "}
              List of College/Location <span className="parenthesis">(</span>s
              <span className="parenthesis">)</span>
            </small>
          </p>

          <div
            className="refresh-table "
            aria-label="" data-bs-toggle="tooltip" data-bs-placement="auto" title={`Refresh Data`}
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
                      <FormText
                      autofocus={true}
                        label={data.pcName}
                        name={data.collegeCode}
                        holder={data.pcHolder}
                        value={searchRcds[data.collegeCode]}
                       
                        onChange={handleSearchChange}
                        icon={icon.user} 
                        Maxlength={10}
                      />
                    </div>

                    <div className="col-md-4">
                      <FormText
                        label={data.pName}
                        name={data.collegeName}
                        holder={data.pHolder}
                        value={searchRcds[data.collegeName]}
                        onChange={handleSearchChange}
                        icon={icon.user}
                        Maxlength={10}
                      />
                    </div>

                    <div className="col-md-4">
                      <SelectComponent
                   
                        label={data.lPName}
                        name={data.collegeType}
                        selectedValue={searchRcds.collegeType}
                        resetValue={resetSelect}
                        onSelects={(value) =>

                          setSearchRcds((prevState) => ({
                            ...prevState,
                            collegeType: value,
                          }))
                        }
                        icon={icon.arrowDown} 
                        options={clgTypeRcds}
                      />
                    </div>

                    <div className="col-md-4">
                      <SelectComponent 
                        label={data.afName}
                        name={data.affiliationType}
                        selectedValue={searchRcds.affiliationType}
                        resetValue={resetSelect}
                        onSelects={(value) =>
                          setSearchRcds((prevState) => ({
                            ...prevState,
                            affiliationType: value,
                          }))
                        }
                        icon={icon.arrowDown} 
                        options={affrcds} 
                      />
                    </div>

                    <div className="col-md-4">
                      <SelectComponent 
                        label={data.lcName}
                        name={data.collegeCategory}
                        selectedValue={searchRcds.collegeCategory}
                        resetValue={resetSelect}
                        onSelects={(value) =>
                          setSearchRcds((prevState) => ({
                            ...prevState,
                            collegeCategory: value,
                          }))
                        }
                      
                        icon={icon.arrowDown} 
                        options={clgCatgRcds}
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
                        options={
                          [
                            { value: "Y", label: "Yes" },
                            { value: "N", label: "No" },
                          ]
                        } 
                      />
                    </div>

                    <div className="col-md-4">
                      <SelectComponent
                        label={data.isUniv}
                        name={data.isUniv}
                        selectedValue={searchRcds.isUniv}
                        resetValue={resetSelect}
                        onSelects={(value) =>
                          setSearchRcds((prevState) => ({
                            ...prevState,
                            isUniv: value,
                          }))
                        }
                      
                        icon={icon.arrowDown} 
                        options={
                          [
                            { value: "Y", label: "Yes" },
                            { value: "N", label: "No" },
                          ]
                        }
                      />
                    </div>
                  </div>

                  <div className="row mb-3 offset-4">
                    <div className="col-md-6">
                      <button className="me-1 btn btn-primary btn-sm btn-color"
                        onClick={filterTableData}
                      >Search</button>
                      <button className="btn btn-warning btn-color btn-sm  ms-2"
                        onClick={
                          () => {
                            setSearchRcds({
                              isUniv: "",
                              isActive: "",
                              collegeName: "",
                              collegeCode: "",
                              collegeCategory: "",
                              collegeType: "",
                              affiliationType: "",
                            })
                            resetTable();
                          }
                        }
                      >Reset</button>
                    </div>
                  </div>
                </div>
              </div>
            </AdvanceSearchModal>

            <div
              className={`d-flex align-items-center p-2 border rounded-3 addRemoveButtoninCustomModal ${selectedValues.length === 0 ? "" : "addRemoveButtonHighlight"
                }`}
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
                      columnDefsApi={columnDefs}
                      setTableHeader={setTableHeader}
                      selectedValues={selectedValues}
                      setSelectedValues={setSelectedValues}
                    />
                  </div>
                </div>
              </div>
            </CustomModal>

            {/* </i> */}
            <AgGridTable
              rowData={apiData}
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

export default LocationProfileMaster;

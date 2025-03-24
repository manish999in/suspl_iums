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
  getDataApi,
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
    userName: "",
    location: "",
    ddo: "",
    locatDdo: "",
    locatDdoId: "",
    empCode: "",
    empName: "",
    dynamicValue: "",
    fatherName: "",
    department: "",
    designation: "",
    departmentId: "",
    designationId: "",
    email: "",
    password: "",
    loginId: "",
    isBackOffice: "N",
    isEmployeePortal: "",
    isActive: "",
    expiryDate: "",
    role: "",
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
    secretKey
  } = useContext(GlobalContext);

  const [userTypeRcds, setUserypeRcds] = useState([{ value: "", label: "" }]);

  const saveButtonRef = useRef(null);

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
    uName: "User Type",
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
    roleLable: "Role",
    expiryLable: "Expiry Date",
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
    collegeLocationLable : "College/Location",
    ddoLable :"DDO",
    EmpNameLable:"Employee Name",
    EmpCodeLable:"Employee Code",

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

    setRcds({
      userTypeId: "",
      userType: "EM",
      userName: "",
      location: "",
      ddo: "",
      locatDdo: "",
      locatDdoId: "",
      empCode: "",
      empName: "",
      dynamicValue: "",
      fatherName: "",
      department: "",
      designation: "",
      departmentId: "",
      designationId: "",
      email: "",
      password: "",
      loginId: "",
      isBackOffice: "N",
      isEmployeePortal: "",
      isActive: "",
      expiryDate: "",
      role: "",
    });
  };

  const handleReset = () => {
    setRcds({
      userTypeId: "",
      userType: "EM",
      userName: "",
      location: "",
      ddo: "",
      locatDdo: "",
      locatDdoId: "",
      empCode: "",
      empName: "",
      dynamicValue: "",
      fatherName: "",
      department: "",
      designation: "",
      departmentId: "",
      designationId: "",
      email: "",
      password: "",
      loginId: "",
      isBackOffice: "N",
      isEmployeePortal: "",
      isActive: "",
      expiryDate: "",
      role: "",
    });

    setErrorMessages("");
  };

  const handleChange = (evt) => {

    const { name, value, type, checked } = evt.target;

    setRcds((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    }));


    setErrorMessages((prevErrors) => ({
      ...prevErrors,
      [name]: "",
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
    if (!rcds.dynamicValue) errors.dynamicValue = "Employee is required";
    if (!rcds.email) errors.email = "Login Id is required";
    if (!rcds.password) errors.password = "Password is required";
    if (!rcds.expiryDate) errors.expiryDate = "Expiry Date is required";
    if (!rcds.role) errors.role = "Role is required";
    return errors;
  };

  const handleCreate = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      setLoading(false);
      return;
    }
    setShowSave(false)

    const updatedRcds = {
      ...rcds,
      userId: s_user.userId,
      publicIp: s_user.publicIp,
    };
    try {
      const ciphertext = encAESData(secretKey, updatedRcds);
      console.log("Encrypted Data: ", ciphertext);
      let responseData;
      console.log(rcds, "varun");

      if (rcds.userTypeId) {
        const response = await getUpdate("user", "userCreation", ciphertext);
        console.log("Update response from backend:", response.data);
        responseData = checkResponseStatus(response);

      } else {
        const response = await getSave("user", "userCreation", ciphertext);
        console.log("Response from backend:", response.data);
        responseData = checkResponseStatus(response);
        console.log(responseData);
      }

      setRcds({
        userTypeId: "",
        userType: "EM",
        userName: "",
        location: "",
        ddo: "",
        locatDdo: "",
        locatDdoId: "",
        empCode: "",
        empName: "",
        dynamicValue: "",
        fatherName: "",
        department: "",
        designation: "",
        departmentId: "",
        designationId: "",
        email: "",
        password: "",
        loginId: "",
        isBackOffice: "N",
        isEmployeePortal: "",
        isActive: "",
        expiryDate: "",
        role: "",
        userId: rcds.userId,
        publicIp: rcds.publicIp,
      });

      if (responseData) {
        if (responseData.rType === "Y") {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);
          console.log("Decrypted Data:", decryptedData);

          setErrorMessageVisibleComponent(true);
          setErrorType(true);
          setErrorDivMessage(responseData.rMessage);
          setShowSave(true)

          setTimeout(() => {
            setErrorMessageVisibleComponent(false);
            setErrorDivMessage("");

          }, 4000);
        } else {
          setErrorMessageVisibleComponent(true);
          setErrorDivMessage(responseData.rMessage);

          setShowSave(true);
          setTimeout(() => {
            setErrorMessageVisibleComponent(false);
            setErrorDivMessage("");
          }, 4000);

        }

        getData();
      }
    } catch (error) {
      console.error("Error during create/update : ", error);
    } finally {
      setLoading(false);
      deleteCooldown.current = false;
    }
  };

  const getData = async () => {
    try {
      const menuId = retrieveFromLocalStorage("activeMenuId");
      const ciphertext = encAESData(secretKey, { menuId });
      const response = await getList("user", "userCreation", ciphertext);

      console.log("Full response from backend:", response);
      const responseData = checkResponseStatus(response, "user");

      console.log(responseData);

      if (responseData.rType === "Y") {
        if (responseData.rData) {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);

          const header = JSON.parse(decryptedData.recData.header);

          let updatedData = [];
          if (decryptedData.recData.data) {
            const dataRec = JSON.parse(decryptedData.recData.data);

            console.log(dataRec,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            updatedData = dataRec.map((item, index) => ({
              ...item,
              serialNo: index + 1,
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
                whiteSpace: "normal",
                wordWrap: "break-word",
              },
              autoHeight: true,
            }));

          console.log(updatedHeader);

          setTimeout(() => {
            setTableData(updatedData);
            setColumnDefsApi(updatedHeader);
            setRowData(updatedData);
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


  const departmentQuery = {
    table: "department_mast",
    fields: "dept_Id,department",
    condition:
      "1=1",
    orderBy: "",
  };

  const getDepartmentDropDownData = async () => {
    try {
      getDropDown(
        departmentQuery,
        deptRcds,
        setDeptRcds,
        "common",
        secretKey
      );
    } catch {}
  };

  useEffect(() => {
    getDepartmentDropDownData();
  }, []);



   const locationQuery = {
          table: "leave_location_mast",
          fields: "location_code,location_name",
          condition: "1=1 ",
          orderBy: "",
      };

      const [locationRcds, setLocationRcds] = useState([{
        value:"", label :""
      }])
  
      const getLocationDropDownData = async () => {
          try {
              getDropDown(
                  locationQuery,
                  locationRcds,
                  setLocationRcds,
                  "common",
                  secretKey
              );
          } catch {
              console.log(error);
          }
      };
  
      useEffect(() => {
          getLocationDropDownData();
      }, []);
  
      const [DDORcds, setDDORcds] = useState([{ value: "", label: "" }]);
  
      const DDOQuery = {
          table: " ddo left join ddolocationmapping dlm on ddo.ddo_id = dlm.DDO_ID",
          fields: "DISTINCT ddo.ddo_id, ddo.DDONAME",
          condition: `dlm.LOCATION_CODE='${searchRcds.location}'`,
          orderBy: "",
      };
  
      const getDDODropDownData = async () => {
          console.log(DDOQuery);
          try {
              getDropDown(DDOQuery, DDORcds, setDDORcds, "common", secretKey);
          } catch {
              console.log(error);
          }
      };
  
      useEffect(() => {
          getDDODropDownData();
      }, [searchRcds.location]);


      const [employeeIdRcds, setEmployeeIdRcds] = useState([{
        value :"", label:""
      }])

  const dynamicQuery = {
    table: "vw_user_type_details",
    fields: "id,name",
    condition: `typ = '${rcds.userType}'`,
    orderBy: "",
  };

  const getDeptDropDownData = async () => {
    getDropDown(dynamicQuery, employeeIdRcds, setEmployeeIdRcds, "common", secretKey);
  };

  useEffect(() => {
    if (rcds.userType) {
      getDeptDropDownData();
    }
  }, [rcds.userType]);

  const locationDdoQuery = {
    table: "(SELECT concat(dlm.DDO_ID, '~', dlm.LOCATION_CODE, '~', dlm.id) locId, concat(l.LOCATION_NAME, '~', d.DDONAME) loclabel FROM ddo d,"
      + " leave_location_mast l, ddolocationmapping dlm  WHERE d.DDO_ID = dlm.DDO_ID AND l.LOCATION_CODE = dlm.LOCATION_CODE AND l.LOCATION_CODE = ( SELECT"
      + ` location FROM employee_mast WHERE employeeId = '${rcds.dynamicValue}')) as temp `,
    fields: "locId,loclabel",
    condition: `1=1`,
    orderBy: ""
  };

  const getLocationDdoDropDownData = async () => {
    getDropDown(locationDdoQuery, locationDdo, setLocationDdo, "common", secretKey);
  };


  useEffect(() => {
    if (rcds.locatDdo) {
      let ddoArray = '';
      let locationArray = '';
      let locatDDOId = '';


      const parts = rcds.locatDdo.split("~");
      ddoArray = parts[0];
      locationArray = parts[1];
      locatDDOId = parts[2];


      if (ddoArray.length > 0) {
        setRcds((prev) => ({
          ...prev,
          ddo: ddoArray,
          location: locationArray,
          locatDdoId: locatDDOId
        }));
      }
    }
  }, [rcds.locatDdo]);


  useEffect(() => {
    if (rcds.dynamicValue) {
      getLocationDdoDropDownData();
    }
  }, [rcds.dynamicValue]);

  const getUserTypeLabel = (userTypeId) => {
    const userType = userTypeRcds.find((item) => item.value === userTypeId);
    return userType ? userType.label : "";
  };

  const roleQuery = {

    table: "roles",
    fields: "ROLE_ID ,ROLE_NAME",
    condition:
      " 1=1",
    orderBy: "",
  };

  const [roleDropDown, setRolesDropDown] = useState([{
    value: "",
    lable: ""
  }]);

  const getRolesDropDown = async () => {
    getDropDown(roleQuery, roleDropDown, setRolesDropDown, "common", secretKey);
  };


  useEffect(() => {
    if (rcds.isBackOffice == "Y") {
      getRolesDropDown();
    }
    else if (rcds.isBackOffice == "N") {
      setRolesDropDown([{ value: "D", label: "Default" }])
    }
  }, [rcds.isBackOffice])

  const getDetails = async () => {
    const query = `select employeeCode,employeeName,(select department from department_mast where dept_id = em.department),fatherName,(select designation from designation_mast where DESIGNATION_ID = em.designation),email,em.department,em.designation from employee_mast em where employeeId = '${rcds.dynamicValue}'`;
    const ciphertext = encAESData(secretKey, { query });
    const response = await getDataApi("commonData", false, ciphertext, "user");
    const responseData = checkResponseStatus(response, "user");


    if (responseData.rData) {
      const recJson = JSON.parse(responseData.rData);
      const decryptedData = decAESData(secretKey, recJson);
      const employeeDetails = decryptedData.recData[0];

      setRcds((prev) => ({
        ...prev,
        empCode: employeeDetails[0],
        empName: employeeDetails[1],
        department: employeeDetails[2],
        fatherName: employeeDetails[3],
        designation: employeeDetails[4],
        email: employeeDetails[5],
        departmentId :employeeDetails[6],
        designationId :employeeDetails[7]
      }));
      // }

    }
  };


  useEffect(() => {
    getDetails();
  }, [rcds.dynamicValue]);


  const viewRecord = async (dynamicVlaue) => {
    try {
      deleteCooldown.current = true;
      setErrorMessages("");
      const ciphertext = encAESData(secretKey, dynamicVlaue);
      const response = await getViewRecord(
        "user",
        "userCreation",
        ciphertext
      );

      const responseData = checkResponseStatus(response);

      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);
        console.log("Decrypted Data:", decryptedData);
        const dataToRec = JSON.parse(decryptedData.recData);
        const dataToSet = dataToRec[0];

        console.log("dataToSet Data:", dataToSet);


        setRcds({
          userTypeId: dataToSet.userTypeId,
          userType: dataToSet.userType,
          userName: dataToSet.userName,
          location: dataToSet.location,
          ddo: dataToSet.ddo,
          locatDdo: dataToSet.locatDdoId,
          dynamicValue: dataToSet.empCode,
          password: dataToSet.password,
          designation: dataToSet.designation,
          expiryDate: dataToSet.expiryDate,
          role: dataToSet.role,
          isBackOffice: dataToSet.isBackOffice === "Y" ? "Y" : "N",
          isEmployeePortal: dataToSet.isEmployeePortal=== "Y" ? "Y" : "N",
          isActive: dataToSet.isActive === "Y" ? "Y" : "N",
          userId: s_user.userId,
          publicIp: s_user.publicIp,
        });
      }

    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  };

  const handleDelete = async (dynamicVlaue) => {

    setHighlightRow(true);
    deleteCooldown.current = true;
    setShowSave(false)
    setLoading(true);

    try {
      const ciphertext = encAESData(secretKey,dynamicVlaue);

      const response = await getDelete(
        "user",
        "userCreation",
        ciphertext
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

        }, 4000);
      } else {
        setErrorMessageVisibleComponent(true);
        setErrorType(false);
        setErrorDivMessage(response.data.rMessage);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    } finally {
      setLoading(false);

      setShowSave(true)

      setTimeout(() => {
        deleteCooldown.current = false;

      }, 4000);
      setHighlightRow(false);

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
              const id = { dynamicVlaue: params.data.dynamicVlaue };
              setHighlightRow(true);
              viewRecord(id)
                ;
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <FontAwesomeIcon icon={faEdit} className='icon-size' />
          </span>

          <span
            className={`manipulation-icon delete-color ${deleteCooldown.current ? 'disabled' : ''} mx-1`}
            onClick={() => {
              const confirmDelete = window.confirm("Are you sure you want to delete this record?");
              if (confirmDelete) {
                if (!deleteCooldown.current) {
                  const id = {dynamicVlaue:params.data.dynamicVlaue };
                  handleDelete(id);
                }
              }
            }}
            style={{
              pointerEvents: deleteCooldown.current ? 'none' : 'auto',
              opacity: deleteCooldown.current ? 0.5 : 1,
              cursor: deleteCooldown.current ? 'not-allowed' : 'pointer',
            }}
          >
            <FontAwesomeIcon icon={faTrash} className='icon-size' />
          </span>

        </>
      ),
      sortable: false,
      filter: false,
      cellClass: 'ag-center-cols-cell',
      width: 100,
    },
  ];



  useEffect(() => {
    if (columnDefsApi && columnDefsApi.length > 0) {
      setTableHeader(columnDefs);
    }
  }, [columnDefsApi]);


  const filterTableData = () => {

    const filteredData = rowData
      .filter((apiDataRec) => {
        const matchesLocation = searchRcds.location ? apiDataRec.locationId === searchRcds.location : true;
        const matchesDepartment = searchRcds.department ? apiDataRec.departmentId === searchRcds.department : true;

        const matchesUserType = searchRcds.userType ? apiDataRec.userType === searchRcds.userType : true;

        const matchesEmployeeName = searchRcds.empName
          ? apiDataRec.empDetail.toLowerCase().includes(searchRcds.empName.toLowerCase())
          : true;

        const matchesddo = searchRcds.ddo ? apiDataRec.ddoId === searchRcds.ddo : true;

        const matchesEmpCode = searchRcds.empCode
          ? apiDataRec.empCode.toLowerCase().includes(searchRcds.empCode.toLowerCase())
          : true;

        const matchesIsActive = searchRcds.isActive ? apiDataRec.isActive === searchRcds.isActive : true;
        return matchesIsActive && matchesLocation && matchesDepartment && matchesEmployeeName && matchesUserType  && matchesddo && matchesEmpCode;
      })
      .map((item, sno) => ({
        serialNo: sno + 1,
        empCode: item.empCode,
        location : item.location,
        ddo: item.ddo,
        userName: item.userName,
        isActive: item.isActive,
        email: item.email,
        expiryDate : item.expiryDate,
        department : item.department,
        role : item.role
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
                      required= {true}
                      icon={icon.star}
                    />
                  </div>

                  <div className="col-md-6">
                    <SelectComponent
                      label={getUserTypeLabel(rcds.userType)}
                      name="dynamicValue"
                      selectedValue={rcds.dynamicValue}
                      options={employeeIdRcds}                                                
                      errorMessage={errorMessages.dynamicValue}
                      onChange={handleChange}
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          dynamicValue: value,
                        }))
                      }
                      required={true}
                      icon={icon.star}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <SelectComponent
                      label={data.lName}
                      name="locatDdo"
                      selectedValue={rcds.locatDdo}
                      options={locationDdo}
                      errorMessage={errorMessages.locatDdo}
                      onChange={handleChange}
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          locatDdo: value,
                        }))
                      }
                      required ={true}
                      icon={icon.star}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <FormText
                      label={`${getUserTypeLabel(rcds.userType)} Code`}
                      name="empCode"
                      value={rcds.empCode}
                      errorMessage={errorMessages.department}
                      holder={`${getUserTypeLabel(rcds.userType)} Code `}
                      onChange={handleChange}
                      icon={icon.star}
                      disabled={true}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormText
                      label={`${getUserTypeLabel(rcds.userType)} Name `}
                      name="empName"
                      value={rcds.empName}
                      holder={`${getUserTypeLabel(rcds.userType)} Name `}
                      errorMessage={errorMessages.empName}
                      onChange={handleChange}
                      icon={icon.star}
                      disabled={true}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <FormText
                      label={data.dName}
                      name="department"
                      value={rcds.department}
                      holder={data.dHolder}
                      errorMessage={errorMessages.department}
                      onChange={handleChange}
                      icon={icon.star}
                      disabled={true}
                    />
                  </div>


                  <div className="col-md-6">
                    <FormText
                      label={data.fName}
                      name="fatherName"
                      value={rcds.fatherName}
                      holder={data.fHolder}
                      errorMessage={errorMessages.fatherName}
                      onChange={handleChange}
                      icon={icon.star}
                      disabled={true}
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
                      disabled={true}
                    />
                  </div>


                  <div className="col-md-6">
                    <FormText
                      label={data.eName}
                      name="email"
                      value={rcds.email}
                      holder={data.eholder}
                      errorMessage={errorMessages.email}
                      onChange={handleChange}
                      icon={icon.star}
                      disabled={true}
                      required={true}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <FormText
                      label={data.idName}
                      name="email"
                      value={rcds.email}
                      holder={data.idholder}
                      errorMessage={errorMessages.email}
                      onChange={handleChange}
                      icon={icon.star}
                      
                    />
                  </div>

                  <div className="col-md-6">
                    <FormText
                      label={data.pName}
                      name="password"
                      value={rcds.password}
                      holder={data.pHolder}
                      errorMessage={errorMessages.password}
                      onChange={handleChange}
                      icon={icon.star}
                      required={true}
                    />
                  </div>
                </div>


                <div className="row mb-3">
                  <div className="col-md-6">
                    <FormText
                      type="Date"
                      label={data.expiryLable}
                      name="expiryDate"
                      value={rcds.expiryDate}
                      holder={data.idholder}
                      errorMessage={errorMessages.designation}
                      onChange={handleChange}
                      icon={icon.star}
                      required = {true}
                    />
                  </div>


                  <div className="col-md-6">
                    <SelectComponent
                      label={data.roleLable}
                      name="role"
                      selectedValue={rcds.role}
                      options={roleDropDown}
                      errorMessage={errorMessages.role}
                      onChange={handleChange}
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          role: value,
                        }))
                      }
                      required={true}
                      icon={icon.star}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <FormCheckbox
                      label={data.mrName}
                      name="isBackOffice"
                      checked={rcds.isBackOffice === "Y"}
                      onChange={(evt) => {
                        if (evt && evt.target) {
                          const { checked } = evt.target;
                          setRcds((prevState) => ({
                            ...prevState,
                            isBackOffice: checked ? "Y" : "N",
                          }));
                        }
                      }}

                      iconClass={icon.star}
                      errorMessage={errorMessages.isActive}
                    />
                  </div>


                  <div className="col-md-2">
                    <FormCheckbox
                      label={data.epName}
                      name="isEmployeePortal"
                      checked={rcds.isEmployeePortal === "Y"}
                      onChange={(evt) => {
                        if (evt && evt.target) {
                          const { checked } = evt.target;
                          setRcds((prevState) => ({
                            ...prevState,
                            isEmployeePortal: checked ? "Y" : "N",
                          }));
                        }
                      }}

                      iconClass={icon.star}
                      errorMessage={errorMessages.isActive}
                    />
                  </div>
                </div>

                <div className="row mb-3">

                  <div className="col-md-6">
                    <FormCheckbox
                      label={data.isActive}
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

                      iconClass={icon.star}
                      errorMessage={errorMessages.isActive}
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
            <ErrorMessageABD
              text={errorDivMessage}
              isSuccess={errorType}
              isVisible={errorVisibleComponent}
              setVisible={setErrorMessageVisibleComponent} // Pass the function to reset visibility
            />
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
                    <div className="col-md-6">
                      <SelectComponent
                        autofocus={true}
                        label={data.collegeLocationLable}
                        name="location"
                        selectedValue={searchRcds.location}
                        resetValue={resetSelect}
                        onSelects={(value) =>
                          setSearchRcds((prevState) => ({
                            ...prevState,
                            location: value,
                          }))
                        }
                        icon={icon.arrowDown}
                        options={locationRcds}
                      
                      />
                    </div>

                    <div className="col-md-6">

                    <SelectComponent
                      label={data.ddoLable}
                      name="ddo"
                      selectedValue={searchRcds.ddo}
                      options={DDORcds}
                      onChange={handleChange}
                      onSelects={(value) =>
                        setSearchRcds((prevState) => ({
                          ...prevState,
                          ddo: value,
                        }))
                      }
                      icon={icon.star}
                    />
                    </div>

                    <div className="col-md-6">
                      <SelectComponent
                        label={data.uName}
                        name="userType"
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

                    <div className="col-md-6">
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
                    <div className="col-md-6">
                    <FormText
                        label={data.EmpNameLable}
                        name="empName"
                        holder={data.dsHolder}
                        value={searchRcds.empName}

                        onChange={handleSearchChange}
                        icon={icon.user}

                      />
                    </div>

                    <div className="col-md-6">
                    <FormText
                        label={data.EmpCodeLable}
                        name="empCode"
                        holder={data.dsHolder}
                        value={searchRcds.empCode}

                        onChange={handleSearchChange}
                        icon={icon.user}

                      />
                      
                    </div>
                    <div className="col-md-6">
                      <SelectComponent
                        label={data.isActive}
                        name="isActive"
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

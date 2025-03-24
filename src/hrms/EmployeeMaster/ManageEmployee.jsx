import React, { useContext, useEffect, useRef, useState } from "react";
import Breadcrumbs from "../../components/Breadcrumbs";
import icon from "../../properties/icon";
import FormText from "../../components/FormText";
import SelectComponent from "../../components/SelectComponent";
import AgGridTable from "../../components/AgGridTable";
import "../../styles/inputStyle.css";
import { EmployeeContextProvider } from "../../context/EmployeeMaster/EmployeeMasterContext";
import CreateEmployee from "./CreateEmployee";
import { GlobalContext } from "../../context/GlobalContextProvider";
import CustomModal from "../../components/CustomModal";
import FilterTags from "../../components/FilterTags";
import "../../styles/createAndManageEmployee.css";
import { retrieveFromLocalStorage } from "../../utils/CryptoUtils";
import {
  getDataApi,
  getDelete,
  getDropDown,
  getList,
  getViewRecord,
} from "../../utils/api";
import useCheckResponseStatus from "../../hooks/useCheckResponseStatus";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import useKeyboardShortcut from "../../hooks/useKeyboardShortcut";
import EmployeeManagementPage from "./EmployeeManagementPage";
import ErrorMessageABD from "../../components/ErrorMessageABD";

function ManageEmployee() {
  const [errorVisibleComponent, setErrorMessageVisibleComponent] =
    useState(false);
  const [errorType, setErrorType] = useState();
  const [errorDivMessage, setErrorDivMessage] = useState("");

  const [locationRcds, setLocationRcds] = useState([{ value: "", label: "" }]);
  const [ddoRcds, setDdoRcds] = useState([{ value: "", label: "" }]);
  const [employeeCodeRcds, setEmployeeCodeRcds] = useState([
    { value: "", label: "" },
  ]);
  const [designationRcds, setdesignationRcds] = useState([
    { value: "", label: "" },
  ]);
  const [departmentRcds, setDepartmentRcds] = useState([
    { value: "", label: "" },
  ]);
  const [disciplineRcds, setdisciplineRcds] = useState([
    { value: "", label: "" },
  ]);
  const [fundTypeRcds, setFundTypeRcds] = useState([{ value: "", label: "" }]);
  const [natureTypeRcds, setNatureRcds] = useState([{ value: "", label: "" }]);
  const [gradeRcds, setGradeRcds] = useState([{ value: "", label: "" }]);
  const [payLevelRcds, setPayLevelRcds] = useState([{ value: "", label: "" }]);
  const [classRcds, setClassRcds] = useState([{ value: "", label: "" }]);
  const [categoryRcds, setCategoryRcds] = useState([{ value: "", label: "" }]);
  const [stateRcds, setStateRcds] = useState([{ value: "", label: "" }]);
  const [selectedValues, setSelectedValues] = useState([]);
  const { checkResponseStatus } = useCheckResponseStatus();
  const [isVisible, setIsVisible] = useState(true); // For table visibility
  const [isDivVisible, setIsDivVisible] = useState(true); // For form visibility
  const [isBackContentVisible, setIsBackContentVisible] = useState(false); // For the back content visibility
  const deleteCooldown = useRef(false);
  const [customModalIsOpen, setCustomModelIsOpen] = React.useState(false);
  const {
    secretKey,
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
    customModalIsOpen2,
    setCustomModelIsOpen2,
  } = useContext(GlobalContext);
  const [rcds, setRcds] = useState({
    locationId: "",
    ddoId: "",
    employeeCode: "",
    employeeManualCode: "",
    employeeName: "",
    departmentId: "",
    designationId: "",
    fundTypeId: "",
    disciplineId: "",
    employeeLeftStatus: "",
    categoryId: "",
    classId: "",
    groupId: "",
    stateId: "",
    payLevelId: "",
    natureTypeId: "",
  });

  const [viewRecordData, setViewRecordData] = useState([]);

  const handleChange = (evt) => {
    const { name, value, type, checked } = evt.target;
    setRcds((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    }));
  };
  const handleReset = () => {
    setRcds({
      locationId: "",
      ddoId: "",
      employeeCode: "",
      employeeManualCode: "",
      employeeName: "",
      departmentId: "",
      designationId: "",
      fundTypeId: "",
      disciplineId: "",
      employeeLeftStatus: "",
      categoryId: "",
      classId: "",
      groupId: "",
      stateId: "",
      payLevelId: "",
      natureTypeId: "",
    });

    setReloadTableFlag(true);

    // After 3 seconds, set the reload flag to false to hide the spinner
    setTimeout(() => {
      setReloadTableFlag(false);
    }, 600);

    // Reset the table (assuming resetTable is defined elsewhere)
    resetTable();
  };
  // Function to toggle the visibility of the form and table
  const toggleDiv = () => {
    setIsVisible(!isVisible); //
  };

  // Function to toggle the visibility of the main form and show back content
  const toggleDivVisibility = () => {
    setIsDivVisible(true); // Show the main form when "New" is clicked
    setIsVisible(false); // Hide the table when "New" is clicked
    setIsBackContentVisible(true); // Show back content view when needed
  };

  const handleBackButtonClick = () => {
    setReloadTableFlag(true);
    resetTable(); // Now `e` is available here

    // After 3 seconds, set the reload flag to false to hide the spinner
    setTimeout(() => {
      setReloadTableFlag(false);
    }, 600);
    setViewRecordData([]);
    deleteCooldown.current = false;
    setIsVisible(true);
    setIsDivVisible(true); // Show the main form again
    setIsBackContentVisible(false); // Hide the back content
  };

  const getData = async () => {
    try {
      const menuId = retrieveFromLocalStorage("activeMenuId");
      const ciphertext = encAESData(secretKey, { menuId });
      const response = await getList("hrms", "employeeMaster", ciphertext,"user");
      const responseData = checkResponseStatus(response,"user");
      if (responseData.rType === "Y") {
        if (responseData.rData) {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);
          const header = JSON.parse(decryptedData.recData.header);
          let updatedData = [];
          if (decryptedData.recData.data) {
            const dataRec = JSON.parse(decryptedData.recData.data);
            updatedData = dataRec.map((item, index) => ({
              ...item,
              serialNo: index + 1, // Auto-increment serialNo
            }));
          }
          const updatedHeader = header
            .sort((a, b) => {
              if (a.order_by < b.order_by) return -1; // a comes before b if a.order_by is less than b.order_by
              if (a.order_by > b.order_by) return 1; // b comes before a if a.order_by is greater than b.order_by
              return 0; // if both are equal, no change in order
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
  useEffect(() => {
    getData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  useEffect(() => {
    // changes
    resetTable();
  }, []);

  const handleDelete = async (employeeId) => {
    deleteCooldown.current = true;

    try {
      const ciphertext = encAESData(secretKey, { employeeId });

      // Send the delete request to the backend
      const response = await getDelete("hrms", "employeeMaster", ciphertext);

      const responseData = checkResponseStatus(response);

      if (responseData.rData) {
        const jsonData = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, jsonData);
      } else {
        console.error("encryptData is undefined in the backend response.");
      }

      if (responseData.rType === "Y") {
        // Update state or show success message
        setErrorMessageVisibleComponent(true);
        setErrorType(true);
        setErrorDivMessage(responseData.rMessage);

        // Automatically hide the message after it has been shown
        setTimeout(() => {
          setErrorMessageVisibleComponent(false);
          setErrorDivMessage("");
        }, 4000); // Adjust time as needed

        setTableData((prevTableData) => {
          const newData = prevTableData.filter((item) => item.employeeId !== employeeId);
          const updatedTableData = newData.map((item, index) => ({
            ...item,
            serialNo: index + 1, // Recalculate serialNo
          }));
          setRowData(updatedTableData); // Ensure both state updates are in sync
          return updatedTableData; // Return updated data to be set for tableData
          console.log("UpdatedTableData: ", updatedTableData);

        });
      } else {
        setErrorMessageVisibleComponent(true);
        setErrorType(false);
        setErrorDivMessage(response.data.rMessage);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    } finally {
      deleteCooldown.current = false;

      setTimeout(() => {
        setErrorMessageVisibleComponent(false);
        setErrorDivMessage("");
      }, 4000);
      setHighlightRow(false); //changes
    }
  };

  const locationQuery = {
    table: "leave_location_mast",
    fields: "location_code,location_name",
    condition: "1=1",
    orderBy: "",
  };
  const ddoQuery = {
    table: "ddo left join ddolocationmapping dlm on ddo.ddo_id = dlm.DDO_ID",
    fields: "DISTINCT ddo.ddo_id, ddo.DDONAME",
    condition: `dlm.LOCATION_CODE='${rcds.locationId}'`,
    orderBy: "",
  };

  const employeeCodeQuery = {
    table: "employee_mast as b",
    fields:
      "b.employeeCode,(SELECT CONCAT(a.employeeName, ' ', a.employeeCode) FROM employee_mast AS a WHERE a.employeeId = b.employeeId) AS employeeDetails",
    condition: `b.ddo = '${rcds.ddoId}' and b.location = '${rcds.locationId}'`,
    orderBy: "",
  };

  const designationQuery = {
    table: "designation_mast",
    fields: "DESIGNATION_ID,DESIGNATION",
    condition: "1=1",
    orderBy: " ",
  };

  const demparmentQuery = {
    table: "department_mast",
    fields: "DEPT_ID,DEPARTMENT",
    condition: "1=1",
    orderBy: "",
  };
  const disciplineQuery = {
    table: "discipline_mast",
    fields: "DISC_ID,DISCIPLINE",
    condition: "1=1",
    orderBy: " ",
  };
  const fundTypeQuery = {
    table: "fund_type_master",
    fields: "fund_type_id,description",
    condition: "1=1",
    orderBy: "order by fund_type_order",
  };
  const natureTypeQuery = {
    table: "nature_mast",
    fields: "NATURE_ID,NATURE",
    condition: "1=1",
    orderBy: " ",
  };

  const gradeMasterQuery = {
    table: "grade_mast",
    fields: "GRADE_ID,GRADE_NAME",
    condition: "1=1",
    orderBy: " ",
  };
  const gradeDetailsQuery = {
    table: "grade_details ",
    fields: "GD_ID, BASIC_FROM",
    condition: "1=1",
    orderBy: "",
  };
  const classQuery = {
    table: "class_mast ",
    fields: "CLASS_ID, CLASS",
    condition: "1=1",
    orderBy: "",
  };

  const categoryQuery = {
    table: "category_mast ",
    fields: "CATEGORY_ID, CATEGORY",
    condition: "1=1",
    orderBy: "",
  };

  const stateQuery = {
    table: "state_mast ",
    fields: "STATE_ID, STATE",
    condition: "1=1",
    orderBy: "",
  };
  const getEmployeeDetails = async () => {
    const query = `select employeeCodeM,employeeName,designation,department,discipline,natureType,EmployeeLeftStatus,category,classType,grade,paylevel,state,fundType from employee_mast where employeeCode = '${rcds.employeeCode}'`;
    const ciphertext = encAESData(secretKey, { query });
    const response = await getDataApi("commonData", false, ciphertext, "user");
    const responseData = checkResponseStatus(response, "user");

    if (responseData.rData) {
      const recJson = JSON.parse(responseData.rData);
      const decryptedData = decAESData(secretKey, recJson);
      const employeeDetails = decryptedData.recData[0];
      let i = 0;
      setRcds((prev) => ({
        ...prev,
        // employeeManualCode: employeeDetails[0],
        // employeeName: employeeDetails[1],
        // designationId: employeeDetails[2],
        // departmentId: employeeDetails[3],
        // disciplineId: employeeDetails[4],
        // natureTypeId: employeeDetails[5],
        // employeeLeftStatus: employeeDetails[6],
        // categoryId: employeeDetails[7],
        // classId: employeeDetails[8],
        // groupId: employeeDetails[9],
        // payLevelId: employeeDetails[10],
        // stateId: employeeDetails[11],
        // fundTypeId: employeeDetails[12]

        employeeManualCode: employeeDetails[i++],
        employeeName: employeeDetails[i++],
        designationId: employeeDetails[i++],
        departmentId: employeeDetails[i++],
        disciplineId: employeeDetails[i++],
        natureTypeId: employeeDetails[i++],
        employeeLeftStatus: employeeDetails[i++],
        categoryId: employeeDetails[i++],
        classId: employeeDetails[i++],
        groupId: employeeDetails[i++],
        payLevelId: employeeDetails[i++],
        stateId: employeeDetails[i++],
        fundTypeId: employeeDetails[i++],
      }));
    }
  };

  const getDdoDropdownData = async () => {
    getDropDown(ddoQuery, ddoRcds, setDdoRcds, "common", secretKey, "user");
  };

  const getLocationDropDownData = async () => {
    getDropDown(
      locationQuery,
      locationRcds,
      setLocationRcds,
      "common",
      secretKey,
      "user"
    );
  };

  const getEmployeeCodeAndName = async () => {
    getDropDown(
      employeeCodeQuery,
      employeeCodeRcds,
      setEmployeeCodeRcds,
      "common",
      secretKey,
      "user"
    );
  };

  const getDesignationDropdown = async () => {
    getDropDown(
      designationQuery,
      designationRcds,
      setdesignationRcds,
      "common",
      secretKey,
      "user"
    );
  };

  const getDepartmentDropdownData = async () => {
    getDropDown(
      demparmentQuery,
      departmentRcds,
      setDepartmentRcds,
      "common",
      secretKey,
      "user"
    );
  };

  const getDisciplineDropDown = async () => {
    getDropDown(
      disciplineQuery,
      disciplineRcds,
      setdisciplineRcds,
      "common",
      secretKey,
      "user"
    );
  };

  const getFundTypeDropdown = async () => {
    getDropDown(
      fundTypeQuery,
      fundTypeRcds,
      setFundTypeRcds,
      "budget",
      secretKey,
      "budget"
    );
  };

  const getNatureTypeDropDown = async () => {
    getDropDown(
      natureTypeQuery,
      natureTypeRcds,
      setNatureRcds,
      "common",
      secretKey,
      "user"
    );
  };
  const getGradeMasterDropdown = async () => {
    getDropDown(
      gradeMasterQuery,
      gradeRcds,
      setGradeRcds,
      "common",
      secretKey,
      "user"
    );
  };
  const getGradeDetailsDropdown = async () => {
    getDropDown(
      gradeDetailsQuery,
      payLevelRcds,
      setPayLevelRcds,
      "common",
      secretKey,
      "user"
    );
  };
  const getClassMastDropdown = async () => {
    getDropDown(
      classQuery,
      classRcds,
      setClassRcds,
      "common",
      secretKey,
      "user"
    );
  };
  const getCategroyDropdown = async () => {
    getDropDown(categoryQuery, categoryRcds, setCategoryRcds, "common", secretKey, "user");
  };

  const getStateDropdown = async () => {
    getDropDown(stateQuery, stateRcds, setStateRcds, "common", secretKey, "user");
  };
  const employeeLeftStatus = [
    { value: "Y", label: "Yes" },
    { value: "N", label: "No" },
  ];
  useEffect(() => {
    getEmployeeDetails();
  }, [rcds.employeeCode]);

  useEffect(() => {
    getEmployeeCodeAndName();
  }, [rcds.locationId, rcds.ddoId]);

  useEffect(() => {
    getDdoDropdownData();
  }, [rcds.locationId]);

  useEffect(() => {
    getStateDropdown();
    getCategroyDropdown();
    getClassMastDropdown();
    getGradeDetailsDropdown();
    getGradeMasterDropdown();
    getNatureTypeDropDown();
    getFundTypeDropdown();
    getDisciplineDropDown();
    getDepartmentDropdownData();
    getDesignationDropdown();
    getLocationDropDownData();
  }, []);

  const columnDefs = [
    {
      headerName: "Serial No.",
      field: "serialNo",
      sortable: true,
      // filter: "agNumberColumnFilter",
      // flex: 1,
      width: 100,
      // headerClass: "ag-header-cell", // Optional: add custom header class
      cellStyle: { textAlign: "center" },
      // pinned: "left",
      // movable: false,
    },

    ...columnDefsApi,
    {
      headerName: "Action",
      field: "button",
      cellRenderer: (params) => (
        <>
          <span
            // tabIndex={1}
            className="manipulation-icon edit-color mx-3"
            onClick={() => {
              const id = params.data.employeeId; // Access the row data to get the roleId
              setHighlightRow(true);
              viewRecord(id); // Call viewRecord function with the id
            }}
          >
            <FontAwesomeIcon icon={faEdit} className="icon-size" />
          </span>

          <span
            // tabIndex={1}
            className={`manipulation-icon delete-color ${deleteCooldown.current ? "disabled" : ""
              } mx-1`}
            onClick={() => {
              setHighlightRow(true);
              if (!deleteCooldown.current) {
                setHighlightRow(true); //changes
                // Show confirmation alert
                const confirmDelete = window.confirm(
                  "Are you sure you want to delete this record?"
                );
                if (confirmDelete) {
                  setHighlightRow(true); //changes
                  const id = params.data.employeeId; // Access row data to get the salId
                  handleDelete(id); // Call the handleDelete function with the salId
                  setHighlightRow(false); //changes
                } else {
                  setHighlightRow(false);
                }
              }
            }}
            style={{
              pointerEvents: deleteCooldown.current ? "none" : "auto", // Disable click
              opacity: deleteCooldown.current ? 0.5 : 1, // Make it visually dim when disabled
              cursor: deleteCooldown.current ? "not-allowed" : "pointer", // Change cursor to indicate disabled state
            }}
          >
            <FontAwesomeIcon icon={faTrash} className="icon-size" />
          </span>
        </>
      ),
      sortable: false,
      filter: false, // No filtering for actions columns
      cellStyle: { textAlign: "center" },
      width: 100,
      // pinned: "right",
      // movable: false,
    },
  ];

  //////////////////////////**** new header format *///////////////////////////////////

  useEffect(() => {
    if (columnDefsApi && columnDefsApi.length > 0) {
      setTableHeader(columnDefs);
    }
  }, [columnDefsApi]);

  ///////////////////////////////////********Code for add remove headers********/////////////////////////////////////////////////////

  function openModal() {
    setCustomModelIsOpen(true);
  }

  const filterTableData = () => {    
    setIsVisible(true);
    const filteredData = rowData
      .filter((apiDataRec) => {
        const matchesLocation = rcds.locationId ? apiDataRec.locationId === rcds.locationId: true;
        const matchesDdo = rcds.ddoId ? apiDataRec.ddoId === rcds.ddoId : true;
        const matchesEmployeeCode = rcds.employeeCode
          ? apiDataRec.empCode
            .toLowerCase()
            .includes(rcds.employeeCode.toLowerCase())
          : true;
        const matchesEmployeeMunnalCode = rcds.employeeManualCode
          ? apiDataRec.empManualCode
            .toLowerCase()
            .includes(rcds.employeeManualCode.toLowerCase())
          : true;
        const matchesEmployeeName = rcds.employeeName.trim()
          ? apiDataRec.empName &&
          apiDataRec.empName
            .toLowerCase()
            .includes(rcds.employeeName.trim().toLowerCase())
          : true;
        const matchesDepartment = rcds.departmentId
          ? apiDataRec.departmentId === rcds.departmentId
          : true;
        const matchesNatureType = rcds.natureTypeId
          ? apiDataRec.natureTypeId === rcds.natureTypeId
          : true;
        const matchesEmployeeLeftStatus = rcds.employeeLeftStatus
          ? apiDataRec.employeeLeftStatus === rcds.employeeLeftStatus
          : true;
        const matchesCategory = rcds.categoryId
          ? apiDataRec.categoryId === rcds.categoryId
          : true;
        const matchesDesignation = rcds.designationId
          ? apiDataRec.designationId === rcds.designationId
          : true;
        const matchesDiscipline = rcds.disciplineId
          ? apiDataRec.disciplineId === rcds.disciplineId
          : true;
        const matchesClass = rcds.classId
          ? apiDataRec.classId === rcds.classId
          : true;
        const matchesGroup = rcds.groupId
          ? apiDataRec.entryGroupId === rcds.groupId
          : true;
        const matchesPayLevel = rcds.payLevelId
          ? String(apiDataRec.paylevelId) === rcds.payLevelId
          : true;
        const matchesState = rcds.stateId
          ? apiDataRec.stateId === rcds.stateId
          : true;
        return (
          matchesLocation &&
          matchesState &&
          matchesGroup &&
          matchesPayLevel &&
          matchesClass &&
          matchesCategory &&
          matchesEmployeeLeftStatus &&
          matchesNatureType &&
          matchesDepartment &&
          matchesDesignation &&
          matchesDiscipline &&
          matchesDdo &&
          matchesEmployeeCode &&
          matchesEmployeeMunnalCode &&
          matchesEmployeeName
        );
      })
      .map((item, index) => ({
        serialNo: index + 1,
        employeeId: item.employeeId,
        empCode: item.empCode,
        empName: item.empName,
        empManualCode: item.empManualCode,
        location: item.location,
        department: item.department,
        designation: item.designation,
        discipline: item.discipline,
        pfType: item.pfType,
        dateOfJoining: item.dateOfJoining,
      }));
    setTableData(filteredData);
  };
  const resetTable = () => {
    setTableData(
      rowData.map((item, sno) => ({
        serialNo: sno + 1,
        empCode: item.empCode,
        empName: item.empName,
        empManualCode: item.empManualCode,
        location: item.location,
        department: item.department,
        designation: item.designation,
        discipline: item.discipline,
        pfType: item.pfType,
        dateOfJoining: item.dateOfJoining,
        employeeId: item.employeeId,
      }))
    );
    setRcds({
      locationId: "",
      ddoId: "",
      employeeCode: "",
      employeeManualCode: "",
      employeeName: "",
      departmentId: "",
      designationId: "",
      fundTypeId: "",
      disciplineId: "",
      employeeLeftStatus: "",
      categoryId: "",
      classId: "",
      groupId: "",
      stateId: "",
      payLevelId: "",
      natureTypeId: "",
    });
    setrefreshAGGrid(true);
    setSelectedValues([]);
    setTableHeader(columnDefs);
  };

  useEffect(() => {
    console.log("Row Data: ", rowData);
    console.log("Table Data: ", tableData);

  }, [])
  const viewRecord = async (employeeId) => {
    deleteCooldown.current = true;
    console.log(employeeId);
    try {
      const ciphertext = encAESData(secretKey, { employeeId });
      const response = await getViewRecord(
        "hrms",
        "employeeMaster",
        ciphertext
      );
      const responseData = response.data;

      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);
        const dataToRec = JSON.parse(decryptedData.recData);
        console.log("View Records: ", dataToRec);

        setViewRecordData(dataToRec);

        setIsVisible(false);
        setIsDivVisible(false);
        setIsBackContentVisible(true);

        console.log("setViewRecordData: ", viewRecordData);
      } else {
        console.error("encryptData is undefined in the backend response.");
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  };

  useKeyboardShortcut(
    "R",
    () => {
      // Pass the event to the callback
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

  useKeyboardShortcut(
    "N",
    () => {
      toggleDivVisibility();
    },
    { alt: true }
  );

  return (
    <>
      {/* Main Form View */}
      {isDivVisible && !isBackContentVisible && (
        <div className="rightArea">
          <div className="container-fluid px-1">
            <Breadcrumbs />
          </div>
          <div className="container-body mx-3 mb-3">
            <div className="card rounded-3">
              <div className="card-body px-4 py-2">
                <h5 className="text-center mb-1">Other Details</h5>
              </div>
              <form className="px-4">
                <div className="row g-1">
                  <div className="col-md-4">
                    <SelectComponent
                      label="Location"
                      name="locations"
                      holder="Select Location"
                      selectedValue={rcds.locationId}
                      options={locationRcds}
                      onChange
                      icon={icon.arrowDown} // Example icon class for FontAwesome
                      size="small"
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          locationId: value,
                        }))
                      }
                    />
                  </div>

                  <div className="col-md-4">
                    <SelectComponent
                      label="DDO"
                      name="ddo"
                      holder="Select DDO"
                      selectedValue={rcds.ddoId}
                      options={ddoRcds}
                      errorMessage=""
                      icon={icon.arrowDown}
                      size="small"
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          ddoId: value,
                        }))
                      }
                    />
                  </div>

                  <div className="col-md-4">
                    <SelectComponent
                      label="Employee Code"
                      name="employeeCode"
                      holder="Select Employee Code"
                      selectedValue={rcds.employeeCode}
                      errorMessage=""
                      icon={icon.arrowDown}
                      options={employeeCodeRcds}
                      size="small"
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          employeeCode: value,
                        }))
                      }
                    />
                  </div>

                  <div className="col-md-4">
                    <FormText
                      label="Employee Code(M)"
                      name="employeeManualCode"
                      holder="Employee Code(M)"
                      value={rcds.employeeManualCode}
                      onChange={handleChange}
                      icon={icon.user}
                      Maxlength="25"
                    />
                  </div>

                  <div className="col-md-4">
                    <FormText
                      label="Employee Name"
                      name="employeeName"
                      holder="Employee Name"
                      value={rcds.employeeName}
                      onChange={handleChange}
                      icon={icon.arrowDown}
                      size="small"
                    />
                  </div>

                  <div className="col-md-4">
                    <SelectComponent
                      label="Designation"
                      name="designation"
                      holder="Select Designation"
                      options={designationRcds}
                      icon={icon.mapAlias}
                      Maxlength="25"
                      selectedValue={rcds.designationId}
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          designationId: value,
                        }))
                      }
                    />
                  </div>

                  <div className="col-md-4">
                    <SelectComponent
                      label="Department"
                      name="department"
                      holder="Select Department"
                      selectedValue={rcds.departmentId}
                      options={departmentRcds}
                      icon={icon.arrowDown}
                      size="small"
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          departmentId: value,
                        }))
                      }
                    />
                  </div>

                  <div className="col-md-4">
                    <SelectComponent
                      label="Discipline"
                      name="discipline"
                      holder="Select Discipline"
                      selectedValue={rcds.disciplineId}
                      options={disciplineRcds}
                      icon={icon.arrowDown}
                      size="small"
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          disciplineId: value,
                        }))
                      }
                    />
                  </div>

                  <div className="col-md-4">
                    <SelectComponent
                      label="State"
                      name="state"
                      holder="Select State"
                      selectedValue={rcds.stateId}
                      options={stateRcds}
                      icon={icon.arrowDown}
                      size="small"
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          stateId: value,
                        }))
                      }
                    />
                  </div>

                  <div className="col-md-4">
                    <SelectComponent
                      label="Nature Type"
                      name="natureType"
                      holder="Select Nature Type"
                      selectedValue={rcds.natureTypeId}
                      options={natureTypeRcds}
                      icon={icon.arrowDown}
                      size="small"
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          natureTypeId: value,
                        }))
                      }
                    />
                  </div>

                  <div className="col-md-4">
                    <SelectComponent
                      label="Employee Left Status"
                      name="employeeLeftStatus"
                      holder="Select Employee Left Status"
                      selectedValue={rcds.employeeLeftStatus}
                      options={employeeLeftStatus}
                      icon={icon.arrowDown}
                      size="small"
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          employeeLeftStatus: value,
                        }))
                      }
                    />
                  </div>

                  <div className="col-md-4">
                    <SelectComponent
                      label="Category"
                      name="categroy"
                      holder="Select Categroy"
                      selectedValue={rcds.categoryId}
                      options={categoryRcds}
                      icon={icon.arrowDown}
                      size="small"
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          categoryId: value,
                        }))
                      }
                    />
                  </div>

                  <div className="col-md-4">
                    <SelectComponent
                      label="Class"
                      name="class"
                      holder="Select Class"
                      selectedValue={rcds.classId}
                      options={classRcds}
                      icon={icon.arrowDown}
                      size="small"
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          classId: value,
                        }))
                      }
                    />
                  </div>

                  <div className="col-md-4">
                    <SelectComponent
                      label="Group"
                      name="group"
                      holder="Select Group"
                      selectedValue={rcds.groupId}
                      options={gradeRcds}
                      icon={icon.arrowDown}
                      size="small"
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          groupId: value,
                        }))
                      }
                    />
                  </div>

                  <div className="col-md-4">
                    <SelectComponent
                      label="Pay Level"
                      name="payLevel"
                      holder="Select PayLevel"
                      selectedValue={rcds.payLevelId}
                      options={payLevelRcds}
                      icon={icon.arrowDown}
                      size="small"
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          payLevelId: value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-start mt-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm me-2"
                    onClick={filterTableData}
                  >
                    <i className="fa fa-arrow-down me-2"></i> Search
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm me-2"
                    onClick={toggleDivVisibility}
                    aria-label="Create Employee"
                    data-bs-toggle="tooltip"
                    data-bs-placement="auto"
                    title="Create Employee (Alt + N)"
                  >
                    <i className="fa fa-plus me-2"></i> New
                  </button>

                  <button
                    type="button"
                    className="btn btn-warning btn-sm"
                    onClick={handleReset}
                  >
                    <i className="fa fa-refresh me-2"></i> Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Role Details View (Table) */}
      {isVisible && (
        <div className="container-body mx-3 mb-3">
          <p className="h6 card-title list-header">
            {" "}
            <small>
              {" "}
              List of Employee detail<span className="parenthesis">(</span>s
              <span className="parenthesis">)</span>
            </small>
          </p>

          <div
            className="refresh-table "
            aria-label=""
            data-bs-toggle="tooltip"
            data-bs-placement="auto"
            title={`Refresh Data`}
            onClick={(e) => {
              e.preventDefault();
              // Set the reload flag to true to show the spinner
              setReloadTableFlag(true);

              // After 3 seconds, set the reload flag to false to hide the spinner
              setTimeout(() => {
                setReloadTableFlag(false);
              }, 600);

              // Reset the table (assuming resetTable is defined elsewhere)
              resetTable();
            }}
          >
            {reloadTableFlag ? (
              <div className="spinner-border text-primary" role="status"></div>
            ) : (
              <i className={`${icon.refresh} text-primary`}></i>
            )}
          </div>

          <div className="ag-theme-alpine">
            <div
              className={`d-flex align-items-center p-2 border rounded-3 addRemoveButtoninEmployeeMaster ${selectedValues.length === 0 ? "" : "addRemoveButtonHighlight"
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
      )}
      {isBackContentVisible && (
        <>
          <EmployeeContextProvider
            viewRecordData={viewRecordData}
            setViewRecordData={setViewRecordData}
          >
            <CreateEmployee
              toggleDiv={toggleDiv}
              handleBackButtonClick={handleBackButtonClick}
            />
          </EmployeeContextProvider>
        </>
      )}
      <CustomModal
        width="70%"
        left="55%"
        top="40%"
        setIsOpen={setCustomModelIsOpen2}
        modalIsOpen={customModalIsOpen2}
        header="Page Details"
      >
        <EmployeeManagementPage />
      </CustomModal>
      {errorVisibleComponent && (
        <ErrorMessageABD
          text={errorDivMessage}
          isSuccess={errorType}
          isVisible={errorVisibleComponent}
          setVisible={setErrorMessageVisibleComponent}
        />
      )}
    </>
  );
}

export default ManageEmployee;

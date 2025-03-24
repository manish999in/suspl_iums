import React, { useState, useEffect, useRef, useContext } from "react";
import "../styles/inputStyle.css";
import FormText from "../components/FormText";
import FormTextarea from "../components/FormTextarea";
import FormButton from "../components/FormButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../styles/AdvancedSearch.css";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import ErrorMessageABD from "../components/ErrorMessageABD";
import AdvanceSearchModal from "../components/AdvanceSearchModal";
import SelectComponent from "../components/SelectComponent";

import {
  retrieveFromCookies,
  retrieveFromLocalStorage,
} from "../utils/CryptoUtils";

import {
  getDelete,
  getDropDown,
  getList,
  getSave,
  getUpdate,
  getViewRecord,
} from "../utils/api";
import AgGridTable from "../components/AgGridTable";
import Breadcrumbs from "../components/Breadcrumbs";
import icon from "../properties/icon";
import FormCheckbox from "../components/FormCheckbox";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import CustomModal from "../components/CustomModal";
import { GlobalContext } from "../context/GlobalContextProvider";
import FilterTags from "../components/FilterTags";

const BudgetHeadCodeMaster = () => {
  const [modalIsOpen, setIsOpen] = React.useState(false);

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

  const [resetSelect, setResetSelect] = useState(false);

  const deleteCooldown = useRef(false);
  const [errorVisibleComponent, setErrorMessageVisibleComponent] =
    useState(false);
  const [errorType, setErrorType] = useState();
  const [isEditing, setIsEditing] = useState(false); // state initaialize

  const [errorDivMessage, setErrorDivMessage] = useState("");

  const [, setS_UserId] = useState({
    userId: "",
    publicIp: "",
  });

  const secretKey = retrieveFromCookies("AESDecKey");

  const saveButtonRef = useRef(null); // Reference for the Save button

  const [searchRcds, setSearchRcds] = useState({
    govermentHeadMaster: "",
    fundType: "",
    fundCategory: "",
    budgetHeadType: "",
    isActive: "",
    selectIfUsedInPension: "",
    budgetHeadCode: ""
  });
  const [showSave, setShowSave] = useState(true);
  const [loading, setLoading] = useState(false); // Loading state
  const [fundCategoryRcds, setFundCategoryRcds] = useState([
    { value: "", label: "" },
  ]);
  const [fundTypeRcds, setFundTypRcds] = useState([{ value: "", label: "" }]);
  const [govermentHeadMaster, setgovermentHeadMaster] = useState([
    { value: "", label: "" },
  ]);
  const [budgetTypeRcds, setBudgetTypeRcds] = useState([

    { value: "Inc", label: "Income" },
    { value: "Exp", label: "Expence" },

  ]);
  const [affrcds, setaffrcds] = useState([
    { value: "Y", label: "yes" },
    { value: "N", label: "no" },
  ]);
  const { checkResponseStatus } = useCheckResponseStatus();
  const [rcds, setRcds] = useState({
    govermentHeadMaster: "",
    fundType: "",
    fundCategory: "",
    budgetHeadCode: "",
    budgetHeadCodeDescription: "",
    budgetHeadType: "",
    selectIfUsedInPension: "",
    isActive: "",
    remarks: "",
    budgetHeadId: "",
  });
  const data = {
    govermentHeadMaster: "Government Budget Head",
    fundType: "Fund Type",
    fundCategory: "Fund Category",
    budgetHeadCode: "Budget Head Code",
    BudgetHeadCode: "budgetHeadCode",
    budgetHeadCodeDescription: "Budget Head Code Description",
    BudgetHeadCodeDescription: "budgetHeadCodeDescription",
    budgetHeadType: "Budget Head Type",
    BudgetHeadType: "budgetHeadType",
    selectIfUsedInPension: "Select If Used In Pension",
    isActive: "Is Active",
    remarks: "Remarks",
    Remarks: "remarks",
    remarksHolder: "Enter Remarks",
    save: "Save",
    delete: "Delete",
    update: "Update",
    back: "Back",
    reset: "Reset",
  };

  const [errorMessages, setErrorMessages] = useState({
    govermentHeadMaster: "",
    fundType: "",
    fundCategory: "",
    budgetHeadCode: "",
    budgetHeadCodeDescription: "",
    budgetHeadType: "",
  });

  const handleBack = () => {
    setHighlightRow(false); // changes

    deleteCooldown.current = false;
    if (saveButtonRef.current) {
      saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // Alternatively, clear form data and reset state if needed
    setRcds({
      govermentHeadMaster: "",
      fundType: "",
      fundCategory: "",
      budgetHeadCode: "",
      budgetHeadCodeDescription: "",
      budgetHeadType: "",
      selectIfUsedInPension: "",
      isActive: "",
      remarks: "",
      budgetHeadId: "",
    });

    setResetSelect(true); // for dropdown search

    setIsEditing(false);
  };

  const handleReset = () => {
    // Reset rcds to its initial state
    setRcds({
      govermentHeadMaster: "",
      fundType: "",
      fundCategory: "",
      budgetHeadCode: "",
      budgetHeadCodeDescription: "",
      budgetHeadType: "",
      selectIfUsedInPension: "",
      isActive: "",
      remarks: "",
      budgetHeadId: "",
    });
    setResetSelect(true); // for dropdown search
    setErrorMessages("");
  };

  const handleChange = (evt) => {
    const { name, value, type, checked } = evt.target;
    setRcds((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
      // selectIfUsedInPension: rcds.selectIfUsedInPension === "Y" ? checked : !checked, // Proper ternary operation
    }));

    // Remove the error for the current field while typing
    setErrorMessages((prevErrors) => ({
      ...prevErrors,
      [name]: "", // Clear error message for the current field
    }));
  };

  const handleSearchChange = (evt) => {
    const { name, value, type, checked } = evt.target;
    setSearchRcds((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // get dropdown only for single data table

  const validateFields = () => {
    const errors = {};

    if (!rcds.budgetHeadCodeDescription)
      errors.budgetHeadCodeDescription = "Please Enter budgetHeadCodeDescription";
    if (!rcds.budgetHeadType)
      errors.budgetHeadType = "Please Enter budgetHeadType";
    if (!rcds.fundCategory) errors.fundCategory = "Please Enter fundCategory";
    if (!rcds.fundType) errors.fundType = "Please Enter fundType";
    if (!rcds.govermentHeadMaster)
      errors.govermentHeadMaster = "Please Enter govermentHeadMaster";
    return errors;
  };
  const fundCategoryDropdownData = {
    table: "fund_category_master",
    fields: "FUND_CATEGORY_ID,FUND_CATEGORY",
    condition: "1=1",
    orderBy: " ",
  };
  const getFundCategoryDropDownData = async () => {
    getDropDown(
      fundCategoryDropdownData,
      fundCategoryRcds,
      setFundCategoryRcds,
      "common",
      secretKey
    );
  };

  const fundTypeDropdownData = {
    table: "fund_type_master",
    fields: "FUND_TYPE_ID,DESCRIPTION",
    condition: "1=1",
    orderBy: " ",
  };
  const getFundTypeDropDownData = async () => {
    getDropDown(
      fundTypeDropdownData,
      fundTypeRcds,
      setFundTypRcds,
      "common",
      secretKey
    );
  };

  const [govBudHeadRcds, setGovBudHeadRcds] = useState([
    { value: "", label: "" },
  ]);
  const [govBudHeadRcds1, setGovBudHeadRcds1] = useState([
    { value: "", label: "" },
  ]);

  const govBudHeadQuery = {
    table: `govt_budget_head_master G JOIN major_head_master MH ON G.MAJOR_HEAD = MH.MAJOR_HEAD_ID
            JOIN sub_major_head_master SM ON G.SUB_MAJOR_HEAD = SM.SUB_MAJOR_HEAD_ID
            JOIN minor_head_master M ON G.MINOR_HEAD = M.MINOR_HEAD_ID
            JOIN sub_minor_head_master S ON G.SUB_MINOR_HEAD = S.SUB_MINOR_HEAD_ID`,

    fields:
      "G.GOVT_BUDGET_HEAD_ID, CONCAT('(', MH.MAJOR_HEAD_CODE, ') ', MH.MAJOR_HEAD_NAME,  '-', '(', SM.SUB_MAJOR_HEAD_CODE, ') ', SM.SUB_MAJOR_HEAD_NAME, '-', '(', M.MINOR_HEAD_CODE, ') ', M.MINOR_HEAD_NAME, '-', '(', S.SUB_MINOR_HEAD_CODE, ') ', S.SUB_MINOR_HEAD_NAME)",
    condition: "G.SUB_MINOR_HEAD != ''",
    orderBy: "",
  };


  const govBudHeadQueryADVANCE = {
    table: `govt_budget_head_master G JOIN major_head_master MH ON G.MAJOR_HEAD = MH.MAJOR_HEAD_ID
            JOIN sub_major_head_master SM ON G.SUB_MAJOR_HEAD = SM.SUB_MAJOR_HEAD_ID
            JOIN minor_head_master M ON G.MINOR_HEAD = M.MINOR_HEAD_ID
            JOIN sub_minor_head_master S ON G.SUB_MINOR_HEAD = S.SUB_MINOR_HEAD_ID`,

    fields:
      "G.GOVT_BUDGET_HEAD_ID, CONCAT(MH.MAJOR_HEAD_CODE, SM.SUB_MAJOR_HEAD_CODE, M.MINOR_HEAD_CODE,S.SUB_MINOR_HEAD_CODE)",
    condition: "G.SUB_MINOR_HEAD != ''",
    orderBy: "",
  };


  const getDropDownData1 = async () => {
    try {
      getDropDown(
        govBudHeadQueryADVANCE,
        govBudHeadRcds1,
        setGovBudHeadRcds1,
        "common",
        secretKey
      );
    } catch { }
  };





  const getDropDownData = async () => {
    try {
      getDropDown(
        govBudHeadQuery,
        govBudHeadRcds,
        setGovBudHeadRcds,
        "common",
        secretKey
      );
    } catch { }
  };

  useEffect(() => {
    getFundCategoryDropDownData();
    getFundTypeDropDownData();
    getDropDownData();
    getDropDownData1();
  }, []);

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
      is_active: rcds.isActive === "" ? "N" : "Y", // Correctly set is_active
    };


    try {
      // Encrypt the updated rcds with the userId
      const ciphertext = encAESData(secretKey, updatedRcds);

      let responseData;

      if (rcds.budgetHeadId) {
        // Update the existing record
        deleteCooldown.current = false;
        const response = await getUpdate(
          "budget",
          "BudgetHeadCodeMaster",
          ciphertext
        );
        responseData = checkResponseStatus(response);
      } else {
        // Send data to the backend
        const response = await getSave(
          "budget",
          "BudgetHeadCodeMaster",
          ciphertext
        );

        responseData = checkResponseStatus(response);
      }

      if (responseData) {
        // Check if the operation was successful
        if (responseData.rType === "Y") {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);
          // Clear the form fields by resetting rcds to its initial state
          setRcds({
            // Replace with your initial state for rcds
            govermentHeadMaster: "",
            fundType: "",
            fundCategory: "",
            budgetHeadCode: "",
            budgetHeadCodeDescription: "",
            budgetHeadType: "",
            selectIfUsedInPension: "",
            isActive: "",
            remarks: "",
            budgetHeadId: "",
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

  const viewRecord = async (budgetHeadId) => {


    deleteCooldown.current = true;
    try {
      setErrorMessages("");
      const ciphertext = encAESData(secretKey, { budgetHeadId });

      const response = await getViewRecord(
        "budget",
        "BudgetHeadCodeMaster",
        ciphertext
      );

      const responseData = checkResponseStatus(response);

      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);
        const dataToRec = JSON.parse(decryptedData.recData); // Assuming you want the first item
        const dataToSet = dataToRec;
        // Update rcds state with the decrypted data
        setRcds({
          budgetHeadId: dataToSet.budgetHeadId,
          govermentHeadMaster: dataToSet.govermentHeadMaster,
          fundType: dataToSet.FUND_TYPE_ID_TEMP,
          fundCategory: dataToSet.FUND_CATEGORY_ID_TEMP,
          budgetHeadCode: dataToSet.budgetHeadCode,
          budgetHeadCodeDescription: dataToSet.budgetHeadCodeDescription,
          selectIfUsedInPension: dataToSet.selectIfUsedInPension,
          budgetHeadType: dataToSet.budgetHeadType,
          isActive: dataToSet.isActive,
          remarks: dataToSet.remarks,
          createdBy: dataToSet.createdBy,
          modifiedBy: dataToSet.modifiedBy,
          userId: s_user.userId, // Use userId from s_userId
          publicIp: s_user.publicIp, // Use publicIp from s_userId
        });
      } else {
        console.error("encryptData is undefined in the backend response.");
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
    } finally {
    }
  };

  const handleDelete = async (budgetHeadId) => {
    deleteCooldown.current = true;
    setShowSave(false);
    setLoading(true); // Start loading state

    try {
      const ciphertext = encAESData(secretKey, { budgetHeadId });

      // Send the delete request to the backend
      const response = await getDelete(
        "budget",
        "BudgetHeadCodeMaster",
        ciphertext,
        {}
      );

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
        setShowSave(true);

        // Automatically hide the message after it has been shown
        setTimeout(() => {
          setErrorMessageVisibleComponent(false);
          setErrorDivMessage("");
        }, 4000); // Adjust time as needed

        let updatedData = rowData
          .filter((item) => item.budgetHeadId !== budgetHeadId)
          .map((item, index) => ({
            ...item,
            serialNo: index + 1, // Auto-increment serialNo
          }));

        setRowData(updatedData);
        setTableData(updatedData);
      } else {
        setErrorMessageVisibleComponent(true);
        setErrorType(false);
        setErrorDivMessage(response.data.rMessage);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    } finally {
      setLoading(false); // End loading state
      setShowSave(true);
      deleteCooldown.current = false;

      setTimeout(() => {
        setErrorMessageVisibleComponent(false);
        setErrorDivMessage("");
      }, 4000);
      setHighlightRow(false); //changes
    }
  };

  const getData = async () => {
    try {
      const menuId = retrieveFromLocalStorage("activeMenuId");
      // Encrypt the searchRcds data
      const ciphertext = encAESData(secretKey, { menuId });

      // Send request to get the list
      const response = await getList(
        "budget",
        "BudgetHeadCodeMaster",
        ciphertext,
        {}
      );

      const responseData = checkResponseStatus(response);
      if (responseData.rType === "Y") {
        if (responseData.rData) {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);
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
          setTimeout(() => {
            setTableData(updatedData); // for changing table data
            setColumnDefsApi(updatedHeader);
            setRowData(updatedData); // for globally keeping the Table data
          }, 500);
        }
      } else {
        const jsonData = JSON.parse(responseData.dropDown);
        const decryptedData = decAESData(secretKey, jsonData);
        setColumnDefsApi([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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


  //match kara raha ha kripa karka tushar aap yaha baitha 



  const filteredGovBudHeadRcds = govBudHeadRcds.filter((record) => {
    // Ensure tableData.govermentHeadMaster is an array before calling .some()
    return Array.isArray(tableData) && !tableData.some(
      (item) => item.govermentHeadMaster === record.value
    );
  });







  // function getBudgetHeadCodeByCondition() {
  //   // Find all entries where govermentHeadMaster matches the condition
  //   const result = tableData.filter(item => item.govermentHeadMaster === rcds.govermentHeadMaster);

  //   // Map to extract only the budgetHeadCode values
  //   const budgetHeadCodes = result.map(item => item.budgetHeadCode);

  //   return budgetHeadCodes; // Returns an array of matching budgetHeadCodes
  // }



  const handleBudgetHeadCode = () => {


    const result = govBudHeadRcds.filter(item => item.value == rcds.govermentHeadMaster);


    let extractedNumbers = extractNumbersWithLeadingZeros(result[0].label);
    let combinedNumber = combineNumbersWithLeadingZeros(extractedNumbers);

    // Map to extract only the budgetHeadCode values
    // const budgetHeadCodes = result.map(item => item.);


    return combinedNumber; // Returns an array of matching budgetHeadCodes
  }
  useEffect(() => {
    if (rcds.govermentHeadMaster) {
      const budgetHeadCodes = handleBudgetHeadCode();


      setRcds(prev => ({
        ...prev,
        budgetHeadCode: budgetHeadCodes, // Only update state once
      }));
    }
  }, [rcds.govermentHeadMaster]);

  function extractNumbersWithLeadingZeros(inputString) {
    // Regular expression to match numbers between parentheses, including leading zeros
    const regex = /\((\d{3})\)/g;
    let matches;
    let numbers = [];

    // Loop through all matches in the string
    while ((matches = regex.exec(inputString)) !== null) {
      numbers.push(matches[1]); // Store the matched number as a string
    }

    return numbers;
  }

  function combineNumbersWithLeadingZeros(numbers) {
    // Join the numbers into a single string
    return numbers.join('');
  }



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
      enableMenu: true,
      cellRenderer: (params) => (
        <>
          <span
            // tabIndex={1}
            className="manipulation-icon edit-color mx-3"
            onClick={() => {
              const id = params.data.budgetHeadId; // Access the row data to get the roleId
              setHighlightRow(true); //changes
              viewRecord(id); // Call viewRecord function with the id
              window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to the top
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
                  const id = params.data.budgetHeadId; // Access row data to get the salId
                  setHighlightRow(true); //changes
                  handleDelete(id); // Call the handleDelete function with the salId
                  setHighlightRow(false); //changes
                } else {
                  setHighlightRow(false); //changes
                }
              }
            }}
            style={{
              pointerEvents:
                isEditing || deleteCooldown.current ? "none" : "auto", // Disable click
              opacity: isEditing || deleteCooldown.current ? 0.5 : 1, // Make it visually dim when disabled
              cursor:
                isEditing || deleteCooldown.current ? "not-allowed" : "pointer", // Change cursor to indicate disabled state
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
        // Define filter conditions
        const matchesGovermentHeadMaster = searchRcds.govermentHeadMaster ? apiDataRec.govermentHeadMaster === searchRcds.govermentHeadMaster : true;
        const matchesFundType = searchRcds.fundType ? apiDataRec.FUND_TYPE_ID_TEMP.toLowerCase() === searchRcds.fundType.toLowerCase() : true;
        const matchesFundCategory = searchRcds.fundCategory ? apiDataRec.FUND_CATEGORY_ID_TEMP.toLowerCase() === searchRcds.fundCategory.toLowerCase() : true;
        const matchBudgetHeadCode = searchRcds.budgetHeadCode ? apiDataRec.budgetHeadCodeDescription.toLowerCase() === searchRcds.budgetHeadCode.toLowerCase() : true;
        const matchBudgetHeadType = searchRcds.budgetHeadType ? apiDataRec.budgetHeadType.toLowerCase() === searchRcds.budgetHeadType.toLowerCase() : true;
        const matchSelectPension = searchRcds.selectIfUsedInPension ? apiDataRec.selectIfUsedInPension.toLowerCase() === searchRcds.selectIfUsedInPension.toLowerCase() : true;
        const matchIsActive = searchRcds.isActive ? apiDataRec.isActive === searchRcds.isActive : true;
        return matchesFundType && matchIsActive && matchSelectPension && matchesGovermentHeadMaster && matchesFundCategory && matchBudgetHeadCode && matchBudgetHeadType;
      })
      .map((item, sno) => ({
        serialNo: sno + 1,
        GOVT_BUDGET_HEAD_NAME: item.GOVT_BUDGET_HEAD_NAME,
        fundType: item.fundType,
        fundCategory: item.fundCategory,
        budgetHeadType: item.budgetHeadType,
        isActive: item.isActive,
        selectIfUsedInPension: item.selectIfUsedInPension,
        budgetHeadCodeDescription: item.budgetHeadCodeDescription,
        budgetHeadCode: item.budgetHeadCode,
        budgetHeadId: item.budgetHeadId
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
      // Pass the event to the callback
      handleCreate(e); // Now `e` is available here
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

  const handleSelect = (values) => {
    setSelectedValues(values);
  };

  const newOptions = columnDefsApi.map((item) => ({
    value: item.headerName,
    label: item.headerName,
  }));

  function addRemoveColumns() {

    const newCustomHeader = columnDefs.filter((item) => {
      return !selectedValues.includes(item.headerName);
    });

    // Return the filtered column definitions
    setTableHeader(newCustomHeader);
  }

  useEffect(() => {
    addRemoveColumns();
  }, [selectedValues]);

  useEffect(() => {
    // changes
    resetTable();
  }, []);

  return (
    <>
      <div className="rightArea">
        <div className="container-fluid px-1">
          <Breadcrumbs />
        </div>
        <div className="container-body mx-3 mb-2">
          <form>
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
                      label={data.govermentHeadMaster}
                      name="affiliationType"
                      selectedValue={rcds.govermentHeadMaster}
                      options={filteredGovBudHeadRcds}
                      errorMessage={errorMessages.govermentHeadMaster}
                      onChange={handleChange}
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          govermentHeadMaster: value,
                        }))
                      }
                      icon={icon.default}
                      disable={rcds.budgetHeadId !== '' ? true : false}
                    />
                  </div>

                  <div className="col-md-6">
                    <SelectComponent
                      label={data.fundType}
                      name="affiliationType"
                      selectedValue={rcds.fundType}
                      options={fundTypeRcds}
                      errorMessage={errorMessages.fundType}
                      onChange={handleChange}
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          fundType: value,
                        }))
                      }
                      icon={icon.default}
                      disable={rcds.budgetHeadId !== '' ? true : false}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <SelectComponent
                      label={data.fundCategory}
                      name="affiliationType"
                      selectedValue={rcds.fundCategory}
                      options={fundCategoryRcds}
                      errorMessage={errorMessages.fundCategory}
                      onChange={handleChange}
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          fundCategory: value,
                        }))
                      }
                      icon={icon.default}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormText
                      label={data.budgetHeadCode}
                      name={data.BudgetHeadCode}
                      value={rcds[data.BudgetHeadCode]}
                      errorMessage={errorMessages.budgetHeadCode}
                      onChange={handleChange}
                      icon={icon.user}
                      bdr="1px solid #ccc"
                      padds="0px"
                      disable={true}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <FormText
                      label={data.budgetHeadCodeDescription}
                      name={data.BudgetHeadCodeDescription}
                      value={rcds[data.BudgetHeadCodeDescription]}
                      errorMessage={errorMessages.budgetHeadCodeDescription} // Pass the error message for roleName
                      onChange={handleChange}
                      icon={icon.user} // Example FontAwesome icon; change as needed
                      bdr="1px solid #ccc" // Border style
                      padds="0px" // Padding for the select input
                    />
                  </div>

                  <div className="col-md-6">
                    <SelectComponent
                      label={data.budgetHeadType}
                      name={data.budgetHeadType}
                      selectedValue={rcds.budgetHeadType}
                      options={budgetTypeRcds}
                      errorMessage={errorMessages.budgetHeadType}
                      onChange={handleChange}
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          budgetHeadType: value,
                        }))
                      }
                      icon={icon.default}
                      disable={rcds.budgetHeadId !== '' ? true : false}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <FormCheckbox
                      label={data.selectIfUsedInPension}
                      name={data.selectIfUsedInPension}
                      checked={rcds.selectIfUsedInPension === "Y"} // Ensure this reflects the current state
                      onChange={(evt) => {
                        const { checked } = evt.target;
                        setRcds((prevState) => ({
                          ...prevState,
                          selectIfUsedInPension: checked ? "Y" : "N", // Set "Y" or "N" based on the checkbox state
                        }));
                      }}
                    />
                  </div>

                  <div className="col-md-6">
                    <SelectComponent
                      label={data.isActive}
                      name={data.isActive}
                      selectedValue={rcds.isActive}
                      options={affrcds}
                      onChange={handleChange}
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          isActive: value,
                        }))
                      }
                      icon={icon.default}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <FormTextarea
                      holder={data.remarksHolder}
                      name={data.Remarks}
                      value={rcds[data.Remarks]}
                      onChange={handleChange}
                      Maxlength={250}
                      label={data.remarks}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    {showSave && (
                      <FormButton
                        btnType1={data.save}
                        btnType3={data.update}
                        btnType4={data.back}
                        btnType5={data.reset}
                        onClick={handleCreate}
                        onBack={handleBack}
                        onReset={handleReset}
                        showUpdate={!!rcds.budgetHeadId}
                        rcds={rcds}
                        loading={loading}
                      />
                    )}
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
              List of Budget Head Code Master
              <span className="parenthesis">(</span>s
              <span className="parenthesis">)</span>
            </small>
          </p>

          <div
            className="refresh-table "
            aria-label=""
            data-bs-toggle="tooltip"
            data-bs-placement="auto"
            title={`Refresh Table Data {Shift + R}`}
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
            <AdvanceSearchModal
              setSearchRcds={setSearchRcds}
              modalIsOpen={modalIsOpen}
              setIsOpen={setIsOpen}
            >
              <div className="card advanceSearchModal">
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <SelectComponent
                        label={data.govermentHeadMaster}
                        name="affiliationType"
                        selectedValue={rcds.govermentHeadMaster}
                        options={govBudHeadRcds}
                        errorMessage={errorMessages.govermentHeadMaster}
                        onChange={handleSearchChange}
                        onSelects={(value) =>
                          setSearchRcds((prevState) => ({
                            ...prevState,
                            govermentHeadMaster: value,
                          }))
                        }
                        icon={icon.default}
                        disable={rcds.budgetHeadId !== '' ? true : false}
                      />
                    </div>
                    <div className="col-md-6">
                      <SelectComponent
                        label={data.fundType}
                        name="affiliationType"
                        selectedValue={rcds.fundType}
                        options={fundTypeRcds}
                        errorMessage={errorMessages.fundType}
                        onChange={handleSearchChange}
                        onSelects={(value) =>
                          setSearchRcds((prevState) => ({
                            ...prevState,
                            fundType: value,
                          }))
                        }
                        icon={icon.default}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <SelectComponent
                        label={data.fundCategory}
                        name="affiliationType"
                        selectedValue={rcds.fundCategory}
                        options={fundCategoryRcds}
                        errorMessage={errorMessages.fundCategory}
                        onChange={handleSearchChange}
                        onSelects={(value) =>
                          setSearchRcds((prevState) => ({
                            ...prevState,
                            fundCategory: value,
                          }))
                        }
                        icon={icon.default}
                      />
                    </div>
                    <div className="col-md-6">
                      <FormText
                        label={data.budgetHeadCode}
                        name={data.BudgetHeadCode}
                        value={searchRcds[data.BudgetHeadCode]}
                        errorMessage={errorMessages.budgetHeadCode}
                        onChange={handleSearchChange}
                        icon={icon.user}
                        bdr="1px solid #ccc"
                        padds="0px"
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <SelectComponent
                        label={data.budgetHeadType}
                        name={data.budgetHeadType}
                        selectedValue={rcds.budgetHeadType}
                        options={budgetTypeRcds}
                        errorMessage={errorMessages.budgetHeadType}
                        onChange={handleSearchChange}
                        onSelects={(value) =>
                          setSearchRcds((prevState) => ({
                            ...prevState,
                            budgetHeadType: value,
                          }))
                        }
                        icon={icon.default}
                      />
                    </div>
                    <div className="col-md-6">
                      <SelectComponent
                        label="Is Used In Pension"
                        name={data.selectIfUsedInPension}
                        selectedValue={searchRcds.selectIfUsedInPension}
                        resetValue={resetSelect}
                        onChange={handleSearchChange}
                        onSelects={(value) =>
                          setSearchRcds((prevState) => ({
                            ...prevState,
                            selectIfUsedInPension: value,
                          }))
                        }
                        icon={icon.arrowDown} // Example icon class for FontAwesome
                        options={[
                          { value: "Y", label: "Yes" },
                          { value: "N", label: "No" },
                        ]}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <SelectComponent
                        label={data.isActive}
                        name={data.isActive}
                        selectedValue={rcds.isActive}
                        onChange={handleSearchChange}
                        onSelects={(value) =>
                          setSearchRcds((prevState) => ({
                            ...prevState,
                            isActive: value,
                          }))
                        }
                        options={[
                          { value: "Y", label: "Yes" },
                          { value: "N", label: "No" },
                        ]}
                        icon={icon.default}
                      />
                    </div>
                  </div>
                  <div className="row mb-3 offset-4">
                    <div className="col-md-6">
                      <button className="me-1 btn btn-primary bt-sm btn-color" onClick={filterTableData}>Search</button>
                      <button className="btn btn-warning bt-sm btn-color ms-2"
                        onClick={() => {
                          setSearchRcds({
                            govermentHeadMaster: "",
                            fundType: "",
                            fundCategory: "",
                            budgetHeadType: "",
                            isActive: "",
                            selectIfUsedInPension: "",
                            budgetHeadCode: ""
                          });
                          resetTable();
                        }}>
                        Reset
                      </button>
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

export default BudgetHeadCodeMaster;

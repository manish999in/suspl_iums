import React, { useContext, useEffect, useRef, useState } from "react";
import openBracket from "../../public/img/open-bracket.png";
import closeBracket from "../../public/img/close-bracket.png";
import "../styles/FormulaMaster.css";
import {
  FaSave,
  FaUndo,
  FaTimes,
  FaPlus,
  FaMinus,
  FaDivide,
  FaEquals,
  FaStar,
  FaPercent,
  FaCircle,
} from "react-icons/fa";
import Breadcrumbs from "../components/Breadcrumbs";
import { retrieveFromCookies, retrieveFromLocalStorage, storeInLocalStorage } from "../utils/CryptoUtils";
import AgGridTable from "../components/AgGridTable";
import FilterTags from "../components/FilterTags";
import ErrorMessageABD from "../components/ErrorMessageABD";
import { GlobalContext } from "../context/GlobalContextProvider";
import icon from "../properties/icon";
import AdvanceSearchModal from "../components/AdvanceSearchModal";
import FormText from "../components/FormText";
import FormButton from "../components/FormButton";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import CustomModal from "../components/CustomModal";
import FormMultiSelect from "../components/FormMultiSelect";
import FormDate from "../components/FormDate";
import FormTextarea from "../components/FormTextarea";

import {
  getDelete,
  getList,
  getSave,
  getUpdate,
  getViewRecord,
  getRecordByCount,
  getDataApi,
} from "../utils/api";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import DynamicTable from "../components/DynamicTable";

function FormulaMaster() {

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

  const secretKey = retrieveFromCookies("AESDecKey");
  let i = 0;


  const [errorVisibleComponent, setErrorMessageVisibleComponent] =
    useState(false);

  const [resetSelect, setResetSelect] = useState(false);
  const deleteCooldown = useRef(false);
  const detailTableRef = useRef(false);
  const [errorType, setErrorType] = useState();
  const [errorDivMessage, setErrorDivMessage] = useState("");
  const [showSave, setShowSave] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessages, setErrorMessages] = useState({
    id: "",
    lastClickedValue: "",
    hiddenFormula: "",
    description: "",
    formula: "",
    formulaId: "",
    order: "",
    effectiveDate: "",
  }); // handling error
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const { checkResponseStatus } = useCheckResponseStatus();


  const data = {
    descriptionName: "description",
    descriptionLabel: "Description",
    descriptionHolder: "Enter Description",
    formulaName: "formula",
    formulaLabel: "Formula",
    formulaHolder: "Create Formula",
    orderName: "order",
    orderLabel: "Order",
    orderHolder: "Enter Order",
    effectiveDateName: "effectiveDate",
    effectiveDateLabel: "Effective Date",
    effectiveDateHolder: "Select Effective Date",
    save: "Save",
    delete: "Delete",
    update: "Update",
    back: "Back",
    reset: "Reset"
  };

  const [rcds, setRcds] = useState({
    id: "",
    lastClickedValue: "",
    hiddenFormula: "",
    description: "",
    formula: "",
    formulaId: "",
    order: "",
    effectiveDate: "",
    userId: "", // Initial value will be updated in useEffect
    publicIp: "", // Initial value will be updated in useEffect
  });


  const [searchRcds, setSearchRcds] = useState({
    fundCategory: "",
    remarks: "",
  });

  const [loading, setLoading] = useState(false);

  const saveButtonRef = useRef(null); // Reference for the Save button

  const handleBack = () => {

    setHighlightRow(false)
    deleteCooldown.current = false;
    if (saveButtonRef.current) {
      saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setRcds({
      id: "",
      lastClickedValue: "",
      hiddenFormula: "",
      description: "",
      formula: "",
      formulaId: "",
      order: "",
      effectiveDate: "",
      userId: "", // Initial value will be updated in useEffect
      publicIp: "", // Initial value will be updated in useEffect
    });
    setIsEditing(false);
  };

  const [headApiData, setHeadApiData] = useState([]);

  const getButtonIcon = (item) => {
    switch (item) {
      case "*":
        return <FaStar />;
      case "+":
        return <FaPlus />;
      case "-":
        return <FaMinus />;
      case "/":
        return <FaDivide />;
      case "(":
        return (
          <img src={openBracket} alt="Open Bracket" className="dialpad-icon" />
        );
      case ")":
        return (
          <img
            src={closeBracket}
            alt="Close Bracket"
            className="dialpad-icon"
          />
        );
      case ".":
        return <FaCircle />;
      case "Cl":
        return <FaTimes />;
      case "Cl AL":
        return <FaUndo />;
      case "=":
        return <FaEquals />;
      case "%":
        return <FaPercent />;
      default:
        return item;
    }
  };



  const handleReset = () => {
    setRcds({
      description: "",
      formula: "",
      order: "",
      effectiveDate: "",
      lastClickedValue: "",
    });
  };

  const handleRowClick = (row) => {
    setRcds((prev) => ({
      ...prev,
      formula: prev.formula + `'${row.id}'`,
      hiddenFormula: prev.hiddenFormula + `'${row.headId}'`,
      lastClickedValue: row.id.toString(),
    }));
  };

  const getButtonType = (item) => {
    if (["+", "-", "*", "/", "%", "=", "Cl", "Cl AL"].includes(item)) {
      if (item === "Cl AL") return "clear-all";
      if (item === "Cl") return "clear";
      if (item === "=") return "equal";
      return "operator";
    }
    if (item === ".") return "decimal";
    return "number";
  };

  const handleDialPadClick = (value) => {
    if (value === "Cl") {
      setRcds((prev) => {
        let formula = prev.formula;

        // Remove the last character if it is one of the specified symbols
        const removeRegex = /[+\-*/%=().]$/; // Match any of the operators and symbols at the end

        if (formula.match(removeRegex)) {
          formula = formula.slice(0, formula.length - 1); // Remove the last character if it's a match
        } else {
          // If the last character isn't one of the specified symbols, handle normal numbers/quoted strings
          const quotedRegex = /'[^']*'$/;
          const quotedMatch = formula.match(quotedRegex);

          if (quotedMatch) {
            formula = formula.slice(0, formula.lastIndexOf(quotedMatch[0]));
          } else {
            const numberRegex = /\d$/;
            const numberMatch = formula.match(numberRegex);

            if (numberMatch) {
              formula = formula.slice(0, formula.length - 1);
            }
          }
        }


        return { ...prev, formula };
      });
    } else if (value === "Cl AL") {
      setRcds({
        id: "",
        lastClickedValue: "",
        hiddenFormula: "",
        description: "",
        formula: "",
        formulaId: "",
        order: "",
        effectiveDate: "",
        userId: "", // Initial value will be updated in useEffect
        publicIp: "",
      });
    } else {
      setRcds((prev) => ({
        ...prev,
        hiddenFormula : prev.hiddenFormula + value,
        formula: prev.formula + value,
        lastClickedValue: value,
      }));
    }
  };

  const handleChange = (evt) => {
    const { name, value, type, checked } = evt.target;
    setRcds((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    }));

    setErrorMessages((prevMessage) => ({
      ...prevMessage,
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
    let errors = {};
    if (!rcds.description) errors.description = "Description must not be empty";
    if (!rcds.effectiveDate) errors.effectiveDate = "Effective Date must not be empty";
    if (!rcds.formula) errors.formula = "Formula must not be empty";
    if (!rcds.order) errors.order = "Order must not be empty";
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
    setShowSave(false);

    const updatedRcds = {
      ...rcds,
      userId: s_user.userId, // Ensure userId is included
      publicIp: s_user.publicIp, // Ensure publicIp is included
    };
    console.log("Data: ", updatedRcds)
    try {
      console.log(updatedRcds, "--------------");
      // Encrypt the updated rcds with the userId
      const ciphertext = encAESData(secretKey, updatedRcds);
      console.log("Encrypted Data: ", ciphertext);

      let responseData;

      if (rcds.formulaId) {
        // Update the existing record
        deleteCooldown.current = false;

        const response = await getUpdate("hrms", "formulaMaster", ciphertext ,'user');
        console.log("Update response from backend:", response.data);

        responseData = checkResponseStatus(response);
      } else {
        // Send data to the backend
        const response = await getSave("hrms", "formulaMaster", ciphertext , 'user');
        console.log("Response from backend:", response.data);
        responseData = checkResponseStatus(response);
        console.log(responseData);
      }

      if (responseData) {
        // Check if the operation was successful
        if (responseData.rType === "Y") {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);
          console.log("Decrypted Data:", decryptedData);

          // Clear the form fields by resetting rcds to its initial state
          setRcds({
            id: "",
            lastClickedValue: "",
            hiddenFormula: "",
            description: "",
            formula: "",
            formulaId: "",
            order: "",
            effectiveDate: "",
            userId: s_user.userId, 
            publicIp: s_user.publicIp,
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

      deleteCooldown.current = false; // Reset the cooldown after 3 seconds
      setShowSave(true);
      // Automatically hide the message after it has been shown
      setTimeout(() => {
        setErrorMessageVisibleComponent(false);
        setErrorDivMessage("");
      }, 4000);
      setLoading(false); // End loading state
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
      const menuId = retrieveFromLocalStorage("activeMenuId");
      console.log("MenueId: ", menuId)
      const ciphertext = encAESData(secretKey, { menuId });

      // Send request to get the list
      // await getUpdate("hrms", "salBill", ciphertext);
      const response = await getList("hrms", "formulaMaster", ciphertext);

      console.log("Full response from backend:", response);
      const responseData = checkResponseStatus(response);

      console.log(responseData);

      if (responseData.rType === "Y") {
        if (responseData.rData) {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);
          console.log("Decrypted data:", decryptedData);

          const header = JSON.parse(decryptedData.recData.header);

          let updatedData;
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
            .map((item, is_Active) => ({
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

  const getAPIData = async () => {
    try {

      const response = await getDataApi("hrms", "formulaMaster", "", "user");

      console.log("Full response from backend:", response);
      const responseData = checkResponseStatus(response);

      if (responseData.rType === "Y") {
        if (responseData.rData) {
          const data = JSON.parse(responseData.rData);

          data.map((item) => {
            setHeadApiData((prev) => [
              ...prev,
              {
                id: item.order_level,
                description: item.description,
                headId: item.salary_head_id
              }
            ]);
          });
          console.log(data, "--------abhideep");
        }
      } else {
      }


    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
console.log(rcds);
  }, [rcds]);


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
      getData();
      getAPIData();
    }, 500);

    setTimeout(() => {
      resetTable();
    }, 500);
  }, []);


  const viewRecord = async (formulaId) => {
    deleteCooldown.current = true;
    try {
      setErrorMessages("");
      const ciphertext = encAESData(secretKey, { formulaId });

      const response = await getViewRecord("hrms", "formulaMaster", ciphertext,'user');

      console.log("Full response from backend:", response);
      const responseData = checkResponseStatus(response);

      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);
        console.log("Decrypted Data:", decryptedData);
        console.log(decryptedData, "--------------")

        const dataToRec = JSON.parse(decryptedData.recData);

        const dataToSet = dataToRec[0];

        setRcds({
          id: "",
          lastClickedValue: "",
          hiddenFormula: dataToSet.hiddenFormula,
          description: dataToSet.description,
          formula: dataToSet.formula,
          formulaId:dataToSet.formulaId,
          order: dataToSet.order,
          effectiveDate: dataToSet.effectiveFromDate,
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

  const dynamicTableData = {
          // headers: ["SNo.", "Description", "Formula", "Order No", "Update"],
          // rows: apiData.map((item, sno) => ({
          //     id: sno + 1,
          //     one: item.basicFrom,
          //     two: item.basicTo,
          //     three: item.gradeOrder,
          //     four: (
          //         <span
          //             className="manipulation-icon edit-color"
          //             onClick={() => {
          //                 const recordId = { id: sno + 1 };
  
          //                 window.scrollTo({ top: 0, behavior: "smooth" });
          //             }}
          //         >
          //             <FontAwesomeIcon icon={faEdit} />
          //             <span className="manipulation-text"> Edit</span>
          //         </span>
          //     ),
          //     five: !isEditing && (
          //         <span
          //             className={`manipulation-icon delete-color ${deleteCooldownForDetailGrid.current ? "disabled" : ""}`}
          //             onClick={() => {
          //                 if (!deleteCooldownForDetailGrid.current) {
          //                     const recordId = { id: sno + 1 };
          //                     deleteGroupRecord(recordId);
          //                 }
          //             }}
          //             style={{
          //                 pointerEvents: deleteCooldownForDetailGrid.current ? "none" : "auto",
          //                 opacity: deleteCooldownForDetailGrid.current ? 0.5 : 1,
          //             }}
          //         >
          //             <FontAwesomeIcon icon={faTrash} />
          //             <span className="manipulation-text"> Delete</span>
          //         </span>
          //     ),
          // })),
      };


  const handleDelete = async (formulaId) => {
    deleteCooldown.current = true;
    setShowSave(false);
    setLoading(true); // Start loading state

    try {
      const ciphertext = encAESData(secretKey, { formulaId });

      // Send the delete request to the backend
      const response = await getDelete("hrms", "formulaMaster", ciphertext);

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
          .filter((item) => item.formulaId !== formulaId)
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
      deleteCooldown.current = false// Reset the cooldown after 3 seconds

      setTimeout(() => {
        setErrorMessageVisibleComponent(false);
        setErrorDivMessage("");
      }, 4000);
    }
  };

  const columnDefs = [
    {
      headerName: "Serial No.",
      field: "serialNo",
      sortable: true,
      width: 100,
      cellStyle: { textAlign: "center" },
    },
    ...columnDefsApi,
    {
      headerName: 'Action',
      field: 'button',
      cellRenderer: (params) => (
        <>
          <span
            className="manipulation-icon edit-color mx-3"
            onClick={() => {
              const id = params.data.formulaId;
              viewRecord(id);
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
                  const id = params.data.formulaId;
                  handleDelete(id);
                }
              }
            }}
            style={{
              pointerEvents: isEditing || deleteCooldown.current ? 'none' : 'auto',
              opacity: isEditing || deleteCooldown.current ? 0.5 : 1,  // Reduce opacity to indicate disabled state
              cursor: isEditing || deleteCooldown.current ? 'not-allowed' : 'pointer',
            }}
          >
            <FontAwesomeIcon icon={faTrash} className='icon-size' />

          </span>
        </>
      ),
      sortable: false,
      filter: false,
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

        const matchesDescription = searchRcds.department
          ? apiDataRec.department
            .toLowerCase()
            .includes(searchRcds.department.toLowerCase())
          : true;
        return matchesDescription;
      })
      .map((item, sno) => ({
        serialNo: sno + 1,
        department: item.department,
        deptId: item.deptId,
      }));

    console.log(filteredData);

    setTableData(filteredData);
    setIsOpen(false);
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

  const resetTable = () => {
    setrefreshAGGrid(true);
    setTableHeader(columnDefs);
    setTableData(rowData);
    setSelectedValues([]);
  };

  //***************************************************** code for add to remove **** *

  const [customModalIsOpen, setCustomModelIsOpen] = React.useState(false);

  function openModal() {
    setCustomModelIsOpen(true);
  }

  const [selectedValues, setSelectedValues] = useState([]);

  useEffect(() => {
    resetTable();
  }, [])


  return (
    <>
      <div className="rightArea">
        <div className="container-fluid px-1">
          <Breadcrumbs />
        </div>
        <div className="container-body mx-3 mb-2">
          {/* <form> */}
          <div className="row mb-3">
            <p className="card-title h6">{retrieveFromLocalStorage("pageName")}</p>
          </div>

          <div className="card">
            <div className="card-body roleBody">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-md-4">
                    <div className="card shadow-lg mb-4 p-3 forumala-master-card">
                      <div className="card-body">
                        <h5 className="card-title text-center text-primary mb-2">
                          Formula Details
                        </h5>
                        <div className="mb-1">
                          <FormText
                            autofocus={true}
                            label={data.descriptionLabel}
                            name={data.descriptionName}
                            holder={data.descriptionHolder}
                            value={rcds[data.descriptionName]}
                            errorMessage={errorMessages.description}
                            onChange={handleChange}
                            icon={icon.default}
                            Maxlength={25}
                          />
                        </div>

                        <div className="mb-1">
                          <FormTextarea
                            autofocus={true}
                            label={data.formulaLabel}
                            name={data.formulaName}
                            holder={data.formulaHolder}
                            value={rcds[data.formulaName]}
                            errorMessage={errorMessages.formula}
                            onChange={handleChange}
                            icon={icon.pen}
                            Maxlength={25}
                            setHeight={80}
                            disabled={true}
                          />
                        </div>

                        <div className="mb-1">
                          <FormText
                            autofocus={true}
                            label={data.orderLabel}
                            name={data.orderName}
                            holder={data.orderHolder}
                            value={rcds[data.orderName]}
                            errorMessage={errorMessages.order}
                            onChange={handleChange}
                            icon={icon.column}
                            Maxlength={25}
                          />
                        </div>

                        <div className="mb-1">
                          <FormDate
                            autofocus={true}
                            label={data.effectiveDateLabel}
                            name={data.effectiveDateName}
                            holder={data.effectiveDateHolder}
                            value={rcds[data.effectiveDateName]}
                            errorMessage={errorMessages.effectiveDate}
                            onChange={handleChange}
                            icon={icon.calender}
                            Maxlength={25}
                          />
                        </div>

                        {/* <div className="row mb-3">
                                <div className="col-md-12">
                                    <DynamicTable data={dynamicTableData} />

                                </div>
                            </div> */}

                        {/* <div className="d-flex justify-content-between mt-2"> */}

                        <div className="row offset-2 mt-4">
                          <div className="col-md-12 ms-1">
                            {showSave &&
                              <FormButton
                                btnType1={data.save}
                                btnType3={data.update}
                                btnType4={data.back}
                                btnType5={data.reset}
                                onClick={handleCreate}
                                onBack={handleBack}
                                onReset={handleReset}
                                showUpdate={!!rcds.formulaId}
                                rcds={rcds}
                                loading={loading}
                              />}

                          </div>
                          {/* </div> */}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card shadow-lg mb-4 p-3 forumala-master-card">
                      <div className="card-body">
                        <h5 className="card-title text-center mb-4 text-primary">
                          Dial Pad
                        </h5>
                        <div className="dialpad">
                          {[
                            "*",
                            "+",
                            "-",
                            "/",
                            "(",
                            ")",
                            ".",
                            "1",
                            "2",
                            "3",
                            "4",
                            "5",
                            "6",
                            "7",
                            "8",
                            "9",
                            "0",
                            "Cl",
                            "%",
                            "=",
                            "Cl AL",
                          ].map((item) => (
                            <button
                              key={++i}
                              className={`dialpad-btn ${getButtonType(item)}`}
                              onClick={() => handleDialPadClick(item)}
                            >
                              {getButtonIcon(item)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card shadow-lg mb-4 p-3 forumala-master-card">
                      <div className="card-body">
                        <h5 className="card-title text-center text-primary mb-2">
                          List of Heads
                        </h5>
                        <table className="table table-bordered table-striped">
                          <thead>
                            <tr>
                              <th>S.No.</th>
                              <th>Id</th>
                              <th>Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {headApiData.map((row, index) => (
                              <tr
                                key={++i}
                                onClick={() => handleRowClick(row)}
                                className="cursor-pointer hover-row"
                              >
                                <td>{index + 1}</td>
                                <td>{row.id}</td>
                                <td>{row.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* </form> */}
        </div >
      </div >
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
            List of Formula Master<span className="parenthesis">(</span>s
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

            setReloadTableFlag(true);

            setTimeout(() => {
              setReloadTableFlag(false);
            }, 600);

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
                    <FormText
                      autofocus={true}
                      label={data.dName}
                      name="fundCategory"
                      value={searchRcds.fundCategory}
                      holder={data.dHolder}
                      onChange={handleSearchChange}
                      Maxlength={205}
                      icon={icon.default}
                    />
                  </div>
                  <div className="col-md-6">
                    <FormText
                      autofocus={true}
                      label={data.sName}
                      name="remarks"
                      value={searchRcds.remarks}
                      holder={data.sHolder}
                      onChange={handleSearchChange}
                      Maxlength={205}
                      icon={icon.default}
                    />
                  </div>
                </div>

                <div className="row mb-3 offset-4">
                  <div className="col-md-6">
                    <button
                      className="me-1 btn btn-primary  btn-sm btn-color"
                      onClick={filterTableData}
                    >
                      Search
                    </button>
                    <button
                      className="btn btn-warning btn-color  btn-sm ms-2"
                      onClick={() => {
                        setSearchRcds({
                          fundCategory: "",
                          remarks: "",

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
            />
        </div>
      </div>
    </>

  );
}

export default FormulaMaster;

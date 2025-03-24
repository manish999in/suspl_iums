import React , { useState, useEffect, useRef,useContext } from "react";
import "../styles/inputStyle.css";
import FormText from "../components/FormText";
import FormTextarea from "../components/FormTextarea";
import FormButton from "../components/FormButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../styles/AdvancedSearch.css";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import ErrorMessageABD from "../components/ErrorMessageABD";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import AdvanceSearchModal from '../components/AdvanceSearchModal';
import SelectComponent from "../components/SelectComponent";

import {
  retrieveFromCookies,
  retrieveFromLocalStorage,
} from "../utils/CryptoUtils";
;

import {
  getDelete,
  getList,
  getSave,
  getUpdate,
  getViewRecord,
} from "../utils/api";
import AgGridTable from "../components/AgGridTable";
import Breadcrumbs from "../components/Breadcrumbs";
import icon from "../properties/icon";
import CustomModal from "../components/CustomModal";
import FormCheckbox from "../components/FormCheckbox";
import FilterTags from "../components/FilterTags"
import { GlobalContext } from "../context/GlobalContextProvider";


const ProgramYearTypeMaster = () => {
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

  
  const [modalIsOpen, setIsOpen] = React.useState(false);

  const [resetSelect, setResetSelect] = useState(false); // State for manipulating dropdown and search

  const deleteCooldown = useRef(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [errorVisibleComponent, setErrorMessageVisibleComponent] =
    useState(false);
  const [errorType, setErrorType] = useState();
  const [isEditing, setIsEditing] = useState(false); // state initaialize

  const [errorDivMessage, setErrorDivMessage] = useState("");

  const [errorMessages, setErrorMessages] = useState({
    programyeartype: "",
    alias: "",


  }); // handling error


  


  // changes
  const [rcds, setRcds] = useState({
    programId: "",
    programyeartype: "",
    alias: "",
    remarks: "",
    is_active:"",

    userId: "", // Initial value will be updated in useEffect
    publicIp: "", // Initial value will be updated in useEffect
    createdBy: "",
    modifiedBy: "",
  });


  const [, setS_UserId] = useState({
    userId: "",
    publicIp: "",
  });

  
  const secretKey = retrieveFromCookies("AESDecKey");


  const saveButtonRef = useRef(null); // Reference for the Save button

  const [searchRcds, setSearchRcds] = useState({
    programId: "",
    programyeartype: "",
    alias: "",
    remarks: "",
    isActive:""

  });
  const [showSave, setShowSave] = useState(true);
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const { checkResponseStatus } = useCheckResponseStatus();

  const data = {
    uName: "Programme Year Type",
    uHolder: "Programme Year Type",
    cCity: "Alias",
    cholder: "Alias",
    holders :"Is Active",
    bname:"Remarks",
    bholder:"Remarks",

    programyeartype: "programyeartype",
    alias: "alias",
    remarks:"remarks",
    isActive:"isActive",
  
    
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
         programId: "",
         programyeartype: "",
          alias: "",
        remarks: "",
         userId: "",
    });

    setResetSelect(true); // for dropdown search

    setResponseMessage(""); // Clear any displayed messages
    setIsEditing(false);

  };

  const handleReset = () => {
    // Reset rcds to its initial state
    setRcds({
      programId: "null",
      programyeartype: "",
      
        alias: "",
      remarks: "",
    });
    setResetSelect(true); // for dropdown search

    setErrorMessages("");
  };

  const handleChange = (evt) => {
    const { name, value, type, checked } = evt.target;
    
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
    const { name, value, type, checked } = evt.target;
    setSearchRcds((prevState) => ({
      ...prevState,
      [name]: value,
    }));

  };


  const validateFields = () => {
    const errors = {};
    if (!rcds.programyeartype) errors.programyeartype = "Programme Year Type is Required";
    if (!rcds.alias) errors.alias = "Please Enter Alias";
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
      is_active: rcds.is_active === "Y" ? "Y" : "N", // Correctly set is_active

    };
    try {
      // Encrypt the updated rcds with the userId
      const ciphertext = encAESData(secretKey, updatedRcds);
      console.log("Encrypted Data: ", ciphertext);

      let responseData;

    

      if (rcds.programId) {                 
        // Update the existing record
        deleteCooldown.current = false;
        const response = await getUpdate("hrms", "programTypeMaster", ciphertext);
        console.log("Update response from backend:", response.data);

        responseData = checkResponseStatus(response);
      } else {
        // Send data to the backend
        
        const response = await getSave("hrms", "programTypeMaster", ciphertext);
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
            // Replace with your initial state for rcds
            programId: "",
            programyeartype: "",
              alias: "",
            remarks: "",
            is_active:"",
            userId: rcds.userId,
            publicIp: rcds.publicIp,
          });
          setResetSelect(true); // for dropdown search

          setErrorMessageVisibleComponent(true);
          setErrorType(true);
          setErrorDivMessage(responseData.rMessage);

          // Automatically hide the message after it has been shown
          // setTimeout(() => {
            // setErrorMessageVisibleComponent(false);
            // setErrorDivMessage("");
            setShowSave(true)
          // }, 4000); // Adjust time as needed
        } else {
          setErrorMessageVisibleComponent(true);
          setErrorType(false);
          setErrorDivMessage(responseData.rMessage);
          responseData;
        }

        // Refresh the data list after saving
        getData();
      }
    } catch (error) {
      console.error("Error during create/update:", error);
      setResponseMessage("Error saving data: " + error.message);
    }finally {
      setLoading(false); // End loading state

      deleteCooldown.current = false;
      setShowSave(true);
      // Automatically hide the message after it has been shown
      setTimeout(() => {
        setErrorMessageVisibleComponent(false);
        setErrorDivMessage("");
      }, 4000);
      setLoading(false); // End loading state
      setHighlightRow(false)
    }
  };



  const getData = async () => {
    try {
      const menuId = retrieveFromLocalStorage("activeMenuId");
      // Encrypt the searchRcds data
      const ciphertext = encAESData(secretKey, { menuId });

      // Send request to get the list
      const response = await getList("hrms", "programTypeMaster", ciphertext, {});

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
    if (resetSelect) {
      // Reset the select component after render
      setResetSelect(false);
    }
  }, [resetSelect]);


  const viewRecord = async (programId) => {
    deleteCooldown.current = true;
    try {
      setErrorMessages("");
      const ciphertext = encAESData(secretKey, { programId });

      const response = await getViewRecord("hrms", "programTypeMaster", ciphertext);

      const responseData = checkResponseStatus(response);

      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);

        console.log("Decrypted Data ",decryptedData)

        const dataToRec = JSON.parse(decryptedData.recData); // Assuming you want the first item

        const dataToSet = dataToRec[0];

        // Update rcds state with the decrypted data
        setRcds({
          programId: dataToSet.programId,
          programyeartype: dataToSet.programyeartype,
            alias: dataToSet.alias,
            is_active:dataToSet.is_active,
            remarks:dataToSet.remarks,
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


 
  const handleDelete = async (programId) => {
    deleteCooldown.current = true;
    setShowSave(false);
    setLoading(true);
  
    try {
      const ciphertext = encAESData(secretKey, { programId });
      const response = await getDelete("hrms", "programTypeMaster", ciphertext, {});
      const responseData = checkResponseStatus(response);
  
      if (responseData.rData) {
        const jsonData = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, jsonData);
      } else {
        console.error("encryptData is undefined in the backend response.");
      }
  
      if (responseData.rType === "Y") {
        setErrorMessageVisibleComponent(true);
        setErrorType(true);
        setErrorDivMessage(responseData.rMessage);
        setShowSave(true);
  
        setTimeout(() => {
          setErrorMessageVisibleComponent(false);
          setErrorDivMessage("");
        }, 4000);
  
        // Use functional setState to always access the latest state
        setTableData((prevTableData) => {
          // Filter out the deleted item from the previous tableData
          const newData = prevTableData.filter((item) => item.programId !== programId);
  
          // Map to reset serialNo after deletion
          const updatedTableData = newData.map((item, index) => ({
            ...item,
            serialNo: index + 1, // Recalculate serialNo
          }));
          // Update rowData as well
          setRowData(updatedTableData); // Ensure both state updates are in sync
          return updatedTableData; // Return updated data to be set for tableData
        });
  
      } else {
        setErrorMessageVisibleComponent(true);
        setErrorType(false);
        setErrorDivMessage(response.data.rMessage);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    } finally {
      setLoading(false);
      setShowSave(true);
      deleteCooldown.current = false;
  
      setTimeout(() => {
        setErrorMessageVisibleComponent(false);
        setErrorDivMessage("");
      }, 4000);
      setHighlightRow(false);
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
              const id = params.data.programId; // Access the row data to get the roleId
             setHighlightRow(true);
              viewRecord(id); // Call viewRecord function with the id
              window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to the top
            }}
          >
            <FontAwesomeIcon icon={faEdit} className="icon-size" />
          </span>

          <span
            // tabIndex={1}
            className={`manipulation-icon delete-color ${
              deleteCooldown.current ? "disabled" : ""
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
                    const id = params.data.programId; // Access row data to get the salId
                    handleDelete(id); // Call the handleDelete function with the salId
                    setHighlightRow(false); //changes

                  }
                  else{
                    setHighlightRow(false);
                  }
                }
              
            }}
            style={{
              pointerEvents: isEditing || deleteCooldown.current ? "none" : "auto", // Disable click
              opacity: isEditing || deleteCooldown.current ? 0.5 : 1, // Make it visually dim when disabled
              cursor: isEditing || deleteCooldown.current ? "not-allowed" : "pointer", // Change cursor to indicate disabled state
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

  useEffect(() => {
    if (columnDefsApi && columnDefsApi.length > 0) {
      setTableHeader(columnDefs);
    }
  }, [columnDefsApi]);


 
  const filterTableData = () => {

    const filteredData = rowData
      .filter((apiDataRec) => {
        // Define filter conditions
        const matchesAdminRole = searchRcds.isActive ? apiDataRec.isActive === searchRcds.isActive : true;

        // Role name filter should only be applied if searchRcds.roleName is provided
        const matchesRoleName = searchRcds.programyeartype
          ? apiDataRec.programyeartype.toLowerCase().includes(searchRcds.programyeartype.toLowerCase())
          : true; // If no roleName filter, include all role names


        const matchesRoleLevel = searchRcds.alias ? apiDataRec.alias === searchRcds.alias : true;


        // Return true if both conditions are met
        return matchesAdminRole && matchesRoleName && matchesRoleLevel;
      })
      .map((item, sno) => ({
        serialNo: sno + 1, 
        programyeartype: item.programyeartype,
        alias: item.alias,
        isActive: item.isActive  === 'Yes' ? 'Yes' : 'No',
        programId:item.programId,
        remarks      :item.remarks,
      }));

    setTableData(filteredData);
    setIsOpen(false);
  };


  const resetTable = () => {
    setrefreshAGGrid(true);
    setTableHeader(columnDefs);
    setTableData(rowData);
    setSelectedValues([]);
  }
  ///////////////////////////////////*************shortcuts**********////////////////////////////////////////////////////////

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
                    <FormText
                     autofocus={true}
                    holder={data.uHolder}
                    name={data.programyeartype}
                    label={data.uName}
                      value={rcds[data.programyeartype]}
                      errorMessage={errorMessages.programyeartype} // Pass the error message for roleLevel
                      onChange={handleChange}
                      icon={icon.user} // Example icon (FontAwesome star icon)
 
                    />
                  </div>

                 
                  <div className="col-md-6">
                    <FormText
                    label={data.cCity}
                      name={data.alias}
                      holder={data.cholder}
                      value={rcds[data.alias]}
                      errorMessage={errorMessages.alias} // Pass the error message for mappedAlias
                      onChange={handleChange}
                      icon={icon.default} // Example FontAwesome icon; change as needed

                    />
                  </div>
                </div>
    

                <div className="row mb-3">
                  
                  <div className="col-md-6">
                  <FormCheckbox
                    label={data.holders}
                    checked={rcds.is_active === "Y"} // Check if isAdmin is "Y" for checked
                    onChange={(evt) => {
                      if (evt && evt.target) {
                        const { checked } = evt.target; // Get the checked state
                        setRcds((prevState) => ({
                          ...prevState,
                          is_active: checked ? "Y" : "N", // Update isAdmin based on checked state
                        }));
                      }
                    }}
                    errorMessage={errorMessages.is_active} // Pass the error message if applicable
                  />
                  </div>

                 
                  <div className="col-md-6">
                    <FormTextarea
                     label={data.bname}
                      name={data.remarks}
                      value={rcds[data.remarks]}
                      holder={data.bholder}
                      errorMessage={errorMessages.remarks} // Pass the error message for roleLevel
                      onChange={handleChange}
                    //   icon={icon.star}// Example icon (FontAwesome star icon)
                      Maxlength={25}

                    />
                  </div>
                </div>

              

                <div className="row">
                  <div className="col-md-12">
                  {
                      showSave &&  <FormButton
                      btnType1={data.save}
                      btnType3={data.update}
                      btnType4={data.back}
                      btnType5={data.reset}
                      onClick={handleCreate}
                      onBack={handleBack}
                      onReset={handleReset}
                      showUpdate={!!rcds.programId}
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
              List of Program Type detail<span className="parenthesis">(</span>s
              <span className="parenthesis">)</span>
            </small>
          </p>


          <div
            className="refresh-table "
            aria-label="" data-bs-toggle="tooltip" data-bs-placement="auto" title={`Refresh Data`}
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
                    <div className="col-md-12">
                    <FormText
                     autofocus={true}
                    holder={data.uHolder}
                    name={data.programyeartype}
                    label={data.uName}
                      value={searchRcds[data.programyeartype]}
                      errorMessage={errorMessages.programyeartype} // Pass the error message for roleLevel
                      onChange={handleSearchChange}
                      icon={icon.user} // Example icon (FontAwesome star icon)
 
                    />
                    </div>

                    <div className="col-md-6">
                   
                       <FormText
                    label={data.cCity}
                      name={data.alias}
                      holder={data.cholder}
                      value={searchRcds[data.alias]}
                      errorMessage={errorMessages.alias} // Pass the error message for mappedAlias
                      onChange={handleSearchChange}
                      icon={icon.default} // Example FontAwesome icon; change as needed

                    />
                    </div>

                    <div className="col-md-6">
                       <SelectComponent
                        label="Is Active ?"
                        name={data.isActive}
                        selectedValue={searchRcds.isActive}
                        resetValue={resetSelect}
                        onSelects={(value) =>
                          setSearchRcds((prevState) => ({
                            ...prevState,
                            isActive: value,
                          }))
                        }
                        icon={icon.arrowDown} // Example icon class for FontAwesome
                        options={[
                          { value: "Yes", label: "Yes" },
                          { value: "No", label: "No" },
                        ]}
                      /> 
                    </div>
                  </div>

                  <div className="row mb-3 offset-3">
                    <div className="col-md-6 d-flex">
                      <button className="me-1 btn btn-primary btn-color"
                        onClick={filterTableData}
                      >Search</button>
                      <button className="btn btn-warning btn-color ms-2"
                        onClick={
                          () => {
                            setSearchRcds({
                             programyeartype: "",
                             alias: "",
                             isActive:""

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

export default ProgramYearTypeMaster;

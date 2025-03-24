import React, { useState, useEffect, useRef, useContext } from "react";
import "../styles/inputStyle.css";
import FormText from "../components/FormText";
import FormLabel from "../components/FormLabel";
import FormCheckbox from "../components/FormCheckbox";
import FormButton from "../components/FormButton";
import Cookies from "js-cookie";
import DynamicTable from "../components/DynamicTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FaPlus } from "react-icons/fa"; // This import should work
import "../styles/AdvancedSearch.css";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import icon from "../properties/icon";
import ErrorMessageABD from "../components/ErrorMessageABD";
import CreateUpdateBar from "../components/CreateUpdateBar";

import {
  getDelete,
  getList,
  getSave,
  getUpdate,
  getViewRecord,
  getRecordByCount,
} from "../utils/api";
import AgGridTable from "../components/AgGridTable";
import Breadcrumbs from "../components/Breadcrumbs";
import { retrieveFromLocalStorage, retrieveFromCookies, storeInLocalStorage } from "../utils/CryptoUtils";
import AdvanceSearchModal from "../components/AdvanceSearchModal";
import CustomModal from "../components/CustomModal";
import FormMultiSelect from "../components/FormMultiSelect";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import { GlobalContext } from "../context/GlobalContextProvider";
import FilterTags from "../components/FilterTags";

const DepartmentMaster = () => {

  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [resetSelect, setResetSelect] = useState(false);
  // const [deleteCooldown, setDeleteCooldown] = useState(false);
  const  deleteCooldown = useRef(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSave, setShowSave] = useState(true);
  const [errorVisibleComponent, setErrorMessageVisibleComponent] =
    useState(false);
  const [errorType, setErrorType] = useState();
  const [errorDivMessage, setErrorDivMessage] = useState("");
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessages, setErrorMessages] = useState({
    department: "",
  }); // handling error

  const toggleSearchBar = () => {
    setIsOpen(!isOpen);
  };



  const [rcds, setRcds] = useState({
    department: "",
    isUsedAcademic: "",
    userId: "", // Initial value will be updated in useEffect
    publicIp: "", // Initial value will be updated in useEffect
    createdBy: "",
    modifiedBy: "",
  });


  const secretKey = retrieveFromCookies("AESDecKey");


  const saveButtonRef = useRef(null); // Reference for the Save button

  const [searchRcds, setSearchRcds] = useState({
    department: "",
  });

  const [apiData, setApiData] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const { checkResponseStatus } = useCheckResponseStatus();

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
  } = useContext(GlobalContext  );


  const data = {
    dName: "Department Name",
    rHolder: "Enter Department",
    isUsedAcademic: "Is Academic Role?",
    save: "Save",
    delete: "Delete",
    update: "Update",
    back: "Back",
    reset: "Reset",
  };
  const handleBack = () => {
    // Scroll back to the save button
    if (saveButtonRef.current) {
      saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // Alternatively, clear form data and reset state if needed
    setRcds({
      deptId: "",
      department: "",
      isUsedAcademic: "",
    });
deleteCooldown.current = false;
    setResponseMessage(""); // Clear any displayed messages
    setIsEditing(false);
  };

  const handleReset = () => {
    // Reset rcds to its initial state
    setRcds({
      deptId: "",
      department: "",
      isUsedAcademic: "",
    });
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
    if (!rcds.department) errors.department = "Department must not be empty";
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

      if (rcds.deptId) {
        // Update the existing record
        deleteCooldown.current = false;

        const response = await getUpdate("hrms", "deptMaster", ciphertext);
        console.log("Update response from backend:", response.data);

        responseData = checkResponseStatus(response);
      } else {
        // Send data to the backend
        const response = await getSave("hrms", "deptMaster", ciphertext);
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
            deptId: "",
            department: "",
            isUsedAcademic: "N", // Reset to "N" after saving
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
      const response = await getList("hrms", "deptMaster", ciphertext);

      console.log("Full response from backend:", response);
      const responseData = checkResponseStatus(response);

      console.log(responseData);

      if (responseData.rType === "Y") {
        if (responseData.rData) {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
      getData();
    }, 500);

    setTimeout(() => {
      resetTable();
    }, 500);
  }, []);


  const viewRecord = async (deptId) => {
    deleteCooldown.current = true;
    try {
      setErrorMessages("");
      const ciphertext = encAESData(secretKey, { deptId });

      const response = await getViewRecord("hrms", "deptMaster", ciphertext);

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
          deptId: dataToSet.deptId,
          department: dataToSet.department,
          isUsedAcademic:
            dataToSet.isUsedAcademic.toUpperCase() === "Y" ? "Y" : "N", 
          createdBy: `${dataToSet.createdBy} ${dataToSet.createdDate}`,
          modifiedBy: dataToSet.updatedBy && dataToSet.updatedDate
            ? `${dataToSet.updatedBy} ${dataToSet.updatedDate}`
            : " ",
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


  const handleDelete = async (deptId) => {
    deleteCooldown.current = true;
    setShowSave(false);
    setLoading(true); // Start loading state

    try {
      const ciphertext = encAESData(secretKey, { deptId });

      // Send the delete request to the backend
      const response = await getDelete("hrms", "deptMaster", ciphertext);

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
          .filter((item) => item.deptId !== deptId)
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
     deleteCooldown.current= false// Reset the cooldown after 3 seconds

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
              const id =  params.data.deptId ;
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
                  const id = params.data.deptId ;
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
          <form action="" className="mb-5">
            <div className="card">
              <div className="card-body">
                <div className="row mb-3">

                  <div className="col-md-6">
                    <FormText
                      autofocus={true}
                      label={data.dName}
                      name="department"
                      holder={data.rHolder}
                      value={rcds.department}
                      onChange={handleChange}
                      Maxlength={205}
                      errorMessage={errorMessages.department}
                      icon={icon.default}
                    />
                  </div>


                  <div className="col-md-6">
                    <FormCheckbox
                      label={data.isUsedAcademic}
                      name="isUsedAcademic"
                      checked={rcds.isUsedAcademic === "Y"}
                      onChange={(evt) => {
                        if (evt && evt.target) {
                          const { checked } = evt.target;
                          setRcds((prevState) => ({
                            ...prevState,
                            isUsedAcademic: checked ? "Y" : "N", // Update isUsedAcademic based on checked state
                          }));
                        }
                      }}
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
                        showUpdate={!!rcds.deptId}
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
              List of Department<span className="parenthesis">(</span>s
              <span className="parenthesis">)</span>
            </small>
          </p>


          <div
            className="refresh-table"
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
                    <div className="col-md-12">
                      <FormText
                        autofocus={true}
                        label={data.dName}
                        name="department"
                        holder={data.rHolder}
                        value={searchRcds.department}
                        // errorMessage={errorMessages.roleName} // Pass the error message for roleName
                        onChange={handleSearchChange}
                        icon={icon.user} // Example FontAwesome icon; change as needed
                      />
                    </div>
                  </div>


                  <div className="row mb-3 offset-4">
                  <div className="col-md-6">
                    <button className="me-1 btn btn-primary  btn-sm btn-color"
                      onClick={filterTableData}
                    >Search</button>
                    <button className="btn btn-warning btn-color   btn-sm ms-2"
                      onClick={
                        () => {
                          setSearchRcds({
                            department: "",
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
              className="d-flex align-items-center p-2 border rounded-3  addRemoveButtoninCustomModal"
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
              header="Add/Remove Column"
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
            {/* </i> */}
            <AgGridTable
              rowData={tableData}
              columnDefs={tableHeader}
              hardRefreshFlag={refreshAGGrid}
              setrefreshAGGrid={setrefreshAGGrid}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default DepartmentMaster;

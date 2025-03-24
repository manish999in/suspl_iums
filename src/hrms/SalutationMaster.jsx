/**
 * @author NITESH KUMAR
 * @date  13/11/2024
 */
import React, { useEffect, useState, useRef, useContext } from "react";
import {
  getDelete,
  getList,
  getSave,
  getUpdate,
  getViewRecord,
} from "../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import FormText from "../components/FormText";
import "../styles/AdvancedSearch.css";
import FormButton from "../components/FormButton";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import icon from "../properties/icon";
import FormTextarea from "../components/FormTextarea";
import ErrorMessageABD from "../components/ErrorMessageABD";
import AgGridTable from "../components/AgGridTable";
import Breadcrumbs from "../components/Breadcrumbs";
import { retrieveFromCookies, retrieveFromLocalStorage } from "../utils/CryptoUtils";
import AdvanceSearchModal from '../components/AdvanceSearchModal';
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import CustomModal from "../components/CustomModal";
import { GlobalContext } from "../context/GlobalContextProvider";
import FilterTags from "../components/FilterTags";

const SalutationMaster = () => {
  const [customModalIsOpen, setCustomModelIsOpen] = React.useState(false);
  const [searchRcds, setSearchRcds] = useState({
    salutation: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState({
    salutation: "",
  });
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [errorVisibleComponent, setErrorMessageVisibleComponent] =
    useState(false);
  const [errorType, setErrorType] = useState();
  const [errorDivMessage, setErrorDivMessage] = useState("");
  const [showSave, setShowSave] = useState(true);
  const { checkResponseStatus } = useCheckResponseStatus();
  const saveButtonRef = useRef(null);
  const [resetSelect, setResetSelect] = useState(false);
  const [selectedValues, setSelectedValues] = useState([]);
  const deleteCooldown = useRef(false);
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
  const [rcds, setRcds] = useState({
    salutation: "",
    remarks: "",
    salId: "",
    createdBy: "",
    modifiedBy: "",
    userId: "", // Initial value will be updated in useEffect
    publicIp: "", // Initial value will be updated in useEffect
  });
  const data = {
    sname: "Salutation",
    sHolder: "Enter Salutation",
    sal: "salutation",
    lremark: "Remark",
    rHolder: "Enter Remark",
    rem: "remarks",
    save: "Save",
    delete: "Delete",
    update: "Update",
    back: "Back",
    reset: "Reset",
  };
  // Handle back action
  const handleBack = () => {
    setHighlightRow(false); // changes
    deleteCooldown.current = false;
    if (saveButtonRef.current) {
      saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setRcds({
      salutation: "",
      remarks: "",
      salId: "",
      userId: "",
      publicIp: "",
    });
    setIsEditing(false);
  };
  const handleSearchChange = (evt) => {
    const { name, value, type, checked } = evt.target;
    setSearchRcds((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const [s_userId, setS_UserId] = useState({
    userId: "",
    publicIp: "",
  });
  const secretKey = retrieveFromCookies("AESDecKey");
  useEffect(() => {
    const publicIp = retrieveFromCookies("publicIp") || "";
    const uDataCookie = retrieveFromCookies("uData");
    const uData = uDataCookie ? JSON.parse(uDataCookie) : {};
    const userId = uData.userId || "NoUser";

    setS_UserId(() => ({
      userId: userId,
      publicIp: publicIp,
    }));
  }, []);

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setRcds((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setErrorMessages((prevErrors) => ({
      ...prevErrors,
      [name]: "", // Clear error message for the current field
    }));
  };

  const validateFields = () => {
    const errors = {};
    if (!rcds.salutation) errors.salutation = "Salutation is required";
    return errors;
  };

  const handleReset = () => {
    setRcds({
      salutation: "",
      remarks: "",
      salId: "",
    });
    setErrorMessages("");
  };

  const handleCreate = async (evt) => {
    let responseData;
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
      userId: s_user.userId, // Include userId
      publicIp: s_user.publicIp, // Ensure publicIp is included
    };
    try {
      const ciphertext = encAESData(secretKey, updatedRcds);
      if (rcds.salId) {
        // Update case
        deleteCooldown.current = false;
        const response = await getUpdate("hrms", "salutationMaster", ciphertext);
        responseData = checkResponseStatus(response);
      } else {
        // Save case
        const response = await getSave("hrms", "salutationMaster", ciphertext);
        responseData = checkResponseStatus(response);
      }

      if (responseData) {
        if (responseData.rType === "Y") {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);
          setRcds({
            salutation: "",
            remarks: "",
            salId: null,
            userId: rcds.userId,
            publicIp: rcds.publicIp,
          });
          setErrorMessageVisibleComponent(true);
          setErrorType(true);
          setErrorDivMessage(responseData.rMessage);
          setShowSave(true);
        } else {
          setErrorMessageVisibleComponent(true);
          setErrorType(false);
          setErrorDivMessage(responseData.rMessage);
        }
        getData();
      }
    } catch (error) {
      console.error("Error during create/update:", error);
    } finally {
      setLoading(false); // End loading state
      deleteCooldown.current = false;
      setShowSave(true);
      setTimeout(() => {
        setErrorMessageVisibleComponent(false);
        setErrorDivMessage("");
      }, 4000);
      setHighlightRow(false); // changes
    }
  };
  useEffect(() => {
    if (resetSelect) {
      setResetSelect(false);
    }
  }, [resetSelect]);
  const getData = async () => {
    try {
      const menuId = retrieveFromLocalStorage("activeMenuId");
      const ciphertext = encAESData(secretKey, { menuId });
      const response = await getList("hrms", "salutationMaster", ciphertext);
      const responseData = checkResponseStatus(response);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      getData();
    }, 500);
    setTimeout(() => {
      resetTable();
    }, 500);
  }, []);

  const handleDelete = async (salId) => {
    deleteCooldown.current = true;
    setShowSave(false);
    setLoading(true);
    try {
      const ciphertext = encAESData(secretKey, { salId });
      const response = await getDelete("hrms", "salutationMaster", ciphertext);
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

        setTableData((prevTableData) => {
          const newData = prevTableData.filter((item) => item.salId !== salId);
          const updatedTableData = newData.map((item, index) => ({
            ...item,
            serialNo: index + 1, // Recalculate serialNo
          }));
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

  const viewRecord = async (salId) => {
    deleteCooldown.current = true;
    setErrorMessages("");
    try {
      const ciphertext = encAESData(secretKey, { salId });
      const response = await getViewRecord("hrms", "salutationMaster", ciphertext);
      const responseData = checkResponseStatus(response);
      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);
        const dataToRec = JSON.parse(decryptedData.recData);
        const dataToSet = dataToRec[0];
        setRcds({
          salId: dataToSet.salId,
          salutation: dataToSet.salutation,
          remarks: dataToSet.remarks,
          userId: s_userId.userId, // Set userId here
          publicIp: s_userId.publicIp, // Set publicIp here
          createdBy: `${dataToSet.createdBy} ${dataToSet.createdDate}`,
          modifiedBy: dataToSet.updatedBy && dataToSet.updatedDate ? `${dataToSet.updatedBy} ${dataToSet.updatedDate}` : " ",
        });
      } else {
        console.error("encryptData is undefined in the backend response.");
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  };
  useEffect(() => {
    getData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const columnDefs = [
    {
      headerName: 'Serial No.',
      field: 'serialNo',
      sortable: true,
      filter: 'agNumberColumnFilter',
      flex: 1,
      headerClass: 'ag-header-cell',  // Optional: add custom header class
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
              const id = params.data.salId;
              setHighlightRow(true);
              viewRecord(id);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <FontAwesomeIcon icon={faEdit} className='icon-size' />
          </span>

          <span
            className={`manipulation-icon delete-color ${deleteCooldown.current ? 'disabled' : ''} mx-1`}
            onClick={() => {
              if (!deleteCooldown.current) {
                // Show confirmation alert
                const confirmDelete = window.confirm("Are you sure you want to delete this record?");
                if (confirmDelete) {
                  const id = params.data.salId; // Access row data to get the salId
                  setHighlightRow(true);
                  handleDelete(id); // Call the handleDelete function with the salId
                  setHighlightRow(false);
                } else {
                  setHighlightRow(false); //changes
                }
              }
            }}
            style={{
              pointerEvents: isEditing || deleteCooldown.current ? 'none' : 'auto', // Disable click
              opacity: isEditing || deleteCooldown.current ? 0.5 : 1, // Make it visually dim when disabled
              cursor: isEditing || deleteCooldown.current ? 'not-allowed' : 'pointer', // Change cursor to indicate disabled state
            }}
          >
            <FontAwesomeIcon icon={faTrash} className='icon-size' />
          </span>

        </>
      ),
      sortable: false,
      filter: false,  // No filtering for actions columns
      cellClass: 'ag-center-cols-cell',  // Optional: center the edit icon
      width: 150,
      cellStyle: { textAlign: "center" },
    }
  ];
  //--------------------Search Data By Advance Search Option --------------------//
  useEffect(() => {
    if (columnDefsApi && columnDefsApi.length > 0) {
      setTableHeader(columnDefs);
    }
  }, [columnDefsApi]);

  const filterTableData = () => {
    const filteredData = rowData.filter((apiDataRec) => {
      const matchesSaluation = searchRcds.salutation ? apiDataRec.salutation.toLowerCase().includes(searchRcds.salutation.toLowerCase()) : true;
      return matchesSaluation;
    })
      .map((item, sno) => ({
        serialNo: sno + 1,
        salutation: item.salutation,
        remarks: item.remarks,
        salId: item.salId,
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
  //-------------------- Add and Remove Column Option --------------------//
  function openModal() {
    setCustomModelIsOpen(true);
  }
  useEffect(() => {
    // changes
    resetTable();
  }, []);

  //-------------------- Shortcut Key --------------------//

  // Ctrl S for save the data 
  useKeyboardShortcut(
    "S",
    (e) => { // Pass the event to the callback
      handleCreate(e); // Now `e` is available here
    },
    { ctrl: true }
  );

  // Ctrl R for Reset or Reload the Data
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
  // Alt S for Search records from the table
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
  return (
    <>
      <div className="rightArea">
        <div className="container-fluid px-1">
          <Breadcrumbs />
        </div>
        <div className="container-body mx-3 mb-2">
          <form action="" className="mb-5">
            <div className="col-6">
              <p className="card-title h6">{retrieveFromLocalStorage("pageName")}</p>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <FormText
                      autofocus={true}
                      label={data.sname}
                      name={data.sal}
                      holder={data.sHolder}
                      value={rcds[data.sal]}
                      errorMessage={errorMessages.salutation}
                      onChange={handleChange}
                      icon={icon.user}
                      Maxlength={25}
                    />
                  </div>
                  <div className="col-md-6">
                    <FormTextarea
                      holder={data.rHolder}
                      name={data.rem}
                      value={rcds[data.rem]}
                      onChange={handleChange}
                      Maxlength={250}
                      label={data.lremark}
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
                        showUpdate={!!rcds.salId}
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
          <p className='h6 card-title list-header'> <small> List of Salutation<span className='parenthesis'>(</span>s<span className='parenthesis'>)</span></small></p>
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
            <span
              data-bs-toggle="tooltip"
              data-bs-placement="auto"
              title={`Click to Open Advanced Search {Shift + S}`}
            />
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
                        label={data.sname}
                        name={data.sal}
                        holder={data.sHolder}
                        value={searchRcds[data.sal]}
                        onChange={handleSearchChange}
                        icon={icon.user} // Example FontAwesome icon; change as needed
                        Maxlength={25}
                      />
                    </div>
                  </div>

                  <div className="row mb-3 offset-4 ">
                    <div className="col-md-6 d-flex">
                      <button className="me-1 btn btn-primary btn-color"
                        onClick={filterTableData}
                      >Search</button>
                      <button className="btn btn-warning btn-color ms-2"
                        onClick={
                          () => {
                            setSearchRcds({
                              salutation: "",
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
              className={`d-flex align-items-center p-2 border rounded-3 addRemoveButtoninCustomModal ${selectedValues.length === 0 ? '' : 'addRemoveButtonHighlight'}`} tabIndex={1}
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
              header="Remove Column"
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

export default SalutationMaster;

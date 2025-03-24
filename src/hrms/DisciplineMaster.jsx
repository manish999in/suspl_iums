/**
 * @author NITESH KUMAR
 * @date  13/11/2024
 */
import React, { useEffect, useState, useRef, useContext } from "react";
import FormButton from "../components/FormButton";
import FormText from "../components/FormText";
import icon from "../properties/icon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import ErrorMessageABD from "../components/ErrorMessageABD";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import { retrieveFromCookies, retrieveFromLocalStorage, } from "../utils/CryptoUtils";
import {
  getDelete,
  getList,
  getSave,
  getUpdate,
  getViewRecord,
} from "../utils/api";
import AgGridTable from "../components/AgGridTable";
import Breadcrumbs from "../components/Breadcrumbs";
import AdvanceSearchModal from "../components/AdvanceSearchModal";
import CustomModal from "../components/CustomModal";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import { GlobalContext } from "../context/GlobalContextProvider";
import FilterTags from "../components/FilterTags";
const DisciplineMaster = () => {
  const [showSave, setShowSave] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorVisibleComponent, setErrorMessageVisibleComponent] = useState(false);
  const [errorType, setErrorType] = useState();
  const [errorDivMessage, setErrorDivMessage] = useState("");
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [selectedValues, setSelectedValues] = useState([]);
  const [customModalIsOpen, setCustomModelIsOpen] = React.useState(false);
  const deleteCooldown = useRef(false);
  const [errorMessages, setErrorMessages] = useState({
    discipline: "",
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
  const [rcds, setRcds] = useState({
    discipline: "",
    discId: "",
    createdBy: "",
    modifiedBy: "",
    userId: "",
    publicIp: "",
  });
  const [searchRcds, setSearchRcds] = useState({
    discipline: "",
  });
  const data = {
    rname: "Discipline",
    rholder: "Enter Discipline",
    discipline: "discipline",
    save: "Save",
    delete: "Delete",
    update: "Update",
    back: "Back",
    reset: "Reset",
  };
  const saveButtonRef = useRef(null);

  const handleBack = () => {
    setHighlightRow(false);
    deleteCooldown.current = false;
    if (saveButtonRef.current) {
      saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setRcds({
      discipline: "",
      discId: "",
      userId: "",
      publicIp: "",
    });
    setIsEditing(false);
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
  const handleSearchChange = (evt) => {
    const { name, value } = evt.target;
    setSearchRcds((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
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

  const handleReset = () => {
    setRcds({
      discipline: "",
      discId: "",
    });
    setErrorMessages("");
  };

  const { checkResponseStatus } = useCheckResponseStatus();

  const validateFields = () => {
    const errors = {};
    if (!rcds.discipline) errors.discipline = "Discipline is required";
    return errors;
  };

  const handleCreate = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      setLoading(false);
      setShowSave(true);
      return;
    }
    // Prepare data for the API call, including userId and publicIp
    const updatedRcds = {
      ...rcds,
      userId: s_user.userId,
      publicIp: s_user.publicIp,
    };

    try {
      const ciphertext = encAESData(secretKey, updatedRcds);
      let responseData;

      if (rcds.discId) {
        // Update case
        deleteCooldown.current = false;
        const response = await getUpdate("hrms", "disciplineMaster", ciphertext);
        responseData = checkResponseStatus(response);
      } else {
        // Save case
        const response = await getSave("hrms", "disciplineMaster", ciphertext);
        responseData = checkResponseStatus(response);
      }
      if (responseData) {
        if (responseData.rType === "Y") {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);
          setRcds({
            discipline: "",
            discId: "",
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
      setLoading(false);
      deleteCooldown.current = false;
      setShowSave(true);
      setTimeout(() => {
        setErrorMessageVisibleComponent(false);
        setErrorDivMessage("");
      }, 4000);
      setHighlightRow(false);
    }
  };
  const getData = async () => {
    try {
      const menuId = retrieveFromLocalStorage("activeMenuId");
      const ciphertext = encAESData(secretKey, { menuId });
      const response = await getList("hrms", "disciplineMaster", ciphertext);
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
              autoHeight: true,
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

  const viewRecord = async (discId) => {
    deleteCooldown.current = true;
    setErrorMessages("");
    try {
      const ciphertext = encAESData(secretKey, { discId });
      const response = await getViewRecord("hrms", "disciplineMaster", ciphertext);
      const responseData = response.data;

      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);
        const dataToRec = JSON.parse(decryptedData.recData);
        const dataToSet = dataToRec[0];
        setRcds({
          discId: dataToSet.discId,
          discipline: dataToSet.discipline,
          userId: s_userId.userId,
          publicIp: s_userId.publicIp,
        });
      } else {
        console.error("encryptData is undefined in the backend response.");
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  };

  const handleDelete = async (discId) => {
    deleteCooldown.current = true;
    setLoading(true); // Start loading state
    setShowSave(false);
    try {
      const ciphertext = encAESData(secretKey, { discId });
      const response = await getDelete("hrms", "disciplineMaster", ciphertext);
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
          const newData = prevTableData.filter((item) => item.discId !== discId);
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
      setHighlightRow(false);
    }
  };

  useEffect(() => {
    getData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const columnDefs = [
    {
      headerName: "Serial No.",
      field: "serialNo",
      sortable: true,
      filter: "agNumberColumnFilter",
      flex: 1,
      headerClass: "ag-header-cell", // Optional: add custom header class
      width: 100,
      cellStyle: { textAlign: "center" },
    },
    ...columnDefsApi,
    {
      headerName: "Action",
      field: "button",
      cellRenderer: (params) => (
        <>
          <span
            className="manipulation-icon edit-color mx-3"
            onClick={() => {
              const id = params.data.discId;
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
              setHighlightRow(true);
              if (!deleteCooldown.current) {
                const confirmDelete = window.confirm("Are you sure you want to delete this record?");
                if (confirmDelete) {
                  const id = params.data.discId;
                  setHighlightRow(true);
                  handleDelete(id);
                } else {
                  setHighlightRow(false); //changes
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
      cellClass: "ag-center-cols-cell", // Optional: center the edit icon
      width: 100,
      cellStyle: { textAlign: "center" },
    },
  ];
  //--------------------Search Data By Advance Search Option --------------------//
  // Update tableData whenever apiData changes
  useEffect(() => {
    if (columnDefsApi && columnDefsApi.length > 0) {
      setTableHeader(columnDefs);
    }
  }, [columnDefsApi]);
  const filterTableData = () => {
    const filteredData = rowData.filter((apiDataRec) => {
      const matchesDiscipline = searchRcds.discipline ? apiDataRec.discipline.toLowerCase().includes(searchRcds.discipline.toLowerCase()) : true;
      return matchesDiscipline;
    })
      .map((item, sno) => ({
        serialNo: sno + 1,
        discipline: item.discipline,
        discId: item.discId
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
                  <div className="col-md-4">
                    <FormText
                      autofocus={true}
                      label={data.rname}
                      name={data.discipline}
                      holder={data.rholder}
                      value={rcds[data.discipline]}
                      errorMessage={errorMessages.discipline}
                      onChange={handleChange}
                      icon={icon.default}
                      Maxlength={25}
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
                        showUpdate={!!rcds.discId}
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
              List of Discipline detail<span className="parenthesis">(</span>s
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
            }}>
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
                        label={data.rname}
                        name={data.discipline}
                        holder={data.rholder}
                        value={searchRcds[data.discipline]}
                        onChange={handleSearchChange}
                        icon={icon.user} // Example FontAwesome icon; change as needed
                        Maxlength={25}
                      />
                    </div>
                  </div>
                  <div className="row mb-3 offset-4">
                    <div className="col-md-6 d-flex">
                      <button className="me-1 btn btn-primary btn-color"
                        onClick={filterTableData}
                      >Search</button>
                      <button className="btn btn-warning btn-color ms-2"
                        onClick={
                          () => {
                            setSearchRcds({
                              marital: "",
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
export default DisciplineMaster;

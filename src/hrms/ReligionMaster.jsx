/**
 * @author Abhideep Pandey
 * @date  09/12/2024
 */

import React, { useEffect, useState, useRef, useContext } from "react";
import FormButton from '../components/FormButton'
import FormText from '../components/FormText'
import icon from '../properties/icon'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import ErrorMessageABD from "../components/ErrorMessageABD";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import { retrieveFromLocalStorage, retrieveFromCookies, storeInLocalStorage } from "../utils/CryptoUtils";

import {
  getDelete,
  getList,
  getSave,
  getUpdate,
  getViewRecord,
} from "../utils/api";
import AgGridTable from "../components/AgGridTable";
import Breadcrumbs from "../components/Breadcrumbs";
import { GlobalContext } from "../context/GlobalContextProvider";
import CustomModal from "../components/CustomModal";
import AdvanceSearchModal from "../components/AdvanceSearchModal";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import FilterTags from "../components/FilterTags";

const ReligionMaster = () => {


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

  const deleteCooldown = useRef(false);
  const [resetSelect, setResetSelect] = useState(false);
  const [modalIsOpen, setIsOpen] = React.useState(false);



  const [rcds, setRcds] = useState({
    religion: "",
    religionId: "",
    userId: "", // Initial value will be updated in useEffect
    publicIp: "", // Initial value will be updated in useEffect
  });
  const [searchRcds, setSearchRcds] = useState({
    religion: "",
  });
  const [showSave, setShowSave] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState({
    religion: "",
  });
  const [errorVisibleComponent, setErrorMessageVisibleComponent] =
    useState(false);
  const [errorType, setErrorType] = useState();
  const [errorDivMessage, setErrorDivMessage] = useState("");
  const data = {
    rname: "Religion",
    rholder: "Enter Religion",
    religion: "religion",
    save: "Save",
    delete: "Delete",
    update: "Update",
    back: "Back",
    reset: "Reset",
  };
  const saveButtonRef = useRef(null);

  const handleBack = () => {
    setHighlightRow(false); // changes

    deleteCooldown.current = false;
    if (saveButtonRef.current) {
      saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setRcds({
      religion: "",
      religionId: "",
      userId: "",
      publicIp: "",
    });
  };


  const secretKey = retrieveFromCookies("AESDecKey");

  const handleChange = (evt) => {
    const { name, value, type, checked } = evt.target;
    setRcds((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    }));


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

  const handleReset = () => {
    setRcds({
      religion: "",
      religionId: ""
    });
    setErrorMessages("");
  };

  const { checkResponseStatus } = useCheckResponseStatus();

  const validateFields = () => {
    const errors = {};
    if (!rcds.religion) errors.religion = "Religion is required";
    return errors;
  };

  const handleCreate = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setShowSave(false);
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
      userId: s_user.userId, // Ensure userId is included
      publicIp: s_user.publicIp, // Ensure publicIp is included
    };

    try {
      const ciphertext = encAESData(secretKey, updatedRcds);
      let responseData;

      if (rcds.religionId) {
        // Update case
        const response = await getUpdate(
          "hrms",
          "religionMaster",
          ciphertext
        );
        responseData = checkResponseStatus(response);
      } else {
        // Save case
        const response = await getSave("hrms", "religionMaster", ciphertext);
        responseData = checkResponseStatus(response);
      }

      if (responseData) {
        if (responseData.rType === "Y") {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);
          setRcds({
            religion: "",
            religionId: "",
            userId: rcds.userId,
            publicIp: rcds.publicIp,
          });
          setErrorType(true);
          setLoading(false);
        } else {
          setErrorType(false);
          setLoading(false);
        }
        setErrorDivMessage(responseData.rMessage);
        setErrorMessageVisibleComponent(true);
        setTimeout(() => {
          setErrorMessageVisibleComponent(false);
          setErrorDivMessage("");
        }, 4000);
        getData();
        setShowSave(true);
      }
    } catch (error) {
      console.error(error);
      setErrorType(false);
      setErrorDivMessage(error.message || "An error occurred");
      setErrorMessageVisibleComponent(true);

    } finally {
      setLoading(false);
      deleteCooldown.current(false);
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
      const menuId = retrieveFromLocalStorage("activeMenuId");
      const ciphertext = encAESData(secretKey, { menuId });

      // Send request to get the list
      const response = await getList(
        "hrms",
        "religionMaster",
        ciphertext);

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
              if (a.order_by < b.order_by) return -1;  // a comes before b if a.order_by is less than b.order_by
              if (a.order_by > b.order_by) return 1;   // b comes before a if a.order_by is greater than b.order_by
              return 0;                                 // if both are equal, no change in order
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
      getData();
    }, 500);

    setTimeout(() => {
      resetTable();
    }, 500);
  }, []);


  const viewRecord = async (religionId) => {
    deleteCooldown.current = true;
    try {
      setErrorMessages("");
      const ciphertext = encAESData(secretKey, { religionId });

      const response = await getViewRecord("hrms", "religionMaster", ciphertext);


      const responseData = checkResponseStatus(response);

      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);

        const dataToRec = JSON.parse(decryptedData.recData); // Assuming you want the first item

        const dataToSet = dataToRec[0];

        // Update rcds state with the decrypted data
        setRcds({
          religionId: dataToSet.religionId,
          religion: dataToSet.religion,
          userId: s_user.userId, // Set userId here
          publicIp: s_user.publicIp, // Set publicIp here
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
    deleteCooldown.current = true;
    setLoading(true); // Start loading state
    setShowSave(false);
    try {
      const ciphertext = encAESData(secretKey, id);
      const response = await getDelete(
        "hrms",
        "religionMaster",
        ciphertext
      );
      if (response.data.rType === "Y") {
        setErrorType(true);
        setErrorDivMessage(response.data.rMessage);
      } else {
        setErrorType(false);
        setErrorDivMessage(response.data.rMessage);
      }
      setErrorMessageVisibleComponent(true);
      getData();
    } catch (error) {
      console.error("Error deleting data:", error);
      setErrorType(false);
      setErrorDivMessage("Error deleting data.");
      setErrorMessageVisibleComponent(true);
    } finally {
      setLoading(false); // End loading state

      // Set the cooldown
      deleteCooldown.current = false;
      setTimeout(() => {
        setShowSave(true);
      }, 4000);
      setHighlightRow(false); // changes

    }

  };


  const [apiData, setApiData] = useState([]);
  const columnDefs = [
    {
      headerName: 'Serial No.',
      field: 'serialNo',
      sortable: false,
      filter: 'agNumberColumnFilter',
      width: 100,
      cellStyle: { textAlign: "center" },
      headerClass: 'ag-header-cell',  // Optional: add custom header class
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
              const id = params.data.religionId;  // Access the row data to get the roleId
              setHighlightRow(true); //changes
              viewRecord(id);  // Call viewRecord function with the id
              window.scrollTo({ top: 0, behavior: "smooth" });  // Scroll to the top
            }}
          >
            <FontAwesomeIcon icon={faEdit} className='icon-size' />
          </span>

          <span
            className={`manipulation-icon delete-color ${deleteCooldown ? 'disabled' : ''} mx-1`}
            onClick={() => {
              if (!deleteCooldown.current) {
                // Show confirmation alert
                const confirmDelete = window.confirm("Are you sure you want to delete this record?");
                if (confirmDelete) {
                  if (!deleteCooldown.current) {
                    setHighlightRow(true); //changes
                    const id = { religionId: params.data.religionId };  // Access row data to get the salId
                    handleDelete(id); // Call the handleDelete function with the salId
                  } else {
                    setHighlightRow(false); //changes
                  }
                }
              }
            }}
            style={{
              pointerEvents: deleteCooldown.current ? 'none' : 'auto', // Disable click
              opacity: deleteCooldown.current ? 0.5 : 1, // Make it visually dim when disabled
              cursor: deleteCooldown.current ? 'not-allowed' : 'pointer', // Change cursor to indicate disabled state
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
    }
  ];


  useEffect(() => {
    if (columnDefsApi && columnDefsApi.length > 0) {
      setTableHeader(columnDefs);
    }
  }, [columnDefsApi]);


  const filterTableData = () => {
    const filteredData = rowData
      .filter((apiDataRec) => {


        // Role name filter should only be applied if searchRcds.roleName is provided
        const matchesReligion = searchRcds.religion
          ? apiDataRec.religion
            .toLowerCase()
            .includes(searchRcds.religion.toLowerCase())
          : true; // If no roleName filter, include all role names

        return matchesReligion;
      })
      .map((item, sno) => ({
        serialNo: sno + 1,
        religion: item.religion,
        religionId: item.religionId
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


  ////////////////////////////////////////********Code for add remove headers********/////////////////////////////////////////////////////

  const [customModalIsOpen, setCustomModelIsOpen] = React.useState(false);

  function openModal() {
    setCustomModelIsOpen(true);
  }

  const [selectedValues, setSelectedValues] = useState([]);


  useEffect(() => { // changes
    resetTable();
  }, []);


  return (<>
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
                <div className="col-md-4">
                  <FormText
                    label={data.rname}
                    name={data.religion}
                    holder={data.rholder}
                    value={rcds[data.religion]}
                    errorMessage={errorMessages.religion}
                    onChange={handleChange}
                    icon={icon.default}
                    Maxlength={25}
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
                      showUpdate={!!rcds.religionId}
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
            List of Religion detail<span className="parenthesis">(</span>s
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
                  <div className="col-md-12">
                    <FormText
                      autofocus={true}
                      holder={data.rholder}
                      name={data.religion}
                      label={data.rname}
                      value={searchRcds[data.religion]}
                      onChange={handleSearchChange}
                      icon={icon.user} // Example icon (FontAwesome star icon)
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
                          religion: "",
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

  </>)
}
export default ReligionMaster
/**
 * @author VARUN RANA
 * @date  11/12/2024
 */
import React, { useEffect, useState, useRef, useContext} from "react";
import FormButton from '../components/FormButton'
import FormText from '../components/FormText'
import FormTextarea from '../components/FormTextarea'
import icon from '../properties/icon'
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import ErrorMessageABD from "../components/ErrorMessageABD";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import {retrieveFromLocalStorage,retrieveFromCookies, storeInLocalStorage} from "../utils/CryptoUtils";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import AdvanceSearchModal from "../components/AdvanceSearchModal";
import CustomModal from "../components/CustomModal";
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
import FilterTags from "../components/FilterTags";
const MajorHeadMaster = () => {
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
  
  const [errorMessages, setErrorMessages] = useState({
   mhname:"",
   mhcode:""
  }); // handling error


  const [rcds, setRcds] = useState({
    mhname: "",
    mhcode: "",
    mhid: "",
    createdBy: "",
    modifiedBy: "",
    userId: "", // Initial value will be updated in useEffect
    publicIp: "", // Initial value will be updated in useEffect
  });

  const [, setS_UserId] = useState({
    userId: "",
    publicIp: "",
  });

  const [searchRcds, setSearchRcds] = useState({
   mhname: "",
   mhcode:"",
   mhid: "",

  });

  const [showSave, setShowSave] = useState(true);
  const [loading, setLoading] = useState(false);

  // const [isDeleting, setIsDeleting] = useState(false);
  const { checkResponseStatus } = useCheckResponseStatus();
  const secretKey = retrieveFromCookies("AESDecKey");


  const data = {
    mhName: "Major Head Name",
    mhHolder: "Enter Major Head Name",
    mhname: "mhname",
    mhCode: "Major Head Code",
    mhcodeHolder: "Enter Major Head Code",
    mhcode: "mhcode",
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
      mhname: "",
      mhcode: "",
      mhid: "",
      // createdBy: "",
      // modifiedBy: "",
      userId: "", // Initial value will be updated in useEffect
      publicIp: "", // Initial value will be updated in useEffect
    });
    setResetSelect(true); // for dropdown search
    setIsEditing(false);
  };

  const handleReset = () => {
    setRcds({
      mhname: "",
      mhcode: "",
      mhid: "",
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
      if (!rcds.mhname) errors.mhname = "Major Head Name is required";
      if (!rcds.mhcode) errors.mhcode = "Major Head Code is required";
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


    // Prepare data for the API call, including userId and publicIp
    const updatedRcds = {
      ...rcds,
      userId: s_user.userId, // Ensure userId is included
      machine: s_user.publicIp, // Ensure publicIp is included
    };

    try {
      const ciphertext = encAESData(secretKey, updatedRcds);
      let responseData;

      if (rcds.mhid) {
        // Update case
        const response = await getUpdate(
          "budget",
          "MajorHeadMaster",
          ciphertext,
          "budget"
        );
        responseData = checkResponseStatus(response,'budget');
      } else {
        // Save case
        const response = await getSave("budget", "MajorHeadMaster", ciphertext);

        responseData = checkResponseStatus(response,'budget');
      }

      if (responseData) {
        if (responseData.rType === "Y") {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);
          setRcds({
            mhname: "",
            mhcode: "",
            mhid: "",
            userId: rcds.userId,
            publicIp: rcds.publicIp,
          });
          setResetSelect(true); // for dropdown search
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
      const menuId = retrieveFromLocalStorage("activeMenuId");
      const ciphertext = encAESData(secretKey, {menuId});
      const response = await getList(
        "budget",
        "MajorHeadMaster",
        ciphertext,
        "budget"
      );
      const responseData =checkResponseStatus(response,'budget');
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

  const viewRecord = async (mhid) => {
    deleteCooldown.current = true;
    
    try {
      setErrorMessages("");
      const ciphertext = encAESData(secretKey,{ mhid });
      const response = await getViewRecord("budget", "MajorHeadMaster", ciphertext,"budget");
      const responseData = checkResponseStatus(response,'budget');

      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);
        const dataToRec =JSON.parse(decryptedData.recData); // Assuming you want the first item
        const dataToSet = dataToRec[0];

        console.log(dataToSet,"response in viewrecord");
        
        setRcds({
          mhid: dataToSet.mhid,
          mhname: dataToSet.mhname,
          mhcode: dataToSet.mhcode,
          userId: s_user.userId, // Set userId here
          publicIp: s_user.publicIp, // Set publicIp here
          createdBy: dataToSet.createdBy ,
          modifiedBy: dataToSet.updatedBy 
        });

      } else {
        console.error("encryptData is undefined in the backend response.");
      }
    
    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  };


  const handleDelete = async (mhid) => {
    deleteCooldown.current = true;
    setShowSave(false);
    setLoading(true); // Start loading state 
      try {
        const ciphertext = encAESData(secretKey, {mhid});
        const response = await getDelete(
          "budget",
          "MajorHeadMaster",
          ciphertext,
          "budget"
        );
        const responseData = checkResponseStatus(response,'budget');
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
            .filter((item) => item.mhid !== mhid)
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
        setErrorType(false);
        setErrorDivMessage("Error deleting data.");
        setErrorMessageVisibleComponent(true);
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
    }
  



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
      cellStyle: { textAlign: "center" },  // Optional: add custom header class
    },
    
    ...columnDefsApi,
    {
      headerName: 'Action',
      field: 'button',
      enableMenu: true,
      cellRenderer: (params) => (

        <>
          <span
            className="manipulation-icon edit-color mx-3"
            onClick={() => {
              const id = params.data.mhid ;   // Access the row data to get the roleId
              viewRecord(id);  // Call viewRecord function with the id
              window.scrollTo({ top: 0, behavior: "smooth" });  // Scroll to the top
            }}
          >
            <FontAwesomeIcon icon={faEdit} className='icon-size' />
          </span>

          <span
            className={`manipulation-icon delete-color ${deleteCooldown ? 'disabled' : ''} mx-1`}
            onClick={() => {
              setHighlightRow(true);
              if (!deleteCooldown.current) {
                setHighlightRow(true); //changes
                // Show confirmation alert
                const confirmDelete = window.confirm(
                  "Are you sure you want to delete this record?"
                );
                if (confirmDelete) {
                  const id = params.data.mhid; // Access row data to get the salId
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
            <FontAwesomeIcon icon={faTrash} className='icon-size' />
          </span>

        </>
      ),
      sortable: false,
      filter: false,  // No filtering for actions columns
      // flex: 1,
      cellClass: {textAlign: "center"},  // Optional: center the edit icon
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
        // Define filter conditions
        const matchesmhname = searchRcds.mhname
          ? apiDataRec.mhname.includes(searchRcds.mhname)  : true;

          const matchesmhcode = searchRcds.mhcode
          ? apiDataRec.mhcode.includes(searchRcds.mhcode)  : true;


        // Role name filter should only be applied if searchRcds.roleName is provided
       
        return matchesmhname && matchesmhcode;
      })
      .map((item, sno) => ({
        serialNo: sno + 1,
        mhname: item.mhname,
        mhcode : item.mhcode,
        mhid: item.mhid
      }));

      setTableData(filteredData);
      setIsOpen(false);
  }
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
 
   const handleSelect = (values) => {
     setSelectedValues(values);
   };
 
  //  const newOptions = columnDefsApi.map((item) => ({
  //    value: item.headerName,
  //    label: item.headerName,
  //  }));
 
    //  function addRemoveColumns() {
    //    // Filter out the columns whose headerName is in selectedValues
    //    const newCustomHeader = columnDefs.filter((item) => {
    //      // Check if headerName of the current item is not in selectedValues
    //      return !selectedValues.includes(item.headerName);
    //    });
  
    //    // Return the filtered column definitions
    //    setTableHeader(newCustomHeader);
    //  }
  
  //  useEffect(() => {
  //    addRemoveColumns();
  //  }, [selectedValues]);
 
   useEffect(() => { // changes
     resetTable();
   }, []);



  return (<>
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
                          label={data.mhName}
                          name={data.mhname}
                          holder={data.mhHolder}
                          value={rcds[data.mhname]}
                          errorMessage={errorMessages.mhname}
                          onChange={handleChange}
                          icon={icon.user}
                          Maxlength={25}
                        />
                </div>
    
                <div className="col-md-6">
                <FormText
                          label={data.mhCode}
                          name={data.mhcode}
                          holder={data.mhcodeHolder}
                          value={rcds[data.mhcode]}
                          errorMessage={errorMessages.mhcode}
                          onChange={handleChange}
                          icon={icon.user}
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
                      showUpdate={!!rcds.mhid}
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
            List of Relation detail<span className="parenthesis">(</span>s
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
          {/* <i
            onClick={openModal}
            className={icon.magnifyingglass}
          > */}
    
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
                      holder={data.mhHolder}
                      name={data.mhname}
                      label={data.mhName}
                      value={searchRcds[data.mhname]}
                      // errorMessage={errorMessages.semester} // Pass the error message for roleLevel
                      onChange={handleSearchChange}
                      icon={icon.user} // Example icon (FontAwesome star icon)
                    />
                  </div>
                  <div className="col-md-6">
                    <FormText
                 
                      holder={data.mhcodeHolder}
                      name={data.mhcode}
                      label={data.mhCode}
                      value={searchRcds[data.mhcode]}
                      // errorMessage={errorMessages.semester} // Pass the error message for roleLevel
                      onChange={handleSearchChange}
                      icon={icon.user} // Example icon (FontAwesome star icon)
                    />
                  </div>
    
             
                </div>
    
                <div className="row mb-3 offset-4">
                  <div className="col-md-6">
                    <button
                      className="me-1 btn btn-primary bt-sm btn-color"
                      onClick={filterTableData}
                    >
                      Search
                    </button>
                    <button
                      className="btn btn-warning bt-sm btn-color ms-2"
                      onClick={() => {
                        setSearchRcds({
                         mhcode:"",
                         mhname:""
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
            className={`d-flex align-items-center p-2 border rounded-3 addRemoveButtoninCustomModal ${
              selectedValues.length === 0 ? "" : "addRemoveButtonHighlight"
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

export default MajorHeadMaster
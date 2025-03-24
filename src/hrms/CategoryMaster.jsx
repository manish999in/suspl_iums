

/**
 * @author VARUN RANA
 * @date  24/10/2024
 */

import React, { useEffect, useState, useRef, useContext } from "react";
import FormButton from '../components/FormButton'
import FormText from '../components/FormText'
import icon from '../properties/icon'
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import ErrorMessageABD from "../components/ErrorMessageABD";
import CreateUpdateBar from "../components/CreateUpdateBar";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import {
  getDelete,
  getList,
  getSave,
  getUpdate,
  getViewRecord,
} from "../utils/api";
import AgGridTable from "../components/AgGridTable";
import Breadcrumbs from "../components/Breadcrumbs";
import {retrieveFromLocalStorage,retrieveFromCookies, storeInLocalStorage} from "../utils/CryptoUtils";
import AdvanceSearchModal from '../components/AdvanceSearchModal';
import CustomModal from "../components/CustomModal";
import FormMultiSelect from "../components/FormMultiSelect";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import { GlobalContext } from "../context/GlobalContextProvider";
import FilterTags from "../components/FilterTags";

const CategoryMaster = () => {
  const [rcds, setRcds] = useState({
    category: "",
    category_id: "",
    createdBy: "",
    modifiedBy: "",
    userId: "", // Initial value will be updated in useEffect
    publicIp: "", // Initial value will be updated in useEffect
  });
  const [searchRcds, setSearchRcds] = useState({
    category:"",
  });
  const [resetSelect, setResetSelect] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const  deleteCooldown = useRef(false);
  const [showSave, setShowSave] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);

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
  const [errorMessages, setErrorMessages] = useState({
    category: "",
  });
  const [errorVisibleComponent, setErrorMessageVisibleComponent] =
    useState(false);
  const [errorType, setErrorType] = useState();
  const [errorDivMessage, setErrorDivMessage] = useState("");
  const data = {
    rname: "Category",
    rholder: "Enter Category",
    category: "category",
    save: "Save",
    delete: "Delete",
    update: "Update",
    back: "Back",
    reset: "Reset",
  };
  const saveButtonRef = useRef(null);

  const handleBack = () => {
    deleteCooldown.current = false;
    if (saveButtonRef.current) {
      saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setRcds({
      category: "",
      category_id: "",
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

  const handleReset = () => {
    setRcds({
      category: "",
      category_id: ""
    });
    setErrorMessages("");
  };

  const { checkResponseStatus } = useCheckResponseStatus();

  const handleSearchChange = (evt) => {
    const { name, value, type, checked } = evt.target;
    setSearchRcds((prevState) => ({
      ...prevState,
      [name]: value,
    }));

  };

  const validateFields = () => {
    const errors = {};
    if (!rcds.category) errors.category = "Category is required";
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
    
    try {
      console.log(updatedRcds, "--------------");
      // Encrypt the updated rcds with the userId
      const ciphertext = encAESData(secretKey, updatedRcds);
      console.log("Encrypted Data: ", ciphertext);

      let responseData;

      if (rcds.category_id) {
        // Update the existing record
        deleteCooldown.current = false;

        const response = await getUpdate(
                  "hrms",
                  "categoryMaster",
                  ciphertext
                );
        console.log("Update response from backend:", response.data);

        responseData = checkResponseStatus(response);
      } else {
        // Send data to the backend
        const response = await getSave("hrms", "categoryMaster", ciphertext);
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
      const menuId = {menuId:retrieveFromLocalStorage("activeMenuId")};
      console.log("MenueId: ", menuId);
      const ciphertext = encAESData(secretKey, menuId );

      const response = await getList(
              "hrms",
              "categoryMaster",
              ciphertext
            );

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

  const viewRecord = async (category_id) => {
    deleteCooldown.current = true;
    try {
      setErrorMessages("");
      const ciphertext = encAESData(secretKey, {category_id});

      const response = await getViewRecord("hrms", "categoryMaster", ciphertext);
      console.log("Full response from backend:", response);
      const responseData = checkResponseStatus(response);

      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);
        console.log("Decrypted Data:", decryptedData);
        console.log(decryptedData, "--------------")

        const dataToRec = JSON.parse(decryptedData.recData);

        const dataToSet = dataToRec[0];

        // Update rcds state with the decrypted data
        setRcds({
                  category_id: dataToSet.category_id,
                  category: dataToSet.category,
                  userId: s_user.userId, // Set userId here
                  publicIp: s_user.publicIp, // Set publicIp here
                  createdBy: `${dataToSet.createdBy ?? ""} ${dataToSet.createdDate}`,
                  modifiedBy: `${dataToSet.updatedBy ?? ""} ${dataToSet.updatedDate}`
                });
      } else {
        console.error("encryptData is undefined in the backend response.");
      }



    } catch (error) {
      console.error("Error retrieving data:", error);
    } finally {
    }
  };

  const handleDelete = async (category_id) => {
    deleteCooldown.current = true;
    setShowSave(false);
    setLoading(true); // Start loading state

    try {
      const ciphertext = encAESData(secretKey, { category_id });

      // Send the delete request to the backend
      const response = await getDelete(
                "hrms",
                "categoryMaster",
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
          .filter((item) => item.category_id !== category_id)
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

  useEffect(() => {
    getData();
    window.scrollTo({ top: 0, behavior: "smooth" });

  }, []);
  const [apiData, setApiData] = useState([]);
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
              const id =  params.data.category_id ;  // Access the row data to get the roleId
              viewRecord(id);  // Call viewRecord function with the id
              window.scrollTo({ top: 0, behavior: "smooth" });  // Scroll to the top
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
                  if (!deleteCooldown.current) {
                    const id =  params.data.category_id ;  // Access row data to get the salId
                    handleDelete(id); // Call the handleDelete function with the salId
                  }
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
      filter: false, // No filtering for actions columns
      cellStyle: { textAlign: "center" },
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
        // Define filter condition

        // Role name filter should only be applied if searchRcds.roleName is provided
        const matchesRoleName = searchRcds.category
          ? apiDataRec.category
              .toLowerCase()
              .includes(searchRcds.category.toLowerCase())
          : true; // If no roleName filter, include all role names

        // const matchesRoleLevel = searchRcds.alias
        //   ? apiDataRec.alias === searchRcds.alias
        //   : true;

        // Return true if both conditions are met
        return matchesRoleName;
      })
      .map((item, sno) => ({
        serialNo: sno + 1,
        category: item.category,
        category_id: item.category_id,
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

  //***************************************************** code for add to remove **********
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
      resetTable;
  }, [])
  


  return (<>
    <div className="rightArea">
       <div className="container-fluid px-1">
         <Breadcrumbs />
       </div>
   
       {/* Form Section */}
       <div className="container-body mx-3 mb-2">
         <form>
           <div className="row mb-3">
             <p className="card-title h6">Category Master</p>
           </div>
   
           <div className="card">
             <div className="card-body">
               {/* Input Field */}
               <div className="row mb-3">
                 <div className="col-md-6">
                 <FormText
                   autofocus={true}
                        label={data.rname}
                        name={data.category}
                        holder={data.rholder}
                        value={rcds[data.category]}
                        errorMessage={errorMessages.category}
                        onChange={handleChange}
                        icon={icon.default}
                        Maxlength={25}
                      />
                 </div>
               </div>
               {/* Buttons Section */}
               <div className="row">
                 <div className="col-md-12">
                {(  showSave && <FormButton
                          btnType1={data.save}
                          btnType3={data.update}
                          btnType4={data.back}
                          btnType5={data.reset}
                          onClick={handleCreate}
                          onBack={handleBack}
                          onReset={handleReset}
                          showUpdate={!!rcds.category_id}
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
       {/* Error Message Section */}
       {errorVisibleComponent && (
      
           <ErrorMessageABD
             text={errorDivMessage}
             isSuccess={errorType}
             isVisible={errorVisibleComponent}
             setVisible={setErrorMessageVisibleComponent}
           />
     
       )}
   
       {/* Table Section */}
       <div className="container-body mx-3 mb-3">
         <p className="h6 card-title list-header">
           <small>
             List of Category<span className="parenthesis">(</span>s
             <span className="parenthesis">)</span>
           </small>
         </p>
   
         {/* Refresh Button */}
         <div
           className="refresh-table"
           title="Refresh Data"
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
                        label={data.rname}
                        name={data.category}
                        holder={data.rholder}
                        value={searchRcds[data.category]}
                        // errorMessage={errorMessages.category}
                        onChange={handleSearchChange}
                        icon={icon.default}
                        Maxlength={25}
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
                     className="btn btn-warning btn-color btn-sm ms-2"
                     onClick={() => {
                       setSearchRcds({
                        category:""
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
   
         {/* Table Component */}
         <div className="ag-theme-alpine">
           <AgGridTable
            rowData={tableData}
            columnDefs={tableHeader}
            hardRefreshFlag={refreshAGGrid}
            setrefreshAGGrid={setrefreshAGGrid}
           />
         </div>
       </div>
     </div>
   </>)
}
export default CategoryMaster
/**
 * @Author by Abhishek
 * @date  18/11/2024
 */
import React, { useEffect, useState, useRef,useContext } from "react";
import FormButton from '../components/FormButton'
import FormText from '../components/FormText'
import icon from '../properties/icon'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Breadcrumbs from "../components/Breadcrumbs";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import ErrorMessageABD from "../components/ErrorMessageABD";
import CustomModal from "../components/CustomModal";
import AdvanceSearchModal from "../components/AdvanceSearchModal";
import FilterTags from "../components/FilterTags";
import { GlobalContext } from "../context/GlobalContextProvider";

import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import {
  getDelete,
  getList,
  getSave,
  getUpdate,
  getViewRecord,
} from "../utils/api";
import AgGridTable from "../components/AgGridTable";
import {retrieveFromLocalStorage,retrieveFromCookies, storeInLocalStorage} from "../utils/CryptoUtils";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import { width } from "@fortawesome/free-solid-svg-icons/fa0";

const ClassMaster=()=>{

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
  const [rcds, setRcds] = useState({
    className: "",
    classId: "",
    createdBy: "",
    modifiedBy: "",
    userId: "", // Initial value will be updated in useEffect
    publicIp: "", // Initial value will be updated in useEffect
  });
  const [searchRcds, setSearchRcds] = useState({
    className:"",
    classId: "",
  });


  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteCooldown = useRef(false);
  const [loading, setLoading] = useState(false);
  const [showSave, setShowSave] = useState(true);
  const [errorMessages, setErrorMessages] = useState({
   className: "",
  });
  const [errorVisibleComponent, setErrorMessageVisibleComponent] =
    useState(false);
  const [errorType, setErrorType] = useState();
  const [errorDivMessage, setErrorDivMessage] = useState("");

  const data = {
    cname: "Class",
    cholder: "Enter Class",
    className: "className",
    save: "Save",
    delete: "Delete",
    update: "Update",
    back: "Back",
    reset: "Reset",
  };
  const saveButtonRef = useRef(null);

  const handleBack = () => {

    setHighlightRow(false)
    deleteCooldown.current = false;
    if (saveButtonRef.current) {
      saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setRcds({
        className: "",
        classId: "",
      userId: "",
      publicIp: "",
    });
    setIsEditing(false);
  };
  
  const secretKey = retrieveFromCookies("AESDecKey");



  const handleChange = (evt) => {
    const { name, value, type, checked } = evt.target;
    setRcds((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,  //not need
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
        className:"",
      class_id:""
    });
    setErrorMessages("");
  };
   
  const { checkResponseStatus } = useCheckResponseStatus();

  const validateFields = () => {
    const errors = {};
    if (!rcds.className) errors.className = "Class Name is required";
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


    // Prepare data for the API call, including userId and publicIp
    const updatedRcds = {
      ...rcds,
      userId: s_user.userId, // Ensure userId is included
      publicIp: s_user.publicIp, // Ensure publicIp is included
    };

    try {
      const ciphertext = encAESData(secretKey, updatedRcds);
      let responseData;

      if (rcds.classId) {
        deleteCooldown.current = false;
        console.log("Data being sent:", updatedRcds); // Log the data to be sent
        // Update case
        const response = await getUpdate(
          "hrms",
          "classMaster",
          ciphertext
        );
        responseData = checkResponseStatus(response);
      } else {
        // Save case
        const response = await getSave("hrms", "classMaster", ciphertext);
        console.log("response in save in classMaster:",response);
        
        responseData = checkResponseStatus(response);
      }

      if (responseData) {
        

        if (responseData.rType === "Y") {
            const jsonData = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, jsonData);
          setRcds({
            className: "",
            classId: null,
            userId: rcds.userId,
            publicIp: rcds.publicIp,
          });
          // setResetSelect(true); // for dropdown search

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
      console.error(error);
      setErrorType(false);
      setErrorDivMessage(error.message || "An error occurred");
      setErrorMessageVisibleComponent(true);
      
    } finally {
      setShowSave(true);
      deleteCooldown.current = false;
      setLoading(false);
      setTimeout(() => {
        setErrorMessageVisibleComponent(false)
        setErrorDivMessage("");
      }, 4000); 
      setHighlightRow(false);
    }
  };

 
  const getData = async () => {
    try {
      const menuId = retrieveFromLocalStorage("activeMenuId");
      // Encrypt the searchRcds data
      const ciphertext = encAESData(secretKey, { menuId });

      // Send request to get the list
      const response = await getList(
        "hrms",
        "classMaster",
        ciphertext,
      );

      const responseData = checkResponseStatus(response);

      console.log(responseData);

      if (responseData.rType === "Y") {
        if (responseData.rData) {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);

          console.log("Decrypted data",decryptedData);

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


  const viewRecord = async (classId) => {
    deleteCooldown.current = true;
    try {
      setErrorMessages("");
      const ciphertext = encAESData(secretKey, { classId });

      const response = await getViewRecord("hrms", "classMaster", ciphertext);

      const responseData = checkResponseStatus(response);

      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);

        console.log("Decrypted Data ",decryptedData)

        const dataToRec = JSON.parse(decryptedData.recData); // Assuming you want the first item

        const dataToSet = dataToRec[0];

        // Update rcds state with the decrypted data
        setRcds({
          classId: dataToSet.classId,
          className: dataToSet.className,
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

const handleDelete = async (classId) => {
  deleteCooldown.current = true;
  setShowSave(false);
  setLoading(true);

  try {
    const ciphertext = encAESData(secretKey, {classId});
    const response = await getDelete("hrms", "classMaster", ciphertext);
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
        const newData = prevTableData.filter((item) => item.classId !== classId);
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
    setLoading(false);
    setShowSave(true);
    deleteCooldown.current = false;

    setTimeout(() => {
      setErrorMessageVisibleComponent(false);
      setErrorDivMessage("");
    }, 4000);
    setHighlightRow(false); //changes

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
        headerName: 'Serial No.',
        field: 'serialNo',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width:100,
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
                const id =  params.data.classId ;  // Access the row data to get the roleId
                setHighlightRow(true); //changes

                viewRecord(id);  // Call viewRecord function with the id
                window.scrollTo({ top: 0, behavior: "smooth" });  // Scroll to the top
              }}
            >
              <FontAwesomeIcon icon={faEdit} className='icon-size' />
            </span>
  
            <span
              className={`manipulation-icon delete-color ${
                deleteCooldown.current ? 'disabled' : ''} mx-1`}
              onClick={() => {
                setHighlightRow(true); //changes
                if (!deleteCooldown.current) {
                  setHighlightRow(true); //changes
                  // Show confirmation alert
                  const confirmDelete = window.confirm("Are you sure you want to delete this record?");
                  if (confirmDelete) {
                      setHighlightRow(true); //changes
                        const id = params.data.classId ;  // Access the row data to get the roleId
                        handleDelete(id); // Call the handleDelete function with the salId
                        setHighlightRow(false); //changes
                      }
                      else{
                        setHighlightRow(false);
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
    
      // class name filter should only be applied if searchRcds.className is provided
      const matchesRoleName = searchRcds.className
        ? apiDataRec.className.toLowerCase().includes(searchRcds.className.toLowerCase())
        : true; 


        
      // Return true if both conditions are met
      return  matchesRoleName;
    })
    .map((item, sno) =>({
        serialNo: sno + 1,
        className: item.className,
        classId: item.classId,
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

///////////////////////////////////********Code for add remove headers********/////////////////////////////////////////////////////


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
  // Filter out the columns whose headerName is in selectedValues
  const newCustomHeader = columnDefs.filter((item) => {
    // Check if headerName of the current item is not in selectedValues
    return !selectedValues.includes(item.headerName);
  });

  // Return the filtered column definitions
  setTableHeader(newCustomHeader);
}

useEffect(() => {
  addRemoveColumns();
}, [selectedValues])


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
               <div className="col-md-4">
                  <FormText
                   autofocus={true}
                  label={data.cname}
                   name={data.className}
                   holder={data.cholder}
                   value={rcds[data.className]}
                   errorMessage={errorMessages.className}
                   onChange={handleChange}
                   icon={icon.default}
                   Maxlength={25}
                 /> 
               </div>
             </div>
          
             <div className="row">
               <div className="col-md-12">
                 {showSave && 
                    <FormButton 
                    btnType1={data.save}
                    btnType3={data.update}
                    btnType4={data.back}
                    btnType5={data.reset}
                    onClick={handleCreate}
                    onBack={handleBack}
                    onReset={handleReset}
                    showUpdate={!!rcds.classId}
                    rcds={rcds}
                    loading={loading}
                  /> }
               
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
           List of Class detail<span className="parenthesis">(</span>s
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
                  label={data.cname}
                   name={data.className}
                   holder={data.cholder}
                   value={searchRcds[data.className]}
                   onChange={handleSearchChange}
                   icon={icon.default}
                   Maxlength={25}
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
                           className:"",
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
</>)
}
export default ClassMaster
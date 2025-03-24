import React, { useEffect, useRef, useState, useContext } from "react";

import "../styles/inputStyle.css";
import FormText from "../components/FormText";
import FormTextarea from "../components/FormTextarea";
import FormCheckbox from "../components/FormCheckbox";
import FormButton from "../components/FormButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import ErrorMessageABD from "../components/ErrorMessageABD";
import SelectComponent from "../components/SelectComponent"; // added for select
import { retrieveFromCookies } from "../utils/CryptoUtils";
import icon from "../properties/icon";
import AdvanceSearchModal from "../components/AdvanceSearchModal";
import {
  getDelete,
  getList,
  getSave,
  getUpdate,
  getViewRecord,
  getRecordByCount,
} from "../utils/api";
import Breadcrumbs from "../components/Breadcrumbs";
import AgGridTable from "../components/AgGridTable";
import { GlobalContext } from "../context/GlobalContextProvider";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import CustomModal from "../components/CustomModal";
import FilterTags from "../components/FilterTags";


const RoleMaster = () => {

  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [showSave, setShowSave] = useState(true);
  const [apiData, setApiData] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const { checkResponseStatus } = useCheckResponseStatus();
  const [isEditing, setIsEditing] = useState(false); // state initaialize
  // const [deleteCooldown, setDeleteCooldown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetSelect, setResetSelect] = useState(false); // State for manipulating dropdown and search

  const [errorVisibleComponent, setErrorMessageVisibleComponent] =
    useState(false);
  const [errorType, setErrorType] = useState();
  const [errorDivMessage, setErrorDivMessage] = useState("");

  const deleteCooldown = useRef(false);

  const [errorMessages, setErrorMessages] = useState({
    roleName: "",
    mappedAlias: "",
    roleLevel: "",
  }); // handling error

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

  // changes
  const [rcds, setRcds] = useState({
    role_id: "",
    roleName: "",
    mappedAlias: "",
    roleLevel: "",
    remarks: "",
    isAdmin: "",
    userId: "", // Initial value will be updated in useEffect
    publicIp: "", // Initial value will be updated in useEffect
    createdBy: "",
    modifiedBy: "",
  });

  const [searchRcds, setSearchRcds] = useState({
    roleName: "",
    roleLevel: "",
    isAdmin: "",
  });

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

  const saveButtonRef = useRef(null); // Reference for the Save button

  const data = {
    rName: "Role Name",
    rHolder: "Enter Names",
    roleName: "roleName",
    mAlias: "Mapped Alias",
    mHolder: "Enter Mapped Alias",
    mappedAlias: "mappedAlias",
    roleLevel: "Role Level",
    rlHolder: "Select Role Level",
    remarks: "Remarks",
    placeholder: "Enter Remarks",
    remark: "remarks",
    isAdmin: "Is Admin Role?",
    save: "Save",
    delete: "Delete",
    update: "Update",
    back: "Back",
    reset: "Reset",
    roleNameLength: "60",
    mAliasLength: "10",
    remarkslength: "255",
  };
  const handleBack = () => {
    // Scroll back to the save button

    deleteCooldown.current = false;
    if (saveButtonRef.current) {
      saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // Alternatively, clear form data and reset state if needed
    setRcds({
      role_id: "",
      roleName: "",
      mappedAlias: "",
      roleLevel: "",
      remarks: "",
      isAdmin: "",
      userId: "",
    });
    setResetSelect(true); // for dropdown search

    setResponseMessage(""); // Clear any displayed messages

    setIsEditing(false);
  };

  const roleLevelOptions = [
    { value: "L1", label: "Level 1" },
    { value: "L2", label: "Level 2" },
    { value: "L3", label: "Level 3" },
  ];

  const handleReset = () => {
    // Reset rcds to its initial state
    setRcds({
      role_id: rcds.role_id,
      roleName: "",
      mappedAlias: "",
      roleLevel: "",
      remarks: "",
      isAdmin: "",
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
    if (!rcds.roleName) errors.roleName = "Role Name is required";
    if (!rcds.mappedAlias) errors.mappedAlias = "Mapped Alias is required";
    if (!rcds.roleLevel) errors.roleLevel = "Role Level is required";
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

    const updatedRcds = {
      ...rcds, // Spread the existing fields from rcds
      userId: s_user.userId, // Include userId
      publicIp: s_user.publicIp, // Include publicIp
    };

    try {
      // Encrypt the updated rcds with the userId
      const ciphertext = encAESData(secretKey, updatedRcds);

      let responseData;

      if (rcds.role_id) {
        // Update the existing record
        deleteCooldown.current = false;
        const  response = await getUpdate("user", "roleMaster", ciphertext);
        responseData = checkResponseStatus(response);
      } else {
        // Send data to the backend
        const  response = await getSave("user", "roleMaster", ciphertext);
        responseData = checkResponseStatus(response);
      }

      if (responseData) {
        // Check if the operation was successful
        if (responseData.rType === "Y") {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);

          // Clear the form fields by resetting rcds to its initial state
          setRcds({
            role_id: null,
            roleName: "",
            mappedAlias: "",
            roleLevel: "",
            remarks: "",
            isAdmin: "",
            userId: rcds.userId,
            publicIp: rcds.publicIp,
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

  const getData = async () => {
      try {
        const ciphertext = encAESData(secretKey, searchRcds);
  
        // Send request to get the list
        const  response = await getList("user", "roleMaster", ciphertext);
  
        console.log("Full response from backend: getList", response);
        const responseData = checkResponseStatus(response);
  
        console.log(responseData);
  
        if (responseData.rType === "Y") {
          if (responseData.rData) {
            const jsonData = JSON.parse(responseData.rData);
            const decryptedData = decAESData(secretKey, jsonData);
            console.log(decryptedData);
  
            let updatedData = [];
            if (decryptedData.recData) {
  
              // Add serialNo to the data
              updatedData = JSON.parse(decryptedData.recData).map((item, index) => ({
                ...item,
                serialNo: index + 1, // Auto-increment serialNo
              }));
            }
            setRowData(updatedData);
            setApiData(updatedData);
          }
        }
        else {
          if (responseData.rData === "no data available") {
            setApiData([]);
          }
        }
  
        setResponseMessage(
          "Data sent successfully: " + JSON.stringify(responseData)
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setResponseMessage("Error fetching data: " + error.message);
      }
    };

  useEffect(() => {
    getData();
    window.scrollTo({ top: 0, behavior: "smooth" });

  }, []);

  const viewRecord = async (role_id) => {

    deleteCooldown.current = true;
    try {
      setErrorMessages("");
      const ciphertext = encAESData(secretKey, { role_id });

      const response = await getViewRecord("user", "roleMaster", ciphertext);
      const responseData = checkResponseStatus(response);

      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);
        console.log("Decrypted Data in view:", decryptedData);

        const dataToSet = JSON.parse(decryptedData.recData)[0]; // Assuming you want the first item

        // Update rcds state with the decrypted data
        setRcds({
          role_id: dataToSet.roleId,
          roleName: dataToSet.roleName,
          mappedAlias: dataToSet.mappedAlias,
          roleLevel: dataToSet.roleLevel,
          remarks: dataToSet.remarks,
          isAdmin: dataToSet.adminRole, // Adjust based on your checkbox logic
          // createdBy: `${dataToSet.createdBy} ${dataToSet.createdDate}`,
          // modifiedBy:
          //   dataToSet.updatedBy && dataToSet.updatedDate
          //     ? `${dataToSet.updatedBy} ${dataToSet.updatedDate}`
          //     : " ",
          userId: s_userId.userId, // Use userId from s_userId
          publicIp: s_userId.publicIp, // Use publicIp from s_userId
        });
        setIsEditing(true);
      } else {
        console.error("encryptData is undefined in the backend response.");
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
    } finally {
    }
  };

  const handleDelete = async (role_id) => {

    console.log("////////////////////////////////", role_id);

    setIsDeleting(true);
    setShowSave(false)
    let response;
    setLoading(true);
    if (!isEditing) {
      try {
        const ciphertext = encAESData(secretKey, { role_id });
        response = await getDelete("user", "roleMaster", ciphertext, {});
        console.log("Delete response from backend:", response.data);
        const responseData = checkResponseStatus(response);
        if (responseData.rData) {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);
          console.log("Decrypted Data:", decryptedData);
        } else {
          console.error("encryptData is undefined in the backend response.");
        }
        getData(); // Refresh the table data
        if (responseData.rType === "Y") {
          setErrorMessageVisibleComponent(true);
          setErrorType(true);
          setErrorDivMessage(response.data.rMessage);
        } else {
          setErrorMessageVisibleComponent(true);
          setErrorType(false);
          setErrorDivMessage(response.data.rMessage);
        }
      } catch (error) {
        console.error("Error deleting data:", error);
        setErrorMessageVisibleComponent(true);
        setErrorType(false);
        setErrorDivMessage(response.data.rMessage);
        setShowSave(true);
        setTimeout(() => {
          deleteCooldown.current = false

          setLoading(false);
          setIsDeleting(false);
        }, 4000);
      }
      finally {
        setLoading(false);
        setIsDeleting(false);
        setShowSave(true)
        // Set the cooldown
        setTimeout(() => {
          deleteCooldown.current = false;
        }, 4000);
      }
    }
  };

 

  const columnDefs = [
    {
      headerName: 'Serial No.',
      field: 'serialNo',
      sortable: true,
      width: 100,
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "Role Name",
      field: "roleName",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      flex: 2,
      width: 150,
    },
    {
      headerName: "Mapped Alias",
      field: "mappedAlias",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      flex: 1,
      width: 150,
    },
    {
      headerName: "Role Level",
      field: "roleLevel",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      flex: 1,
      width: 150,
    },
    {
      headerName: "Admin Role",
      field: "adminRole",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      flex: 1,
      width: 150,
    },
    {
      headerName: "Remarks",
      field: "remarks",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      flex: 2,
      width: 150,
    },
    {
      headerName: 'Action',
      field: 'button',
      cellRenderer: (params) => (
        <>
          <span
            className="manipulation-icon edit-color mx-3"
            onClick={() => {
              const id = params.data.roleId;
              viewRecord(id);
              window.scrollTo({ top: 0, behavior: "smooth" });  // Scroll to the top
            }}
          >
            <FontAwesomeIcon icon={faEdit} className='icon-size' />
          </span>

          <span
            className={`manipulation-icon delete-color ${deleteCooldown.current ? 'disabled' : ''} mx-1`}
            onClick={(e) => {
              e.preventDefault();

              if (window.confirm("Are you sure you want to delete this record?")) {
                if (!deleteCooldown.current) {
                  const id = params.data.roleId;
                  handleDelete(id);
                }
              } else {

              }
            }}
            style={{
              pointerEvents: isEditing || deleteCooldown.current ? 'none' : 'auto',
              opacity: isEditing || deleteCooldown.current ? 0.5 : 1,
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
      width: 150,
    },
  ];

  ;

  useEffect(() => {
    resetTable();
}, []);

  useEffect(() => {
    if (columnDefsApi && columnDefsApi.length > 0) {
      setTableHeader(columnDefs);
    }
  }, [columnDefsApi]);


  const filterTableData = () => {
    console.log("dfidjsfjdki",rowData);
    
    const filteredData = rowData
      .filter((apiDataRec) => {
        const matchesAdminRole = searchRcds.isAdmin
          ? apiDataRec.adminRole === searchRcds.isAdmin
          : true;
          console.log(matchesAdminRole,"[[[[[[[[[[[[[[[[[[[[[[[[[[");
          
        const matchesRoleName = searchRcds.roleName
          ? apiDataRec.roleName
            .toLowerCase()
            .includes(searchRcds.roleName.toLowerCase())
          : true;

        const matchesRoleLevel = searchRcds.roleLevel
          ? apiDataRec.roleLevel === searchRcds.roleLevel
          : true;

        return matchesAdminRole && matchesRoleName && matchesRoleLevel;
      })
      .map((item, sno) => ({
        serialNo: sno + 1,
        roleName: item.roleName,
        mappedAlias: item.mappedAlias,
        roleLevel: item.roleLevel,
        adminRole: item.adminRole === "Y" ? "Yes" : "No",
        remarks: item.remarks,
        role_id: item.roleId,
      }));

    console.log(filteredData, "------------------------------------");

  setApiData(filteredData);
    setIsOpen(false);
    // setRowData(filteredData)
  };

  useKeyboardShortcut(
    "S",
    (e) => {
      handleCreate(e);
    },
    { ctrl: true }
  );

  useKeyboardShortcut(
    "R",
    () => {

      setReloadTableFlag(true);
      resetTable(); // Now `e` is available here

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
    setApiData(rowData);
    setSelectedValues([]);  
  };

  /////////////////////////////////// ******** Code for add remove headers ******** /////////////////////////////////////////////////////


  const [customModalIsOpen, setCustomModelIsOpen] = React.useState(false);

  function openModal() {
    setCustomModelIsOpen(true);
  }

  const [selectedValues, setSelectedValues] = useState([]);

  useEffect(() => {
    columnDefs;
  }, []);


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
              <p className="card-title h6">Role Master</p>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <FormText
                      autofocus={true}
                      label={data.rName}
                      name={data.roleName}
                      holder={data.rHolder}
                      value={rcds[data.roleName] || ''}
                      errorMessage={errorMessages.roleName}
                      onChange={handleChange}
                      icon={icon.user}
                      Maxlength={data.roleNameLength}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormText
                      label={data.mAlias}
                      name={data.mappedAlias}
                      holder={data.mHolder}
                      value={rcds[data.mappedAlias] || ''}
                      errorMessage={errorMessages.mappedAlias}
                      onChange={handleChange}
                      icon={icon.mapAlias}
                      Maxlength={data.mAliasLength}
                    />
                  </div>

                  <div className="col-md-6">
                    <SelectComponent
                      label={data.roleLevel}
                      name={data.roleLevel}
                      selectedValue={rcds.roleLevel}
                      resetValue={resetSelect}
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          roleLevel: value,
                        }))
                      }
                      errorMessage={errorMessages.roleLevel}
                      icon={icon.arrowDown}
                      options={roleLevelOptions}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormTextarea
                      holder={data.placeholder}
                      name={data.remark}
                      label={data.remarks}
                      value={rcds[data.remark] || ''}
                      onChange={handleChange}
                      Maxlength={data.remarkslength}
                    />
                  </div>
                </div>

                <div className="col-md-2">
                  <FormCheckbox
                    label={data.isAdmin}
                    checked={rcds.isAdmin === 'Y'}
                    onChange={(evt) => {
                      const { checked } = evt.target;
                      setRcds((prevState) => ({
                        ...prevState,
                        isAdmin: checked ? 'Y' : 'N',
                      }));
                    }}
                    errorMessage={errorMessages.isAdmin}
                  />
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
                        showUpdate={!!rcds.role_id}
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
            setVisible={setErrorMessageVisibleComponent}
          />
        )}

        <div className="container-body mx-3 mb-3">
          <p className="h6 card-title list-header">
            <small>
              List of Role Master<span className="parenthesis">(</span>s
              <span className="parenthesis">)</span>
            </small>
          </p>

          <div
            className="refresh-table "
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
              setIsOpen={setIsOpen}
            >
              <div className="card advanceSearchModal">
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <FormText
                        label={data.rName}
                        name={data.roleName}
                        holder={data.rHolder}
                        value={searchRcds[data.roleName] || ''}
                        onChange={handleSearchChange}
                        icon={icon.user}
                        Maxlength={data.roleNameLength}
                      />
                    </div>

                    <div className="col-md-4">
                      <SelectComponent
                        label={data.isAdmin}
                        name={data.isAdmin}
                        selectedValue={searchRcds.isAdmin}
                        resetValue={resetSelect}
                        onSelects={(value) =>
                          setSearchRcds((prevState) => ({
                            ...prevState,
                            isAdmin: value,
                          }))
                        }
                        icon={icon.arrowDown}
                        options={[
                          { value: 'Y', label: 'Yes' },
                          { value: 'N', label: 'No' },
                        ]}
                      />
                    </div>

                    <div className="col-md-4">
                      <SelectComponent
                        label={data.roleLevel}
                        name={data.roleLevel}
                        selectedValue={searchRcds.roleLevel}
                        resetValue={resetSelect}
                        onSelects={(value) =>
                          setSearchRcds((prevState) => ({
                            ...prevState,
                            roleLevel: value,
                          }))
                        }
                        icon={icon.arrowDown}
                        options={roleLevelOptions}
                      />
                    </div>
                  </div>

                  <div className="row mb-3 offset-4">
                    <div className="col-md-6">
                      <button
                        className="me-1 btn btn-primary btn-sm btn-color"
                        onClick={filterTableData}
                      >
                        Search
                      </button>
                      <button
                        className="btn btn-warning btn-color btn-sm ms-2"
                        onClick={() => {
                          setSearchRcds({
                            roleName: "",
                            roleLevel: "",
                            isAdmin: "",
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
              className={`d-flex align-items-center p-2 border rounded-3 addRemoveButtoninCustomModal ${selectedValues.length === 0 ? '' : 'addRemoveButtonHighlight'
                }`}
              tabIndex={1}
              onClick={openModal}
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
                      columnDefsApi={columnDefs}
                      setTableHeader={setTableHeader}
                      selectedValues={selectedValues}
                      setSelectedValues={setSelectedValues}
                    />
                  </div>
                </div>
              </div>
            </CustomModal>

            <AgGridTable
                rowData={apiData}
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

export default RoleMaster;

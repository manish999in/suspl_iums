import React, { useEffect, useState, useRef, useContext } from "react";
import { getDelete, getList, getSave, getUpdate, getViewRecord } from "../utils/api";
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
import FormCheckbox from "../components/FormCheckbox";
import SelectComponent from "../components/SelectComponent";

function YearOfAdmission() {
    const [customModalIsOpen, setCustomModelIsOpen] = React.useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setIsOpen] = React.useState(false);
    const [errorVisibleComponent, setErrorMessageVisibleComponent] = useState(false);
    const [errorType, setErrorType] = useState();
    const [errorDivMessage, setErrorDivMessage] = useState("");
    const [showSave, setShowSave] = useState(true);
    const { checkResponseStatus } = useCheckResponseStatus();
    const saveButtonRef = useRef(null);
    const [resetSelect, setResetSelect] = useState(false);
    const [selectedValues, setSelectedValues] = useState([]);
    const deleteCooldown = useRef(false);
    const secretKey = retrieveFromCookies("AESDecKey");
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
    const data = {
        fromDateLabel: "From Date",
        fromDateName: "fromDate",
        toDateLabel: "To Date",
        toDateName: "toDate",
        yearOfAdmissionLabel: "Year Of Admission",
        yearOfAdmissionName: "session",
        yearOfAdmissionCodeLabel: "Year Of Admission Code",
        yearOfAdmissionCodeName: "code",
        remarksLabel: "Remarks",
        remarksName: "remarks",
        isActiveLabel: "Is Active",
        isActiveName: "isActive",
        isCurrentSessionLabel: "Is Current Session",
        isCurrentSessionName: "isCurrent",
        save: "Save",
        delete: "Delete",
        update: "Update",
        back: "Back",
        reset: "Reset",
    }
    const [rcds, setRcds] = useState({
        id: "",
        fromDate: "",
        toDate: "",
        session: "",
        code: "",
        remarks: "",
        isActive: "",
        isCurrent: ""
    })
    const [errorMessages, setErrorMessages] = useState({
        fromDate: "",
        toDate: "",
        session: "",
        code: "",
    })
    const [searchRcds, setSearchRcds] = useState({
        session: "",
        code: "",
        isActive: "",
    });
    const handleChange = (evt) => {
        const { name, value, type, checked } = evt.target;
        setRcds((prevState) => ({
            ...prevState,
            [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
        }));
        setErrorMessages((prevErrors) => ({
            ...prevErrors,
            [name]: "",
        }));

    };
    // This useEffect is used to reterive year from fromDate ans set in session
    useEffect(() => {
        if (rcds.fromDate) {
            const year = rcds.fromDate.split("-")[0];
            if (year) {
                setRcds((prevState) => ({
                    ...prevState,
                    session: year,
                }));
            }
        }
    }, [rcds.fromDate]);

    const handleSearchChange = (evt) => {
        const { name, value } = evt.target;
        setSearchRcds((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };
    const convertDateFormet = (dateStr) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-"); // Split by "/"
        return `${day}/${month}/${year}`; // Rearrange into yyyy-mm-dd
    };
    const handleBack = () => {
        setHighlightRow(false); // changes
        deleteCooldown.current = false;
        if (saveButtonRef.current) {
            saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
        }
        setRcds({
            id: "",
            fromDate: "",
            toDate: "",
            session: "",
            code: "",
            remarks: "",
            isActive: "",
            isCurrent: ""
        });
        setResetSelect(true);
        setIsEditing(false);
    };
    const handleReset = () => {
        setRcds({
            id: "",
            fromDate: "",
            toDate: "",
            session: "",
            code: "",
            remarks: "",
            isActive: "",
            isCurrent: ""
        });
        setResetSelect(true);
        setErrorMessages("");
    };
    const validateFields = () => {
        const errors = {};
        if (!rcds.fromDate) errors.fromDate = "From Date is required!";
        if (!rcds.toDate) errors.toDate = "To Date is required!";
        if (!rcds.session) errors.session = "Year Of Admission is required!";
        if (!rcds.code) errors.code = "Year Of Admission Code is required!";
        return errors;
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
            isActive: rcds.isActive === "Y" ? "Y" : "N",
            isCurrent: rcds.isCurrent === "Y" ? "Y" : "N",
        };
        console.log("Updated Data: ", updatedRcds);
        
        try {
            const ciphertext = encAESData(secretKey, updatedRcds);
            if (rcds.id) {
                // Update case
                deleteCooldown.current = false;
                const response = await getUpdate("exam", "yearOfAdmissionMaster", ciphertext);
                responseData = checkResponseStatus(response);
            } else {
                // Save case
                const response = await getSave("exam", "yearOfAdmissionMaster", ciphertext);
                responseData = checkResponseStatus(response);
            }

            if (responseData) {
                if (responseData.rType === "Y") {
                    const jsonData = JSON.parse(responseData.rData);
                    const decryptedData = decAESData(secretKey, jsonData);
                    setRcds({
                        id: null,
                        fromDate: "",
                        toDate: "",
                        session: "",
                        code: "",
                        remarks: "",
                        isActive: "",
                        isCurrent: "",
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
    const handleDelete = async (id) => {
        deleteCooldown.current = true;
        setLoading(true);
        try {
            const ciphertext = encAESData(secretKey, { id });
            const response = await getDelete("exam", "yearOfAdmissionMaster", ciphertext);
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

                setTimeout(() => {
                    setErrorMessageVisibleComponent(false);
                    setErrorDivMessage("");
                }, 4000);

                setTableData((prevTableData) => {
                    const newData = prevTableData.filter((item) => item.id !== id);
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
            deleteCooldown.current = false;
            setTimeout(() => {
                setErrorMessageVisibleComponent(false);
                setErrorDivMessage("");
            }, 4000);
            setHighlightRow(false); //changes
        }
    };
    const getData = async () => {
        try {
            const menuId = retrieveFromLocalStorage("activeMenuId");
            const ciphertext = encAESData(secretKey, { menuId });

            // Send request to get the list
            const response = await getList("exam", "yearOfAdmissionMaster", ciphertext, {});
            const responseData = checkResponseStatus(response);
            if (responseData.rType === "Y") {
                if (responseData.rData) {
                    const jsonData = JSON.parse(responseData.rData);
                    const decryptedData = decAESData(secretKey, jsonData);
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
    const viewRecord = async (id) => {
        deleteCooldown.current = true;
        setErrorMessages("");
        try {
            const ciphertext = encAESData(secretKey, { id });
            const response = await getViewRecord("exam", "yearOfAdmissionMaster", ciphertext);
            const responseData = checkResponseStatus(response);
            if (responseData.rData) {
                const recJson = JSON.parse(responseData.rData);
                const decryptedData = decAESData(secretKey, recJson);
                const dataToRec = JSON.parse(decryptedData.recData);
                const dataToSet = dataToRec[0];
                setRcds({
                    id: dataToSet.id,
                    fromDate: dataToSet.fromDate,
                    toDate: dataToSet.toDate,
                    session: dataToSet.session,
                    code: dataToSet.code,
                    remarks: dataToSet.remarks,
                    isActive: dataToSet.isActive,
                    isCurrent: dataToSet.isCurrent,
                    userId: s_user.userId,
                    publicIp: s_user.publicIp,
                });
            } else {
                console.error("encryptData is undefined in the backend response.");
            }
        } catch (error) {
            console.error("Error retrieving data:", error);
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
                            const id = params.data.id;
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
                                    const id = params.data.id; // Access row data to get the salId
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
            const matchesSession = searchRcds.session ? apiDataRec.session.toLowerCase() === searchRcds.session.toLowerCase() : true;
            const matchCode = searchRcds.code ? String(apiDataRec.code || '').toLowerCase() === searchRcds.code.toLowerCase() : true;
            const matchIsActive = searchRcds.isActive ? apiDataRec.isActive === searchRcds.isActive : true;
            return matchesSession && matchCode && matchIsActive;
        }).map((item, sno) => ({
                serialNo: sno + 1,
                fromDate: item.fromDate,
                toDate: item.toDate,
                session: item.session,
                code: item.code,
                remarks: item.remarks,
                isActive: item.isActive,
                isCurrent: item.isCurrent,
                id: item.id
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
                    <form action="">
                        <p className="card-title h6">{retrieveFromLocalStorage("pageName")}</p>
                        <div className="card">
                            <div className="card-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <FormText
                                            autofocus={true}
                                            type="Date"
                                            label={data.fromDateLabel}
                                            holder={data.fromDateLabel}
                                            name={data.fromDateName}
                                            value={rcds[data.fromDateName]}
                                            errorMessage={errorMessages.fromDate}
                                            onChange={handleChange}
                                            icon={icon.user}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <FormText
                                            type="Date"
                                            label={data.toDateLabel}
                                            holder={data.toDateLabel}
                                            name={data.toDateName}
                                            value={rcds[data.toDateName]}
                                            errorMessage={errorMessages.toDate}
                                            onChange={handleChange}
                                            icon={icon.user}
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <FormText
                                            label={data.yearOfAdmissionLabel}
                                            holder={data.yearOfAdmissionLabel}
                                            name={data.yearOfAdmissionLabel}
                                            value={rcds[data.yearOfAdmissionName]}
                                            errorMessage={errorMessages.YearOfAdmission}
                                            onChange={handleChange}
                                            icon={icon.user}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <FormText
                                            type="Number"
                                            label={data.yearOfAdmissionCodeLabel}
                                            holder={data.yearOfAdmissionCodeLabel}
                                            name={data.yearOfAdmissionCodeName}
                                            value={rcds[data.yearOfAdmissionCodeName]}
                                            errorMessage={errorMessages.code}
                                            onChange={handleChange}
                                            icon={icon.user}
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <FormTextarea
                                            label={data.remarksLabel}
                                            holder={data.remarksLabel}
                                            name={data.remarksName}
                                            value={rcds[data.remarksName]}
                                            onChange={handleChange}
                                            icon={icon.user}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <FormCheckbox
                                            label={data.isActiveLabel}
                                            checked={rcds.isActive === "Y"}
                                            onChange={(evt) => {
                                                if (evt && evt.target) {
                                                    const { checked } = evt.target;
                                                    setRcds((prevState) => ({
                                                        ...prevState,
                                                        isActive: checked ? "Y" : "N",
                                                    }));
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <FormCheckbox
                                            label={data.isCurrentSessionLabel}
                                            checked={rcds.isCurrent === "Y"}
                                            onChange={(evt) => {
                                                if (evt && evt.target) {
                                                    const { checked } = evt.target;
                                                    setRcds((prevState) => ({
                                                        ...prevState,
                                                        isCurrent: checked ? "Y" : "N",
                                                    }));
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        {
                                            <FormButton
                                                btnType1={data.save}
                                                btnType3={data.update}
                                                btnType4={data.back}
                                                btnType5={data.reset}
                                                onClick={handleCreate}
                                                onBack={handleBack}
                                                onReset={handleReset}
                                                showUpdate={!!rcds.id}
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
                    <p className='h6 card-title list-header'> <small> List of Year Admission Master<span className='parenthesis'>(</span>s<span className='parenthesis'>)</span></small></p>
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
                                        <div className="col-md-6">
                                            <FormText
                                                autofocus={true}
                                                label={data.yearOfAdmissionLabel}
                                                name={data.yearOfAdmissionName}
                                                holder={data.yearOfAdmissionLabel}
                                                value={searchRcds[data.yearOfAdmissionName]}
                                                onChange={handleSearchChange}
                                                icon={icon.user}
                                                Maxlength={25}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <FormText
                                                label={data.yearOfAdmissionCodeLabel}
                                                name={data.yearOfAdmissionCodeName}
                                                holder={data.yearOfAdmissionCodeLabel}
                                                value={searchRcds[data.yearOfAdmissionCodeName]}
                                                onChange={handleSearchChange}
                                                icon={icon.user}
                                                Maxlength={25}
                                            />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <SelectComponent
                                                label={data.isActiveLabel}
                                                name={data.isActiveName}
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
                                    <div className="row mb-3 offset-4 ">
                                        <div className="col-md-6 d-flex">
                                            <button className="me-1 btn btn-primary btn-color" onClick={filterTableData}>Search</button>
                                            <button className="btn btn-warning btn-color ms-2"
                                                onClick={
                                                    () => {
                                                        setSearchRcds({
                                                            session: "",
                                                            code: "",
                                                            isActive: "",
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
    )
}

export default YearOfAdmission
/**
 * @author NITESH KUMAR
 * @date  13/11/2024
 */
import React, { useContext, useEffect, useRef, useState } from 'react';
import icon from "../properties/icon";
import FormText from "../components/FormText";
import FormButton from "../components/FormButton";
import SelectComponent from "../components/SelectComponent";
import ErrorMessageABD from "../components/ErrorMessageABD";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import { getDataApi, getDelete, getList, getSave, getUpdate, getViewRecord } from "../utils/api";
import AgGridTable from "../components/AgGridTable";
import Breadcrumbs from '../components/Breadcrumbs';
import { retrieveFromLocalStorage, retrieveFromCookies } from "../utils/CryptoUtils";
import AdvanceSearchModal from '../components/AdvanceSearchModal';
import CustomModal from '../components/CustomModal';
import useKeyboardShortcut from '../hooks/useKeyboardShortcut';
import { GlobalContext } from "../context/GlobalContextProvider";
import FilterTags from '../components/FilterTags';

function FinancialMaster() {
    const saveButtonRef = useRef(null);
    const [showSave, setShowSave] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorDivMessage, setErrorDivMessage] = useState("");
    const [errorType, setErrorType] = useState();
    const [isEditing, setIsEditing] = useState(false);
    const [errorVisibleComponent, setErrorMessageVisibleComponent] = useState(false);
    const { checkResponseStatus } = useCheckResponseStatus();
    const [resetSelect, setResetSelect] = useState(false);
    const [modalIsOpen, setIsOpen] = React.useState(false);
    const [selectedValues, setSelectedValues] = useState([]);
    const [customModalIsOpen, setCustomModelIsOpen] = React.useState(false);
    const deleteCooldown = useRef(false);
    const [dateRanges, setDateRanges] = useState({});
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
        id: "",
        year: "",
        toDate: "",
        fromDate: "",
        createdBy: "",
        modifiedBy: "",
        userId: "",
        publicIp: "",
    });
    const [errorMessages, setErrorMessages] = useState({
        year: "",
    });
    const [searchRcds, setSearchRcds] = useState({
        status: "",
        toDate: "",
        fromDate: "",
    });
    const [yearOptions, setYearOptions] = useState(
        [{ value: "", label: "Select Year" }]
    );
    const data = {
        nYear: "year",
        lYear: "Year",
        nFromData: "fromDate",
        lFromData: "From Date",
        nToData: "toDate",
        lToDate: "To Date",
        nStatus: "status",
        lStatus: "Status",
        save: "Save",
        update: "Update",
        reset: "Reset",
        back: "Back"
    };
    const handleSearchChange = (evt) => {
        const { name, value, type, checked } = evt.target;
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

    // useEffect to monitor changes
    useEffect(() => {
        if (rcds.year && dateRanges[rcds.year]) {
            const selectedYearData = dateRanges[rcds.year];
            if (selectedYearData) {
                setRcds((prevState) => ({
                    ...prevState,
                    fromDate: selectedYearData.from,
                    toDate: selectedYearData.to,
                }));
            }
        } else if (rcds.year) {
            setRcds((prevState) => ({
                ...prevState,
                fromDate: "",
                toDate: "",
            }));
        }
    }, [rcds.year, dateRanges]);

    const handleBack = () => {
        setHighlightRow(false); // changes
        deleteCooldown.current = false;
        if (saveButtonRef.current) {
            saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
        }
        // Alternatively, clear form data and reset state if needed
        setRcds({
            id: "",
            year: "",
            fromDate: "",
            toDate: "",
            userId: "",
            publicIp: "",
        });
        setResetSelect(true);
        setIsEditing(false);

    };

    const handleReset = () => {
        setRcds({
            id: "",
            year: "",
            toDate: "",
            fromDate: ""
        });
        setErrorMessages("");
        setResetSelect(true);
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

    // Move validateFields declaration before it's called
    const validateFields = () => {
        const errors = {};
        if (!rcds.year) errors.year = "Year field is required";
        return errors;
    };

    const handleCreate = async (evt) => {
        evt.preventDefault();
        setLoading(true);
        setShowSave(false);
        // Call the validation function after it's declared
        const errors = validateFields();
        if (Object.keys(errors).length > 0) {
            setErrorMessages(errors);
            setLoading(false);
            setShowSave(true);
            return;
        }

        const updatedRcds = {
            ...rcds,
            userId: s_user.userId, // Include userId
            publicIp: s_user.publicIp, // Include publicIp
        };
        let responseData;
        try {
            const ciphertext = encAESData(secretKey, updatedRcds);
            if (rcds.id) {
                // Update case
                deleteCooldown.current = false;
                const response = await getUpdate("hrms", "financialYear", ciphertext);
                responseData = checkResponseStatus(response);
            } else {
                // Save case
                const response = await getSave("hrms", "financialYear", ciphertext);
                responseData = checkResponseStatus(response);
            }
            if (responseData) {
                if (responseData.rType === "Y") {
                    const jsonData = JSON.parse(responseData.rData);
                    const decryptedData = decAESData(secretKey, jsonData);
                    setRcds({
                        fromDate: "",
                        toDate: "",
                        year: "",
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
                setIsEditing(false);
                setErrorDivMessage(responseData.rMessage);
                setErrorMessageVisibleComponent(true); // Show the message
                getData();
                getDropdownData();
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
            const ciphertext = encAESData(secretKey, { menuId });
            const response = await getList("hrms", "financialYear", ciphertext);
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
                    console.log("Data: ", updatedData)
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


    const getDropdownData = async () => {
        try {
            const ciphertext = encAESData(secretKey, { flag: "year" });
            const response = await getDataApi("hrms", "financialYear", ciphertext);
            const responseData = response.data;
            if (responseData.rData) {
                const jsonData = JSON.parse(responseData.rData);
                const decryptedData = decAESData(secretKey, jsonData);
                const yearOptions = decryptedData.recData.map(year => ({
                    value: year,
                    label: year.toString()
                }));
                setYearOptions([{ value: "", label: "Select Year" }, ...yearOptions]);
                const newDateRanges = {};
                decryptedData.recData.forEach(year => {
                    newDateRanges[year] = {
                        from: `01/04/${year}`,
                        to: `31/03/${parseInt(year) + 1}`,
                    };
                });
                setDateRanges(newDateRanges); // Update date ranges
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };


    const handleDelete = async (year) => {
        deleteCooldown.current = true;
        setLoading(true); // Start loading state
        setShowSave(false);
        try {
            const ciphertext = encAESData(secretKey, { year });
            const response = await getDelete("hrms", "financialYear", ciphertext);
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
                    .filter((item) => item.year !== year)
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
            deleteCooldown.current = false;
            setTimeout(() => {
                setErrorMessageVisibleComponent(false);
                setErrorDivMessage("");
            }, 4000);
            setHighlightRow(false); //changes
        }
    };
    const viewRecord = async (year) => {
        deleteCooldown.current = true;
        setErrorMessages("");
        try {
            const ciphertext = encAESData(secretKey, { year });
            const response = await getViewRecord("hrms", "financialYear", ciphertext);
            const responseData = checkResponseStatus(response);

            if (responseData.rData) {
                const recJson = JSON.parse(responseData.rData);
                const decryptedData = decAESData(secretKey, recJson);
                const dataToRec = JSON.parse(decryptedData.recData);
                const dataToSet = dataToRec[0];

                setRcds({
                    id: dataToSet.year,
                    year: dataToSet.year,
                    fromDate: dataToSet.fromDate,
                    toDate: dataToSet.toDate,
                    userId: s_userId.userId, // Set userId here
                    publicIp: s_userId.publicIp, // Set publicIp here
                });
                setYearOptions([{ value: dataToSet.year, label: dataToSet.year }, ...yearOptions]);
            } else {
                console.error("encryptData is undefined in the backend response.");
            }
        } catch (error) {
            console.error("Error retrieving data:", error);
        }
    };
    useEffect(() => {
        getData();
        getDropdownData();
        window.scrollTo({ top: 0, behavior: "smooth" });

    }, []);

    const columnDefs = [
        {
            headerName: 'Serial No.',
            field: 'serialNo',
            sortable: true,
            filter: 'agNumberColumnFilter',
            flex: 1,
            width: 100,
            cellStyle: { textAlign: "center" },
            headerClass: 'ag-header-cell',  // Optional: add custom header class
        },
        ...columnDefsApi,
        {
            headerName: 'Action',
            field: 'button',
            cellRenderer: (params) => {
                if (params.data.status === "In-Active") {
                    return (
                        <>
                            {/* Edit Icon */}
                            <span
                                className="manipulation-icon edit-color mx-3"
                                onClick={() => {
                                    const id = params.data.year;
                                    setHighlightRow(true);
                                    viewRecord(id);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                            >
                                <FontAwesomeIcon icon={faEdit} className="icon-size" />
                            </span>

                            {/* Delete Icon */}
                            <span
                                className={`manipulation-icon delete-color ${deleteCooldown.current ? 'disabled' : ''} mx-1`}
                                onClick={() => {
                                    if (!deleteCooldown.current) {
                                        const confirmDelete = window.confirm("Are you sure you want to delete this record?");
                                        if (confirmDelete) {
                                            const id = params.data.year;
                                            setHighlightRow(true);
                                            handleDelete(id);
                                            setHighlightRow(false);
                                        } else {
                                            setHighlightRow(false);
                                        }

                                    }
                                }}
                                style={{
                                    pointerEvents: isEditing || deleteCooldown.current ? 'none' : 'auto', // Disable click
                                    opacity: isEditing || deleteCooldown.current ? 0.5 : 1, // Dim when disabled
                                    cursor: isEditing || deleteCooldown.current ? 'not-allowed' : 'pointer', // Indicate disabled
                                }}
                            >
                                <FontAwesomeIcon icon={faTrash} className="icon-size" />
                            </span>
                        </>
                    );
                }
                return null; // No icons if status is not "active"
            },
            sortable: false,
            filter: false, // No filtering for actions columns
            cellClass: 'ag-center-cols-cell', // Center the edit and delete icons
            width: 150,
            cellStyle: { textAlign: "center" },

        }
    ];
    // Update tableData whenever apiData changes
    useEffect(() => {
        if (columnDefsApi && columnDefsApi.length > 0) {
            setTableHeader(columnDefs);
        }
    }, [columnDefsApi]);
    const convertDateToYYYYMMDD = (dateStr) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-"); // Split by "/"
        return `${day}/${month}/${year}`; // Rearrange into yyyy-mm-dd
    };
    const filterTableData = () => {
        const filteredData = rowData.filter((apiDataRec) => {
            const matchesStatus = searchRcds.status ? apiDataRec.status === searchRcds.status : true;
            const matchesFromDate = convertDateToYYYYMMDD(searchRcds.fromDate) ? apiDataRec.fromDate === convertDateToYYYYMMDD(searchRcds.fromDate) : true;
            const matchesToDate = convertDateToYYYYMMDD(searchRcds.toDate) ? apiDataRec.toDate === convertDateToYYYYMMDD(searchRcds.toDate) : true;
            return matchesStatus && matchesFromDate && matchesToDate;
        }).map((item, sno) => ({
            serialNo: sno + 1,
            year: item.year,
            fromDate: item.fromDate,
            toDate: item.toDate,
            status: item.status,
            id: item.year,

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
    data
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
                    <form>
                        <div className="col-6">
                            <p className="card-title h6">{retrieveFromLocalStorage("pageName")}</p>
                        </div>
                        <div className="card">
                            <div className="card-body">
                                <div className="row mb-3">
                                    <div className="col-md-4">
                                        <SelectComponent
                                            autofocus={true}
                                            label={data.lYear}
                                            name={data.nYear}
                                            errorMessage={errorMessages.year}
                                            selectedValue={rcds.year}
                                            options={yearOptions}
                                            onChange={handleChange}   //also passed as prop to select component 
                                            icon={icon.default}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    year: value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <FormText
                                            label={data.lFromData}
                                            name={data.nFromData}
                                            holder={data.lFromData}
                                            value={rcds.fromDate}
                                            onChange={handleChange}
                                            icon={icon.calender}
                                            isDisable={true}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <FormText
                                            label={data.lToDate}
                                            name={data.nToData}
                                            holder={data.lToDate}
                                            value={rcds.toDate}
                                            onChange={handleChange}
                                            icon={icon.calender}
                                            isDisable={true}
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
                    <p className="h6 card-title list-header">
                        {" "}
                        <small>
                            {" "}
                            List of Financial Year Details<span className="parenthesis">(</span>s
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
                                        <div className="col-md-6">
                                            <FormText
                                                autofocus={true}
                                                label={data.lFromData}
                                                name={data.nFromData}
                                                holder={data.lFromData}
                                                value={searchRcds[data.nFromData]}
                                                onChange={handleSearchChange}
                                                icon={icon.calender} // Example FontAwesome icon; change as needed
                                                Maxlength={25}
                                                type="date"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <FormText
                                                label={data.lToDate}
                                                name={data.nToData}
                                                holder={data.lToDate}
                                                value={searchRcds[data.nToData]}
                                                onChange={handleSearchChange}
                                                icon={icon.calender} // Example FontAwesome icon; change as needed
                                                Maxlength={25}
                                                type="date"
                                            />
                                        </div>
                                    </div>
                                    <div className="row md-3">
                                        <div className="col-md-4">
                                            <SelectComponent
                                                label={data.lStatus}
                                                name={data.nStatus}
                                                selectedValue={searchRcds.status}
                                                resetValue={resetSelect}
                                                onSelects={(value) =>
                                                    setSearchRcds((prevState) => ({
                                                        ...prevState,
                                                        status: value,
                                                    }))
                                                }
                                                icon={icon.arrowDown} // Example icon class for FontAwesome
                                                options={[
                                                    { value: "Active", label: "Active" },
                                                    { value: "In-Active", label: "In-Active" },
                                                ]}
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
                                                            status: "",
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
}

export default FinancialMaster;

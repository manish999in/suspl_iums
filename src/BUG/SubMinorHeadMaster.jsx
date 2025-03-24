import React, { useContext, useEffect, useRef, useState } from 'react'
import { retrieveFromCookies, retrieveFromLocalStorage } from '../utils/CryptoUtils'
import FormText from '../components/FormText'
import Breadcrumbs from '../components/Breadcrumbs'
import icon from '../properties/icon'
import SelectComponent from '../components/SelectComponent'
import ErrorMessageABD from '../components/ErrorMessageABD'
import { GlobalContext } from '../context/GlobalContextProvider'
import useCheckResponseStatus from '../hooks/useCheckResponseStatus'
import AgGridTable from '../components/AgGridTable'
import CustomModal from '../components/CustomModal'
import AdvanceSearchModal from '../components/AdvanceSearchModal'
import useKeyboardShortcut from '../hooks/useKeyboardShortcut'
import FilterTags from '../components/FilterTags'
import FormButton from '../components/FormButton'
import { getDelete, getDropDown, getList, getSave, getUpdate, getViewRecord } from '../utils/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";



const SubMinorHeadMaster = () => {
    const [customModalIsOpen, setCustomModelIsOpen] = React.useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setIsOpen] = React.useState(false);
    const [errorVisibleComponent, setErrorMessageVisibleComponent] = useState(false);
    const [errorType, setErrorType] = useState();
    const [errorDivMessage, setErrorDivMessage] = useState("");
    const { checkResponseStatus } = useCheckResponseStatus();
    const saveButtonRef = useRef(null);
    const [resetSelect, setResetSelect] = useState(false);
    const [selectedValues, setSelectedValues] = useState([]);
    const deleteCooldown = useRef(false);
    const [majorHeadRcds, setMajorHeadRcds] = useState([{ value: "", label: "" },]);
    const [minorHeadRcds, setMinorHeadRcds] = useState([{ value: "", label: "" },]);
    const [subMajorHeadRcds, setSubMajorHeadRcds] = useState([{ value: "", label: "" },]);
    const [subMinorHeadRcds, setSubMinorHeadRcds] = useState([{ value: "", label: "" },]);

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
        majorHead: "",
        subMajorHead: "",
        minorHead: "",
    });
    const [searchRcds, setSearchRcds] = useState({
        majorHead: "",
        subMajorHead: "",
        minorHead: "",
        subMinorHead: ""
    });
    const [rcds, setRcds] = useState({
        subMinorHeadId: "",
        majorHead: "",
        subMajorHead: "",
        minorHead: "",
        subMinorHead: "",
        subMinorHeadCode: "",
    });
    const data = {
        majorHeadName: "majorHead",
        majorHeadLabel: "Major Head",
        majorHeadHolder: "Select Major Head",
        subMajorHeadName: "subMajorHead",
        subMajorHeadLabel: "Sub Major Head",
        subMajorHeadHolder: "Select Sub Major Head",
        minorHeadName: "minorHead",
        minorHeadLabel: "Minor Head",
        minorHeadHolder: "Select Minor Head",
        subMinorHeadName: "subMinorHead",
        subMinorHeadLabel: "Sub Minor Head Name",
        subMinorHeadHolder: "Enter Sub Minor Head Name",
        subMinorHeadCodeName: "subMinorHeadCode",
        subMinorHeadCodeLable: "Sub Minor Head Code",
        subMinorHeadCodeHolder: "Enter Sub Minor Head Code",
        subMinorHeadSelect: "Select Sub Minor Head",
        subMinorHeadLabelSelect: "Sub Minor Head",

        save: "Save",
        delete: "Delete",
        update: "Update",
        back: "Back",
        reset: "Reset",
    }
    const handleSearchChange = (evt) => {
        const { name, value } = evt.target;
        setSearchRcds((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };
    const secretKey = retrieveFromCookies("AESDecKey");
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
        if (!rcds.majorHead) errors.majorHead = "Major Head is required";
        if (!rcds.subMajorHead) errors.subMajorHead = "Sub Major Head is required";
        if (!rcds.minorHead) errors.minorHead = "Minor Head is required";
        return errors;
    };
    const handleReset = () => {
        setRcds({
            majorHead: "",
            subMajorHead: "",
            minorHead: "",
            subMinorHead: "",
            subMinorHeadCode: ""
        });
        setErrorMessages("");
    };
    // Handle back action
    const handleBack = () => {
        setHighlightRow(false); // changes
        deleteCooldown.current = false;
        if (saveButtonRef.current) {
            saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
        }
        setRcds({
            subMinorHeadId: "",
            majorHead: "",
            subMajorHead: "",
            minorHead: "",
            subMinorHead: "",
            subMinorHeadCode: "",
            userId: "",
            publicIp: "",
        });
        setIsEditing(false);
    };
    const handleCreate = async (evt) => {
        let responseData;
        evt.preventDefault(); // Prevent default form submission
        setLoading(true); // Start loading state

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
            // Encrypt the updated rcds with the userId
            const ciphertext = encAESData(secretKey, updatedRcds);
            if (rcds.subMinorHeadId) {
                // Update the existing record
                const response = await getUpdate("budget", "SubMinorHeadMaster", ciphertext,"budget");
                responseData = checkResponseStatus(response);
            } else {
                // Send data to the backend
                const response = await getSave("budget", "SubMinorHeadMaster", ciphertext,"budget");
                responseData = checkResponseStatus(response);
            }
            if (responseData) {
                if (responseData.rType === "Y") {
                    const jsonData = JSON.parse(responseData.rData);
                    const decryptedData = decAESData(secretKey, jsonData);
                    setRcds({
                        // Replace with your initial state for rcds
                        subMinorHeadId: "",
                        majorHead: "",
                        subMajorHead: "",
                        minorHead: "",
                        subMinorHead: "",
                        subMinorHeadCode: "",
                        userId: rcds.userId,
                        publicIp: rcds.publicIp,
                    });
                    setErrorMessageVisibleComponent(true);
                    setErrorType(true);
                    setErrorDivMessage(responseData.rMessage);
                } else {
                    setErrorMessageVisibleComponent(true);
                    setErrorType(true);
                    setErrorDivMessage(responseData.rMessage);
                }
                getData();
            }
            else {
                setErrorMessageVisibleComponent(true);
                setErrorDivMessage(responseData.rMessage);
                setTimeout(() => {
                    setErrorMessageVisibleComponent(false);
                    setErrorDivMessage("");
                }, 4000);

            }
        } catch (error) {
            console.error("Error during create/update:", error);
        } finally {
            setLoading(false);
            deleteCooldown.current = false;
            setTimeout(() => {
                setErrorMessageVisibleComponent(false);
                setErrorDivMessage("");
            }, 4000);
            setHighlightRow(false);
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

            // Send request to get the list
            const response = await getList("budget", "SubMinorHeadMaster", ciphertext, "budget");
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

    const handleDelete = async (subMinorHeadId) => {
        deleteCooldown.current = true;
        setLoading(true);
        try {
            const ciphertext = encAESData(secretKey, { subMinorHeadId });
            const response = await getDelete("budget", "SubMinorHeadMaster", ciphertext,"budget");
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
                    const newData = prevTableData.filter((item) => item.subMinorHeadId !== subMinorHeadId);
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
    const viewRecord = async (govtBudgetHeadId) => {
        deleteCooldown.current = true;
        setErrorMessages("");
        try {
            const ciphertext = encAESData(secretKey, { govtBudgetHeadId });
            const response = await getViewRecord("budget", "SubMinorHeadMaster", ciphertext,"budget");
            const responseData = checkResponseStatus(response);
            if (responseData.rData) {
                const recJson = JSON.parse(responseData.rData);
                const decryptedData = decAESData(secretKey, recJson);
                const dataToRec = JSON.parse(decryptedData.recData);
                const dataToSet = dataToRec[0];
                setRcds({
                    subMinorHeadId: dataToSet.subMinorHeadId,
                    majorHead: dataToSet.majorHeadId,
                    subMajorHead: dataToSet.subMajorHeadId,
                    minorHead: dataToSet.minorHeadId,
                    subMinorHead: dataToSet.subMinorHead,
                    subMinorHeadCode: dataToSet.subMinorHeadCode,
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
        getData();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const majorHeadDropdown = {
        table: "major_head_master",
        fields: "MAJOR_HEAD_ID, MAJOR_HEAD_NAME",
        condition: "1=1",
        orderBy: " ",
    }

    const minorHeadDropdown = {
        table: "minor_head_master",
        fields: "MINOR_HEAD_ID, MINOR_HEAD_NAME",
        condition: "1=1",
        orderBy: " ",
    }
    const subMajorHeadDropdown = {
        table: "sub_major_head_master",
        fields: "SUB_MAJOR_HEAD_ID, SUB_MAJOR_HEAD_NAME",
        condition: "1=1",
        orderBy: " ",
    }
    const subMinorHeadDropdown = {
        table: "sub_minor_head_master",
        fields: "SUB_MINOR_HEAD_ID, SUB_MINOR_HEAD_NAME",
        condition: "1=1",
        orderBy: " ",
    }
    const getMajorHeadDropdownData = async () => {
        getDropDown(majorHeadDropdown, majorHeadRcds, setMajorHeadRcds, "common", secretKey,"budget")
    }
    const getMinorHeadDropdownData = async () => {
        getDropDown(minorHeadDropdown, minorHeadRcds, setMinorHeadRcds, "common", secretKey,"budget");
    }

    const getSubMajorHeadDropdown = async () => {
        getDropDown(subMajorHeadDropdown, subMajorHeadRcds, setSubMajorHeadRcds, "common", secretKey,"budget");
    }
    const getSubMinorHeadDropdown = async () => {
        getDropDown(subMinorHeadDropdown, subMinorHeadRcds, setSubMinorHeadRcds, "common", secretKey,"budget")
    }
    useEffect(() => {
        getSubMajorHeadDropdown();
        getMajorHeadDropdownData();
        getMinorHeadDropdownData();
        getSubMinorHeadDropdown();
    }, []);
    const columnDefs = [
        {
            headerName: 'Serial No.',
            field: 'serialNo',
            // sortable: true,
            // filter: 'agNumberColumnFilter',
            // flex: 1,
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
                            const id = params.data.govtBudgetHeadId;
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
                                    const id = params.data.subMinorHeadId; // Access row data to get the salId
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
            width: 100,
            cellStyle: { textAlign: "center" },
        }
    ]
    //--------------------Search Data By Advance Search Option --------------------//
    useEffect(() => {
        if (columnDefsApi && columnDefsApi.length > 0) {
            setTableHeader(columnDefs);
        }
    }, [columnDefsApi]);

    const filterTableData = () => {
        const filteredData = rowData.filter((apiDataRec) => {
            const matchMajorHead = searchRcds.majorHead ? apiDataRec.majorHeadId === searchRcds.majorHead : true;
            const matchSubMajorHead = searchRcds.subMajorHead ? apiDataRec.subMajorHeadId === searchRcds.subMajorHead : true;
            const matchMinorHead = searchRcds.minorHead ? apiDataRec.minorHeadId === searchRcds.minorHead : true;
            const matchSubMinorHead = searchRcds.subMinorHead ? apiDataRec.subMinorHeadId === searchRcds.subMinorHead : true;

            return matchMajorHead && matchMinorHead && matchSubMinorHead && matchSubMajorHead;
        }).map((item, sno) => ({
            serialNo: sno + 1,
            majorHead: item.majorHead,
            minorHead: item.minorHead,
            subMajorHead: item.subMajorHead,
            subMinorHead: item.subMinorHead,
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
                    <form action="" className='mb-5'>
                        <div className="col-6">
                            <p className="card-title h6">{retrieveFromLocalStorage("pageName")}</p>
                        </div>
                        <div className="card">
                            <div className="card-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <SelectComponent
                                            autofocus={true}
                                            label={data.majorHeadLabel}
                                            name={data.majorHeadName}
                                            holder={data.majorHeadHolder}
                                            selectedValue={rcds.majorHead}
                                            options={majorHeadRcds}
                                            errorMessage={errorMessages.majorHead}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    majorHead: value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <SelectComponent
                                            label={data.subMajorHeadLabel}
                                            name={data.subMajorHeadName}
                                            holder={data.subMajorHeadHolder}
                                            selectedValue={rcds.subMajorHead}
                                            options={subMajorHeadRcds}
                                            errorMessage={errorMessages.subMajorHead}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    subMajorHead: value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <SelectComponent
                                            label={data.minorHeadLabel}
                                            name={data.minorHeadName}
                                            holder={data.minorHeadHolder}
                                            selectedValue={rcds.minorHead}
                                            options={minorHeadRcds}
                                            errorMessage={errorMessages.minorHead}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    minorHead: value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <FormText
                                            label={data.subMinorHeadLabel}
                                            name={data.subMinorHeadName}
                                            holder={data.subMinorHeadHolder}
                                            value={rcds[data.subMinorHeadName]}
                                            errorMessage={errorMessages.subMinorHeadName}
                                            onChange={handleChange}
                                            icon={icon.user}
                                            Maxlength={225}
                                        />
                                    </div>
                                </div>
                                <div className="row md-3">
                                    <div className="col-md-6">
                                        <FormText
                                            label={data.subMinorHeadCodeLable}
                                            name={data.subMinorHeadCodeName}
                                            holder={data.subMinorHeadCodeHolder}
                                            value={rcds[data.subMinorHeadCodeName]}
                                            errorMessage={errorMessages.subMinorHeadCode}
                                            onChange={handleChange}
                                            icon={icon.user}
                                            Maxlength={225}
                                        />
                                    </div>
                                </div>
                                <div className="row mt-3">
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
                                                showUpdate={!!rcds.subMinorHeadId}
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
                    <p className='h6 card-title list-header'> <small> List of Government Budget Head<span className='parenthesis'>(</span>s<span className='parenthesis'>)</span></small></p>
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
                                            <SelectComponent
                                                autofocus={true}
                                                label={data.majorHeadLabel}
                                                name={data.majorHeadName}
                                                holder={data.majorHeadHolder}
                                                selectedValue={rcds.majorHead}
                                                options={majorHeadRcds}
                                                errorMessage={errorMessages.majorHead}
                                                onChange={handleSearchChange}
                                                onSelects={(value) =>
                                                    setSearchRcds((prevState) => ({
                                                        ...prevState,
                                                        majorHead: value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <SelectComponent
                                                label={data.subMajorHeadLabel}
                                                name={data.subMajorHeadName}
                                                holder={data.subMajorHeadHolder}
                                                selectedValue={rcds.subMajorHead}
                                                options={subMajorHeadRcds}
                                                errorMessage={errorMessages.subMajorHead}
                                                onChange={handleSearchChange}
                                                onSelects={(value) =>
                                                    setSearchRcds((prevState) => ({
                                                        ...prevState,
                                                        subMajorHead: value,
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <SelectComponent
                                                label={data.minorHeadLabel}
                                                name={data.minorHeadName}
                                                holder={data.minorHeadHolder}
                                                selectedValue={rcds.subMajorHead}
                                                options={minorHeadRcds}
                                                errorMessage={errorMessages.minorHead}
                                                onChange={handleChange}
                                                onSelects={(value) =>
                                                    setSearchRcds((prevState) => ({
                                                        ...prevState,
                                                        minorHead: value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <SelectComponent
                                                label={data.subMinorHeadLabelSelect}
                                                name={data.minorHeadName}
                                                holder={data.subMinorHeadSelect}
                                                selectedValue={rcds.subMinorHead}
                                                options={subMinorHeadRcds}
                                                errorMessage={errorMessages.minorHead}
                                                onChange={handleSearchChange}
                                                onSelects={(value) =>
                                                    setSearchRcds((prevState) => ({
                                                        ...prevState,
                                                        subMinorHead: value,
                                                    }))
                                                }
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
                                                            minorHead: "",
                                                            subMinorHead: "",
                                                            majorHead: "",
                                                            subMajorHead: ""
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

export default SubMinorHeadMaster
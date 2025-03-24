import React, { useEffect, useState, useRef, useContext } from "react";
import Breadcrumbs from "../components/Breadcrumbs"
import FormText from "../components/FormText"
import FormTextarea from "../components/FormTextarea"
import icon from "../properties/icon"
import FormButton from "../components/FormButton";
import DynamicTable from "../components/DynamicTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AgGridTable from "../components/AgGridTable";
import ErrorMessageABD from "../components/ErrorMessageABD";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import { error } from "jquery";
import { retrieveFromCookies, retrieveFromLocalStorage } from "../utils/CryptoUtils";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { GlobalContext } from "../context/GlobalContextProvider";
import FilterTags from "../components/FilterTags";
import CustomModal from "../components/CustomModal";
import AdvanceSearchModal from "../components/AdvanceSearchModal";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import { getDelete, getList, getSave, getUpdate, getViewRecord } from "../utils/api";
const GroupMaster = () => {
    const [loading, setLoading] = useState(false);
    const [apiData, setApiData] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const deleteCooldown = useRef(false);
    const deleteCooldownForDetailGrid = useRef(false);

    const [errorVisibleComponent, setErrorMessageVisibleComponent] = useState(false);
    const [errorType, setErrorType] = useState();
    const [errorDivMessage, setErrorDivMessage] = useState("");
    const { checkResponseStatus } = useCheckResponseStatus();
    const saveButtonRef = useRef(null);
    const [modalIsOpen, setIsOpen] = React.useState(false);
    const [selectedValues, setSelectedValues] = useState([]);
    const [customModalIsOpen, setCustomModelIsOpen] = React.useState(false);

    const [gradeDetailsRcds, setGradeDetailsRcds] = useState({
        gradeDetailsId: "",
        basicFrom: "",
        basicTo: "",
        gradeOrder: "",
    })
    const [rcds, setRcds] = useState({
        gradeId: "",
        gradeName: "",
        remarks: "",
    })
    const [errorMessages, setErrorMessages] = useState({
        group: "",
        basicFrom: "",
        basicTo: "",
        gradeOrder: ""
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
    const data = {
        gradeLabel: "Group Name",
        gradeName: "gradeName",
        gradeHolder: "Group Name",
        gradeRemarkLabel: "Remarks",
        gradeRemarkName: "remarks",
        gradeRemarksHolder: "Remarks",
        baseFromLabel: "Pay Level Description",
        baseFromName: "basicFrom",
        baseFromHolder: "Pay Level Description",
        baseToLabel: "Pay Level",
        baseToName: "basicTo",
        baseToHolder: "Pay Level",
        gradeOrderLabel: "Order",
        gradeOrderName: "gradeOrder",
        gradeOrderHolder: "Order",
        save: "Save",
        delete: "Delete",
        update: "Update",
        back: "Back",
        reset: "Reset",
    }
    const validateFields = () => {
        const errors = {};
        if (!rcds.gradeName) errors.gradeName = "Group Name is required.";
        return errors;
    }
    const validateGradeDetails = () => {
        const errors = {};
        if (!gradeDetailsRcds.basicFrom) errors.basicFrom = "Pay Level Description is required.";
        if (!gradeDetailsRcds.basicTo) errors.basicTo = "Pay Level is required.";
        if (!gradeDetailsRcds.gradeOrder) errors.gradeOrder = "Order is required.";
        return errors;
    }

    const secretKey = retrieveFromCookies("AESDecKey");

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setRcds((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        setGradeDetailsRcds((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        setErrorMessages((prevErrors) => ({
            ...prevErrors,
            [name]: "",
        }));

    };
    const [searchRcds, setSearchRcds] = useState({
        gradeName: "",
    });
    const handleSearchChange = (evt) => {
        const { name, value } = evt.target;
        setSearchRcds((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };
    const handleBack = () => {
        setHighlightRow(false); // changes
        deleteCooldown.current = false;
        if (saveButtonRef.current) {
            saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
        }
        setRcds({
            gradeId: "",
            gradeName: "",
            remarks: "",
            userId: "",
            publicIp: "",
        });
        setApiData([]);
        setIsEditing(false);
    };
    const handleReset = () => {
        setRcds({
            gradeId: "",
            gradeName: "",
            remarks: "",
        });
        setGradeDetailsRcds({
            gradeDetailsId: "",
            basicFrom: "",
            basicTo: "",
            gradeOrder: "",
        })
        setApiData([]);
        setErrorMessages("");
    };
    const addMoreGroupDetails = (evt) => {
        evt.preventDefault();
        // Check if the form is valid
        const errors = validateGradeDetails();
        if (Object.keys(errors).length > 0) {
            setErrorMessages(errors);
            return;
        }
        // Push the form data into the dynamic data state
        setApiData((prevData) => [
            ...prevData,
            {
                id: prevData.length + 1,
                basicFrom: gradeDetailsRcds.basicFrom,
                basicTo: gradeDetailsRcds.basicTo,
                gradeOrder: gradeDetailsRcds.gradeOrder,
                gradeDetailsId: gradeDetailsRcds.gradeDetailsId,
            }
        ]);
        console.log("Data: ", apiData)
        // Clear the form data after adding
        setGradeDetailsRcds({
            basicFrom: "",
            basicTo: "",
            gradeOrder: "",
            gradeDetailsId: ""
        });

    };
    const handleCreate = async (evt) => {
        let responseData;
        evt.preventDefault();
        setLoading(true);
        const errors = validateFields();
        if (Object.keys(errors).length > 0) {
            setErrorMessages(errors);
            return;
        }
        const updatedRcds = {
            ...rcds,
            userId: s_user.userId,
            publicIp: s_user.publicIp,
            gradeDetails: [...apiData],
        };

        console.log("Data: SFRDFDFD---- ", updatedRcds);
        try {
            const ciphertext = encAESData(secretKey, updatedRcds);
            if (rcds.gradeId) {
                // Update case
                deleteCooldown.current = false;
                const response = await getUpdate("hrms", "groupMaster", ciphertext);
                responseData = checkResponseStatus(response);
            } else {
                // Save case
                const response = await getSave("hrms", "groupMaster", ciphertext);
                responseData = checkResponseStatus(response);
            }

            if (responseData) {
                if (responseData.rType === "Y") {
                    const jsonData = JSON.parse(responseData.rData);
                    const decryptedData = decAESData(secretKey, jsonData);
                    setRcds({
                        gradeName: "",
                        remarks: "",
                        gradeId: null,
                        userId: rcds.userId,
                        publicIp: rcds.publicIp,
                    });
                    setApiData([])
                    // Clear the form fields by resetting rcds to its initial state

                    setErrorMessageVisibleComponent(true);
                    setErrorType(true);
                    setErrorDivMessage(responseData.rMessage);
                    // Automatically hide the message after it has been shown
                    setTimeout(() => {
                        setErrorMessageVisibleComponent(false);
                        setErrorDivMessage("");

                    }, 4000); // Adjust time as needed
                } else {
                    setErrorMessageVisibleComponent(true);
                    setErrorDivMessage(responseData.rMessage);

                    setTimeout(() => {
                        setErrorMessageVisibleComponent(false);
                        setErrorDivMessage("");

                    }, 4000);

                }

                // Refresh the data list after saving
                getData();
            }
        } catch (error) {
            console.error("Error during create/update:", error);
            setResponseMessage("Error saving data: " + error.message);
        } finally {
            setLoading(false); // End loading state
            setHighlightRow(false); // changes
            deleteCooldown.current = false;

        }
    };

    const viewGroupRecord = (id) => {
        deleteCooldownForDetailGrid.current = true;
        const selectedRecord = apiData.find((_, index) => index === id - 1);
        if (selectedRecord) {
            setGradeDetailsRcds({
                basicFrom: selectedRecord.basicFrom,
                basicTo: selectedRecord.basicTo,
                gradeOrder: selectedRecord.gradeOrder,
                gradeDetailsId: id
            });
        }
        console.log("Rcds: ", gradeDetailsRcds);
    };

    const deleteGroupRecord = ({ id }) => {
        const updatedData = apiData.filter((_, index) => index !== id - 1); // Match index to id
        setApiData(updatedData);
    };

    const handleUpdateGroup = (evt) => {
        evt.preventDefault();

        if (!gradeDetailsRcds.gradeDetailsId) {
            console.error("PayId is missing in the update record.");
            return;
        }
        const updatedData = apiData.map(item => {
            const isMatch = String(item.gradeDetailsId || item.id) === String(gradeDetailsRcds.gradeDetailsId || gradeDetailsRcds.id);
            return isMatch ? { ...item, ...gradeDetailsRcds } : item;
        });
        setApiData(updatedData);
        setGradeDetailsRcds({
            basicFrom: "",
            basicTo: "",
            gradeOrder: "",
            gradeDetailsId: ""
        });
        deleteCooldownForDetailGrid.current = false;

    };



    const getData = async () => {
        try {
            const menuId = retrieveFromLocalStorage("activeMenuId");
            // Encrypt the searchRcds data
            const ciphertext = encAESData(secretKey, { menuId });

            // Send request to get the list
            const response = await getList("hrms", "groupMaster", ciphertext);

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
                    console.log(decryptedData, "|| decryptedData in getData");


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
        getData();
        window.scrollTo({ top: 0, behavior: "smooth" });

    }, []);


    const viewRecord = async (gradeId) => {
        try {
            deleteCooldown.current = true;

            setErrorMessages("");
            const ciphertext = encAESData(secretKey, { gradeId });
            const response = await getViewRecord(
                "hrms",
                "groupMaster",
                ciphertext
            );

            console.log("Full response from backend:", response);
            const responseData = checkResponseStatus(response);

            if (responseData.rData) {
                const recJson = JSON.parse(responseData.rData);
                const decryptedData = decAESData(secretKey, recJson);

                const dataToRec = JSON.parse(decryptedData.recData); // Assuming you want the first item

                const dataToSet = dataToRec[0];

                console.log("Decrypted Data:", dataToSet);

                // Update rcds state with the decrypted data
                setRcds({
                    gradeId: dataToSet.gradeId,
                    gradeName: dataToSet.gradeName,
                    remarks: dataToSet.remarks,
                });

                const updatedApiData = dataToSet.detailData.map((gradeDetailsRcds, sno) => {
                    return {
                        id: sno + 1,
                        basicFrom: gradeDetailsRcds.basicFrom,
                        basicTo: gradeDetailsRcds.basicTo,
                        gradeOrder: gradeDetailsRcds.gradeOrder,
                        gradeDetailsId: gradeDetailsRcds.gradeDetailsId,
                    };
                });

                setApiData(updatedApiData);

            } else {
                console.error("encryptData is undefined in the backend response.");
            }


        } catch (error) {
            console.error("Error retrieving data:", error);
        }
    };

   const handleDelete = async (gradeId) => {
        deleteCooldown.current = true;
        //setShowSave(false);
        setLoading(true);

        try {
            const ciphertext = encAESData(secretKey, { gradeId });
            const response = await getDelete("hrms", "groupMaster", ciphertext);
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
                //setShowSave(true);

                setTimeout(() => {
                    setErrorMessageVisibleComponent(false);
                    setErrorDivMessage("");
                }, 4000);

                console.log(rowData);

                // Use functional setState to always access the latest state
                setTableData((prevTableData) => {
                    // Filter out the deleted item from the previous tableData
                    const newData = prevTableData.filter((item) => item.gradeId !== gradeId);

                    // Map to reset serialNo after deletion
                    const updatedTableData = newData.map((item, index) => ({
                        ...item,
                        serialNo: index + 1, // Recalculate serialNo
                    }));
                    // Update rowData as well
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
            //setShowSave(true);
            deleteCooldown.current = false;


            setTimeout(() => {
                setErrorMessageVisibleComponent(false);
                setErrorDivMessage("");
            }, 4000);
            setHighlightRow(false); //changes

        }
    };

    const dynamicTableData = {
        headers: ["SNo.", "Pay Level Description", "Pay Level", "Order", "Edit", "Delete"],
        rows: apiData.map((item, sno) => ({
            id: sno + 1,
            one: item.basicFrom,
            two: item.basicTo,
            three: item.gradeOrder,
            four: (
                <span
                    className="manipulation-icon edit-color"
                    onClick={() => {
                        const recordId = { id: sno + 1 };

                        viewGroupRecord(sno + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                >
                    <FontAwesomeIcon icon={faEdit} />
                    <span className="manipulation-text"> Edit</span>
                </span>
            ),
            five: !isEditing && (
                <span
                    className={`manipulation-icon delete-color ${deleteCooldownForDetailGrid.current ? "disabled" : ""}`}
                    onClick={() => {
                        if (!deleteCooldownForDetailGrid.current) {
                            const recordId = { id: sno + 1 };
                            deleteGroupRecord(recordId);
                        }
                    }}
                    style={{
                        pointerEvents: deleteCooldownForDetailGrid.current ? "none" : "auto",
                        opacity: deleteCooldownForDetailGrid.current ? 0.5 : 1,
                    }}
                >
                    <FontAwesomeIcon icon={faTrash} />
                    <span className="manipulation-text"> Delete</span>
                </span>
            ),
        })),
    };


    const columnDefs = [
        {
            headerName: 'Serial No.',
            field: 'serialNo',
            sortable: true,
            filter: 'agNumberColumnFilter',
            // flex: 1,
            width: 100,
            headerClass: 'ag-header-cell',  // Optional: add custom header class
        },
        ...columnDefsApi,
        {
            headerName: 'Action',
            field: 'button',
            cellRenderer: (params) => (
                <>

                    <span
                        // tabIndex={1}
                        className="manipulation-icon edit-color mx-3"
                        onClick={() => {
                            setHighlightRow(true); //changes
                            const id = params.data.gradeId; // Access the row data to get the roleId
                            viewRecord(id); // Call viewRecord function with the id
                            window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to the top
                        }}
                    >
                        <FontAwesomeIcon icon={faEdit} className="icon-size" />
                    </span>

                    <span
                        // tabIndex={1}
                        className={`manipulation-icon delete-color ${deleteCooldown.current ? "disabled" : ""
                            } mx-1`}
                        onClick={() => {
                            if (!deleteCooldown.current) {
                                // Show confirmation alert
                                const confirmDelete = window.confirm(
                                    "Are you sure you want to delete this record?"
                                );
                                if (confirmDelete) {
                                    if (!deleteCooldown.current) {
                                        setHighlightRow(true); //changes
                                        const id = params.data.gradeId; // Access row data to get the salId
                                        handleDelete(id); // Call the handleDelete function with the salId
                                    }
                                }
                            }
                        }}
                        style={{
                            pointerEvents: deleteCooldown.current ? "none" : "auto", // Disable click
                            opacity: deleteCooldown.current ? 0.5 : 1, // Make it visually dim when disabled
                            cursor: deleteCooldown.current ? "not-allowed" : "pointer", // Change cursor to indicate disabled state
                        }}
                    >
                        <FontAwesomeIcon icon={faTrash} className="icon-size" />
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
    // const agGridTableData = apiData1.map((item, son) => ({
    //     son: son + 1,
    //     group: item.group,
    //     groupId: item.groupId,
    // }));
    //--------------------Search Data By Advance Search Option --------------------//
    useEffect(() => {
        if (columnDefsApi && columnDefsApi.length > 0) {
            setTableHeader(columnDefs);
        }
    }, [columnDefsApi]);

    const filterTableData = () => {
        const filteredData = rowData.filter((apiDataRec) => {
            const matchesSaluation = searchRcds.gradeName ? apiDataRec.gradeName.toLowerCase().includes(searchRcds.gradeName.toLowerCase()) : true;
            return matchesSaluation;
        })
            .map((item, sno) => ({
                serialNo: sno + 1,
                gradeName: item.gradeName,
                gradeId: item.gradeId,
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
    ///////////////////////////////////*************shortcuts**********////////////////////////////////////////////////////////


    useKeyboardShortcut(
        "S",
        (e) => { // Pass the event to the callback
            handleCreate(e); // Now `e` is available here
        },
        { ctrl: true }
    );

    useKeyboardShortcut(
        "R",
        () => { // Pass the event to the callback // Set the reload flag to true to show the spinner
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


    return (
        <>
            <div className="rightArea">
                <div className="container-fluid px-1">
                    <Breadcrumbs />
                </div>

                <div className="container-body mx-3 mb-2">
                    <form action="">
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
                                            label={data.gradeLabel}
                                            name={data.gradeName}
                                            holder={data.gradeHolder}
                                            value={rcds[data.gradeName]}
                                            errorMessage={errorMessages.group}
                                            onChange={handleChange}
                                            icon={icon.user}
                                            Maxlength={25}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <FormTextarea
                                            label={data.gradeRemarkLabel}
                                            name={data.gradeRemarkName}
                                            holder={data.gradeRemarksHolder}
                                            value={rcds[data.gradeRemarkName]}
                                            onChange={handleChange}
                                            Maxlength={250}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card mt-3">
                            <div className="card-header">
                                <p className="card-title h6">Group Amount Details</p>
                            </div>
                            <div className="card-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <FormText
                                            label={data.baseFromLabel}
                                            name={data.baseFromName}
                                            holder={data.baseFromHolder}
                                            value={gradeDetailsRcds[data.baseFromName]}
                                            errorMessage={errorMessages.basicFrom}
                                            onChange={handleChange}
                                            icon={icon.user}
                                            Maxlength={25}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <FormText
                                            type="number"
                                            label={data.baseToLabel}
                                            name={data.baseToName}
                                            holder={data.baseToHolder}
                                            value={gradeDetailsRcds[data.baseToName]}
                                            errorMessage={errorMessages.baseTo}
                                            onChange={handleChange}
                                            icon={icon.user}
                                            Maxlength={2}
                                        />
                                    </div>
                                </div>
                                <div className="col md-3">
                                    <div className="col-md-6">
                                        <FormText
                                            type="number"
                                            label={data.gradeOrderLabel}
                                            name={data.gradeOrderName}
                                            holder={data.gradeOrderHolder}
                                            value={gradeDetailsRcds[data.gradeOrderName]}
                                            errorMessage={errorMessages.gradeOrder}
                                            onChange={handleChange}
                                            icon={icon.user}
                                            Maxlength={250}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-12 text-center mt-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-color  btn-sm"
                                        onClick={gradeDetailsRcds.gradeDetailsId ? handleUpdateGroup : addMoreGroupDetails}>
                                        {gradeDetailsRcds.gradeDetailsId ? "Modify" : "Add New"}
                                    </button>
                                </div>

                            </div>
                            {/* </div>
                        <div className="card mt-3"> */}
                            {/* <div className="card-header"> */}
                            {/* <p className="card-titlerrr h6">List of Group Detail(s)</p> */}
                            {/* </div> */}
                            {/* <div className="card-body"> */}
                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <DynamicTable data={dynamicTableData} />

                                </div>
                            </div>
                            {/* </div> */}
                        </div>
                    <div className="col-md-12 text-center mt-5">
                        <FormButton
                            btnType1={data.save}
                            btnType3={data.update}
                            btnType4={data.back}
                            btnType5={data.reset}
                            onClick={handleCreate}
                            onReset={handleReset}
                            onBack={handleBack}
                            showUpdate={!!rcds.gradeId}
                            rcds={rcds}
                            loading={loading}
                        />
                        
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
                    <p className='h6 card-title list-header'> <small> List of Group<span className='parenthesis'>(</span>s<span className='parenthesis'>)</span></small></p>
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
                                                label={data.gradeLabel}
                                                name={data.gradeName}
                                                holder={data.gradeHolder}
                                                value={searchRcds[data.gradeName]}
                                                onChange={handleSearchChange}
                                                icon={icon.user} // Example FontAwesome icon; change as needed
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
                                                        semester: "",
                                                        alias: "",
                                                        isActive: "",
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
export default GroupMaster
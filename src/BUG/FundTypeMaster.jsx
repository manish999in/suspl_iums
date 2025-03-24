
import React, { useState, useEffect, useRef, useContext } from "react";
import "../styles/inputStyle.css";
import FormText from "../components/FormText";
import FormButton from "../components/FormButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../styles/AdvancedSearch.css";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import ErrorMessageABD from "../components/ErrorMessageABD";
import { retrieveFromLocalStorage, retrieveFromCookies, storeInLocalStorage } from "../utils/CryptoUtils";


import {
    getDelete,
    getList,
    getSave,
    getUpdate,
    getViewRecord,
    getDropDown,
} from "../utils/api";
import AgGridTable from "../components/AgGridTable";
import Breadcrumbs from "../components/Breadcrumbs";
import FormTextarea from "../components/FormTextarea";
import SelectComponent from "../components/SelectComponent";
import AdvanceSearchModal from "../components/AdvanceSearchModal";
import icon from "../properties/icon";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import CustomModal from "../components/CustomModal";
import FormMultiSelect from "../components/FormMultiSelect";
import { GlobalContext } from "../context/GlobalContextProvider";
import FilterTags from "../components/FilterTags";



const FundTypeMaster = () => {

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
    const [resetSelect, setResetSelect] = useState(false);
    const deleteCooldown = useRef(false);


    const [errorVisibleComponent, setErrorMessageVisibleComponent] =
        useState(false);
    const [errorType, setErrorType] = useState();
    const [errorDivMessage, setErrorDivMessage] = useState("");

    const [errorMessages, setErrorMessages] = useState({
        description: "",
        orderby: "",
    }); // handling error


    // changes
    const [rcds, setRcds] = useState({
        description: "",
        fundTypeId: "",
        underFundType: "",
        orderby: "",
        userId: "", // Initial value will be updated in useEffect
        publicIp: "", // Initial value will be updated in useEffect

    });

    const [searchRcds, setSearchRcds] = useState({
        description: "",
        underFundType: "",
        orderby: "",
    });


    const [underFundTypeRcds, setUnderFundTypeRcds] = useState([{ value: "", label: "" }]);

    const secretKey = retrieveFromCookies("AESDecKey");
    const saveButtonRef = useRef(null); // Reference for the Save button

    const [showSave, setShowSave] = useState(true);
    const [loading, setLoading] = useState(false); // Loading state
    const { checkResponseStatus } = useCheckResponseStatus();

    const data = {
        save: "Save",
        delete: "Delete",
        update: "Update",
        back: "Back",
        reset: "Reset",
        description: "Description",
        description: "Description",
        descHolder: "Description",
        underFundType: "Under Fund Type",
        underFundTypeHolder: "Select Under Fund Type",
        orderBy: "Order By",
        orderByHolder: "Enter Order By",
    };
    const handleBack = () => {
        setHighlightRow(false); // changes
        deleteCooldown.current = false;


        if (saveButtonRef.current) {
            saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
        }

        // Alternatively, clear form data and reset state if needed
        setRcds({
            description: "",
            fundTypeId: "",
            underFundType: "",
            orderby: "",
            userId: s_user.userId,
            publicIp: s_user.publicIp,
        });

    };

    const handleReset = () => {
        setRcds({
            description: "",
            fundTypeId: "",
            underFundType: "",
            orderby: "",
            userId: s_user.userId,
            publicIp: s_user.publicIp,
        });

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
            [name]: "",
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

        if (!rcds.description) errors.description = "Description is required";
        if (!rcds.orderby) errors.orderby = "Order By is required";

        return errors;
    };

    const handleCreate = async (evt) => {
        evt.preventDefault(); // Prevent default form submission
        setLoading(true); // Start loading state
        console.log(rcds);

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
            // Encrypt the updated rcds with the userId
            const ciphertext = encAESData(secretKey, updatedRcds);
            console.log("Encrypted Data: ", ciphertext);

            let responseData;

            console.log(rcds, "varun");

            if (rcds.fundTypeId) {
                // Update the existing record
                const response = await getUpdate("fin", "fundTypeMaster", ciphertext,'budget');
                console.log("Update response from backend:", response.data);

                responseData = checkResponseStatus(response,'budget');
            } else {
                // Send data to the backend
                const response = await getSave("fin", "fundTypeMaster", ciphertext,'budget');
                console.log("Response from backend:", response.data);
                responseData = checkResponseStatus(response,'budget');
                console.log(responseData);
            }

            setRcds({
                // Replace with your initial state for rcds
                description: "",
                fundTypeId: "",
                underFundType: "",
                orderby: "",
                userId: s_user.userId,
                publicIp: s_user.publicIp,
            });

            if (responseData) {
                // Check if the operation was successful
                if (responseData.rType === "Y") {
                    const jsonData = JSON.parse(responseData.rData);
                    const decryptedData = decAESData(secretKey, jsonData);
                    console.log("Decrypted Data:", decryptedData);

                    // Clear the form fields by resetting rcds to its initial state

                    setErrorMessageVisibleComponent(true);
                    setErrorType(true);
                    setErrorDivMessage(responseData.rMessage);
                    setShowSave(true)
                    // Automatically hide the message after it has been shown
                    setTimeout(() => {
                        setErrorMessageVisibleComponent(false);
                        setErrorDivMessage("");

                    }, 4000); // Adjust time as needed
                } else {
                    setErrorMessageVisibleComponent(true);
                    setErrorDivMessage(responseData.rMessage);

                    setShowSave(true);
                    setTimeout(() => {
                        setErrorMessageVisibleComponent(false);
                        setErrorDivMessage("");

                    }, 4000);

                }

                // Refresh the data list after saving
                getData();
                getDropDownData();


            }
        } catch (error) {
            console.error("Error during create/update:", error);
        } finally {
            setLoading(false); // End loading state
            setHighlightRow(false); // changes
            deleteCooldown.current = false;

        }
    };



    const getData = async () => {
        try {
            const menuId = retrieveFromLocalStorage("activeMenuId");
            // Encrypt the searchRcds data
            const ciphertext = encAESData(secretKey, { menuId });

            // Send request to get the list
            const response = await getList("fin", "fundTypeMaster", ciphertext,'budget');

            const responseData = checkResponseStatus(response,'budget');

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


    const Query = {
        table: "FUND_TYPE_MASTER",
        fields: "FUND_TYPE_ID,description",
        condition:
            "1=1",
        orderBy: " ",
    };

    const getDropDownData = async () => {

        try {
            // alert("");
            getDropDown(
                Query,
                underFundTypeRcds,
                setUnderFundTypeRcds,
                "common",
                secretKey,
                "budget"
            );
        } catch { }
    };



    useEffect(() => {
        getDropDownData();
        getData();
    }, []);






    const viewRecord = async (fundTypeId) => {
        try {
            deleteCooldown.current = true;

            setErrorMessages("");
            const ciphertext = encAESData(secretKey, { fundTypeId });
            const response = await getViewRecord(
                "fin", "fundTypeMaster",
                ciphertext,"budget"
            );

            console.log("Full response from backend:", response);
            const responseData = checkResponseStatus(response,'budget');

            if (responseData.rData) {
                const recJson = JSON.parse(responseData.rData);
                const decryptedData = decAESData(secretKey, recJson);
                console.log("Decrypted Data:", decryptedData);

                const dataToRec = JSON.parse(decryptedData.recData); // Assuming you want the first item

                const dataToSet = dataToRec[0];

                // Update rcds state with the decrypted data
                setRcds({
                    description: dataToSet.description,
                    fundTypeId: dataToSet.fundTypeId,
                    underFundType: dataToSet.underFundType,
                    orderby: dataToSet.orderby,
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
    const handleDelete = async (fundTypeId) => {
        deleteCooldown.current = true;
        setShowSave(false);
        setLoading(true);

        try {
            const ciphertext = encAESData(secretKey, { fundTypeId });
            const response = await getDelete("fin", "fundTypeMaster", ciphertext,'budget');
            const responseData = checkResponseStatus(response,'budget');

            if (responseData.rData) {
                const jsonData = JSON.parse(responseData.rData);
                const decryptedData = decAESData(secretKey, jsonData);
            } else {
                console.error("encryptData is undefined in the backend response.");
            }

            if (responseData.rType === "Y") {
                getDropDownData();

                setErrorMessageVisibleComponent(true);
                setErrorType(true);
                setErrorDivMessage(responseData.rMessage);
                setShowSave(true);

                setTimeout(() => {
                    setErrorMessageVisibleComponent(false);
                    setErrorDivMessage("");
                }, 4000);

                console.log(rowData);

                // Use functional setState to always access the latest state
                setTableData((prevTableData) => {
                    // Filter out the deleted item from the previous tableData
                    const newData = prevTableData.filter((item) => item.fundTypeId !== fundTypeId);

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
            setShowSave(true);
            deleteCooldown.current = false;


            setTimeout(() => {
                setErrorMessageVisibleComponent(false);
                setErrorDivMessage("");
            }, 4000);
            setHighlightRow(false); //changes

        }
    };

    const columnDefs = [
        {
            headerName: "Serial No.",
            field: "serialNo",
            sortable: true,
            // filter: "agNumberColumnFilter",
            // flex: 1,
            width: 100,
            // headerClass: "ag-header-cell", // Optional: add custom header class
            cellStyle: { textAlign: "center" },
            // pinned: "left",
            // movable: false,
        },

        ...columnDefsApi,
        {
            headerName: "Action",
            field: "button",
            cellRenderer: (params) => (
                <>
                    <span
                        // tabIndex={1}
                        className="manipulation-icon edit-color mx-3"
                        onClick={() => {
                            setHighlightRow(true); //changes
                            const id = params.data.fundTypeId; // Access the row data to get the roleId
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
                                        const id = params.data.fundTypeId; // Access row data to get the salId
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
            filter: false, // No filtering for actions columns
            cellStyle: { textAlign: "center" },
            width: 100,
            // pinned: "right",
            // movable: false,
        },
    ];

    //////////////////////////**** new header format *///////////////////////////////////

    useEffect(() => {
        if (columnDefsApi && columnDefsApi.length > 0) {
            setTableHeader(columnDefs);
        }
    }, [columnDefsApi]);


    const filterTableData = () => {

        console.log(rowData, "rowData");
        console.log(searchRcds, "hbmnhmj");

        const filteredData = rowData
            .filter((apiDataRec) => {
                // Define filter conditions
                const description = searchRcds.description
                    ? apiDataRec.description.toLowerCase().includes(searchRcds.description.toLowerCase())
                    : true;

                const orderby = searchRcds.orderby
                    ? apiDataRec.orderby === Number(searchRcds.orderby)
                    : true;


                // Return true if both conditions are met
                return description && orderby;
            })
            .map((item, sno) => ({
                serialNo: sno + 1,
                description: item.description,
                underFundType: item.underFundType,
                orderby: item.orderby,
            }));

        console.log(filteredData, "filteredData");


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


    const [customModalIsOpen, setCustomModelIsOpen] = React.useState(false);

    function openModal() {
        setCustomModelIsOpen(true);
    }

    const [selectedValues, setSelectedValues] = useState([]);



    return (
        <>
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

                                    <div className="col-md-6">
                                        <FormText
                                            autofocus={true}
                                            label={data.description}
                                            name="description"
                                            value={rcds["description"]}
                                            holder={"Enter Description"}
                                            errorMessage={errorMessages.description} // Pass the error message for roleLevel
                                            onChange={handleChange}
                                            icon={icon.default}
                                            Maxlength={29}
                                        />
                                    </div>


                                    <div className="col-md-6">
                                        <SelectComponent
                                            label={"Under Fund Type"}
                                            name={"underFundType"}
                                            selectedValue={rcds.underFundType}
                                            options={underFundTypeRcds}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    underFundType: value,
                                                }))
                                            }
                                            icon={icon.arrowDown}
                                        />
                                    </div>
                                </div>

                                <div className="row mb-2">
                                    <div className="col-md-6">
                                        <FormText
                                            label={"Order By"}
                                            name={"orderby"}
                                            holder={"Enter Order By"}
                                            value={rcds["orderby"]}
                                            errorMessage={errorMessages.orderby} // Pass the error message for mappedAlias
                                            onChange={handleChange}
                                            icon={icon.list} // Example FontAwesome icon; change as needed
                                            type={"number"}
                                            Maxlength={4}
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
                                                showUpdate={!!rcds.fundTypeId}
                                                rcds={rcds}
                                                loading={loading}
                                            />
                                        }
                                    </div>
                                </div>
                            </div>
                            {/* <CreateUpdateBar
                                preparedData={rcds.createdBy}
                                modifiedData={rcds.modifiedBy}
                            /> */}
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
                            List of Designation detail<span className="parenthesis">(</span>s
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
                        {/* <i
              onClick={openModal}
              className={icon.magnifyingglass}
            > */}
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
                                                label={data.description}
                                                name={'description'}
                                                value={searchRcds['description']}
                                                holder={data.descHolder}
                                                errorMessage={errorMessages.description} // Pass the error message for roleLevel
                                                onChange={handleSearchChange}
                                                icon={icon.default}
                                            />
                                        </div>



                                        <div className="col-md-6">
                                            <FormText
                                                label={"Order By"}
                                                name={"orderby"}
                                                holder={"Enter Order By"}
                                                value={searchRcds["orderby"]}
                                                errorMessage={errorMessages.orderby} // Pass the error message for mappedAlias
                                                onChange={handleSearchChange}
                                                Maxlength={4}
                                                icon={icon.list} // Example FontAwesome icon; change as needed
                                                type={"number"}
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
                                                        description: "",
                                                        underFundType: "",
                                                        orderby: "",
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
        </>
    );
};

export default FundTypeMaster;

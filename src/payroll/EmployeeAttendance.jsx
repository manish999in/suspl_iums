
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
import FormDate from "../components/FormDate";

const EmployeeAttendance = () => {
    const [activeTab, setActiveTab] = useState("unprocessed");
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
    const deleteCooldown = useRef(false);


    const [errorVisibleComponent, setErrorMessageVisibleComponent] =
        useState(false);
    const [errorType, setErrorType] = useState();
    const [errorDivMessage, setErrorDivMessage] = useState("");

    const [errorMessages, setErrorMessages] = useState({
        designation: "",
        desiCategory: "",
        seniorityLevel: "",
        retirementAge: "",
        qualification: "",
        classCode: "",
        remarks: "",
        cntrlOfExam: "",
    }); // handling error

    const [rcds, setRcds] = useState({
        location: "",
        ddo: "",
        employeeCode: "",
        employeeManualCode: "",
        employeeName: "",
        departmentId: "",
        designationId: "",
        fundTypeId: "",
        disciplineId: "",
        employeeLeftStatus: "",
        categoryId: "",
        classId: "",
        groupId: "",
        stateId: "",
        payLevelId: "",
        natureTypeId: "",
    });


    const [ctgRcds, setctgRcds] = useState([{ value: "", label: "" }]);
    const [classRcds, setclassRcds] = useState([{ value: "", label: "" }]);



    const secretKey = retrieveFromCookies("AESDecKey");

    const saveButtonRef = useRef(null); // Reference for the Save button

    const [searchRcds, setSearchRcds] = useState({
        designation: "",
        classCode: "",
    });
    const [loading, setLoading] = useState(false); // Loading state
    const { checkResponseStatus } = useCheckResponseStatus();

    const [advTypeRcds, setAdvTypeRcds] = useState([{ value: "", label: "" }]);
    const [locationRcds, setLocationRcds] = useState([{ value: "", label: "" }]);
    const [ddoRcds, setDdoRcds] = useState([{ value: "", label: "" }]);
    const [sanctRcds, setSanctRcds] = useState([{ value: "", label: "" }]);
    const [appRcds, setAppRcds] = useState([{ value: "", label: "" }]);

    const data = {

        locationName: "location",
        locationLabel: "Location",

        ddoName: "ddo",
        ddoLabel: "DDO",

        orderNoName: "orderNo",
        orderNoHolder: "Enter Order No.",
        orderNoLabel: "Order No",

        sanctionedByName: "santionedBy",
        sacntionedByLabel: "Sanctioned By",

        approvedByName: "approvedBy",
        approvedByLabel: "Approved By",

        advName: "advType",
        advLabel: "Advance Type",

        remarkName: "remark",
        remarkLabel: "Remark",
        remarkHolder: "Enterk Remark",


        save: "Save",
        delete: "Delete",
        update: "Update",
        back: "Back",
        reset: "Reset",
    };
    const handleBack = () => {
        setHighlightRow(false); // changes
        deleteCooldown.current = false;


        if (saveButtonRef.current) {
            saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
        }

        // Alternatively, clear form data and reset state if needed
        setRcds({
            designationId: "",
            designation: "",
            desiCategory: "",
            seniorityLevel: "",
            retirementAge: "",
            qualification: "",
            classCode: "",
            remarks: "",
            cntrlOfExam: "",
            userId: "",
        });

    };

    const handleReset = () => {
        setRcds({
            designationId: "",
            designation: "",
            desiCategory: "",
            seniorityLevel: "",
            retirementAge: "",
            qualification: "",
            classCode: "",
            remarks: "",
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
    //////////////////////////////////////////////////Dropdowns////////////////////////////////////////////////////////////////////////////////////////////////

    const advTypeQuery = {
        table: "salary_head_mast",
        fields: "salary_head_id,description",
        condition: "head_type='Deduction' and (deduction_type='L' || deduction_type= 'A') ",
        orderBy: "",
    };
    const locationQuery = {
        table: "leave_location_mast",
        fields: "location_code,location_name",
        condition: "1=1",
        orderBy: "",
    };
    const ddoQuery = {
        table: "ddo left join ddolocationmapping dlm on ddo.ddo_id = dlm.DDO_ID",
        fields: "DISTINCT ddo.ddo_id, ddo.DDONAME",
        condition: `dlm.LOCATION_CODE='${rcds.location}'`,
        orderBy: "",
    };

    const getAdvTypeDropdownData = async () => {
        getDropDown(advTypeQuery, advTypeRcds, setAdvTypeRcds, "common", secretKey, "user");
    };

    const getDdoDropdownData = async () => {
        getDropDown(ddoQuery, ddoRcds, setDdoRcds, "common", secretKey, "user");
    };

    const getLocationDropDownData = async () => {
        getDropDown(
            locationQuery,
            locationRcds,
            setLocationRcds,
            "common",
            secretKey,
            "user"
        );
    };

    const sanctionedByQuery = {
        table: " employee_mast e,designation_mast d,ddo c,leave_location_mast f ",
        fields: "e.employeeid,e.employeename",
        condition: `e.designation=d.designation_id and e.ddo=c.ddo_id and  f.location_code=e.location and  upper(d.designation) in 
       (upper('Vice Chancellor'), upper('Comptroller'), upper('Registrar'), upper('Dean')) and c.ddo_id='${rcds.ddo}' 
        and e.location='${rcds.location}'`,
        orderBy: "",
    };
    const approvedByQuery = {
        table: " employee_mast e,designation_mast d,ddo c,leave_location_mast f ",
        fields: "e.employeeid,e.employeename",
        condition: `e.designation=d.designation_id and e.ddo=c.ddo_id and  f.LOCATION_CODE=e.location and  upper(d.designation) 
         in (upper('Vice Chancellor'), upper('Comptroller'), upper('Registrar'), upper('Dean')) and c.ddo_id='${rcds.ddo}' 
        and e.location='${rcds.location}' `,
        orderBy: "",
    };

    const getSanctionedByDropdownData = async () => {
        getDropDown(sanctionedByQuery, sanctRcds, setSanctRcds, "common", secretKey, "user");
    };

    const getApprovedByDropDownData = async () => {
        getDropDown(
            approvedByQuery,
            appRcds, setAppRcds,
            "common",
            secretKey,
            "user"
        );
    };

    useEffect(() => {
        getSanctionedByDropdownData();
        getApprovedByDropDownData();
    }, [rcds.location, rcds.ddo]);
    useEffect(() => {
        getDdoDropdownData();
    }, [rcds.location]);

    useEffect(() => {
        getLocationDropDownData();
        getAdvTypeDropdownData();
    }, []);


    const validateFields = () => {
        const errors = {};
        if (!rcds.designation) errors.designation = "Designation is required";
        if (!rcds.desiCategory) errors.desiCategory = "Designation Category is required";
        // if (!rcds.seniorityLevel) errors.seniorityLevel = "Seniority Level is required";
        if (!rcds.seniorityLevel) {
            errors.seniorityLevel = "Seniority Level  Age is required";
        } else if (isNaN(rcds.seniorityLevel) || rcds.seniorityLevel <= 0) {
            errors.seniorityLevel = "Seniority Level  must  Numeric";
        }
        // if (!rcds.retirementAge) errors.retirementAge = "Retirement Age is required";

        if (!rcds.retirementAge) {
            errors.retirementAge = "Retirement Age is required";
        } else if (isNaN(rcds.retirementAge) || rcds.retirementAge <= 0) {
            errors.retirementAge = "Retirement Age must be Numeric";
        }

        if (!rcds.classCode) errors.classCode = "Class Code is required";
        if (!rcds.remarks) errors.remarks = "Remark is required";
        //if (!rcds.college) errors.college = "College is required";
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

        //setShowSave(false);
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

            if (rcds.designationId) {
                // Update the existing record
                const response = await getUpdate("hrms", "desigMaster", ciphertext);
                console.log("Update response from backend:", response.data);

                responseData = checkResponseStatus(response);
            } else {
                // Send data to the backend
                const response = await getSave("hrms", "desigMaster", ciphertext);
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


                    setRcds({
                        // Replace with your initial state for rcds
                        designationId: null,
                        designation: "",
                        desiCategory: "",
                        seniorityLevel: "",
                        retirementAge: "",
                        qualification: "",
                        classCode: "",
                        remarks: "",
                        userId: rcds.userId,
                        publicIp: rcds.publicIp,
                        //college: "",
                    });

                    // Clear the form fields by resetting rcds to its initial state

                    setErrorMessageVisibleComponent(true);
                    setErrorType(true);
                    setErrorDivMessage(responseData.rMessage);
                    //setShowSave(true)
                    // Automatically hide the message after it has been shown
                    setTimeout(() => {
                        setErrorMessageVisibleComponent(false);
                        setErrorDivMessage("");

                    }, 4000); // Adjust time as needed
                } else {
                    setErrorMessageVisibleComponent(true);
                    setErrorDivMessage(responseData.rMessage);

                    //setShowSave(true);
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
            const response = await getList("hrms", "desigMaster", ciphertext);

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
        getData();
        window.scrollTo({ top: 0, behavior: "smooth" });

    }, []);



    const DesiCtgQuery = {
        table: "cparam",
        fields: "PDOC,DESCP1",
        condition:
            "code='HRMS'  and SERIAL='DESIG_CAT' and PARAM1='Y'",
        orderBy: " ",
    };

    const getDropDownData = async () => {
        try {

            getDropDown(
                DesiCtgQuery,
                ctgRcds,
                setctgRcds,
                "common",
                "12345"
            );
        } catch { }
    };

    const classQuery = {
        table: "class_mast",
        fields: "CLASS_ID,CLASS",
        condition:
            "1=1",
        orderBy: " ",
    };

    const getClassDropDownData = async () => {
        try {

            getDropDown(
                classQuery,
                classRcds,
                setclassRcds,
                "common",
                "12345"
            );
        } catch { }
    };

    useEffect(() => {
        getClassDropDownData();
        getDropDownData();
        getData();
    }, []);

    const viewRecord = async (designationId) => {
        try {
            deleteCooldown.current = true;

            setErrorMessages("");
            const ciphertext = encAESData(secretKey, { designationId });
            const response = await getViewRecord(
                "hrms",
                "desigMaster",
                ciphertext
            );

            console.log("Full response from backend:", response);
            const responseData = checkResponseStatus(response);

            if (responseData.rData) {
                const recJson = JSON.parse(responseData.rData);
                const decryptedData = decAESData(secretKey, recJson);
                console.log("Decrypted Data:", decryptedData);

                const dataToRec = JSON.parse(decryptedData.recData); // Assuming you want the first item

                const dataToSet = dataToRec[0];

                // Update rcds state with the decrypted data
                setRcds({
                    designationId: dataToSet.designationId,
                    designation: dataToSet.designation,
                    desiCategory: dataToSet.desiCategory,
                    seniorityLevel: dataToSet.seniorityLevel,
                    retirementAge: dataToSet.retirementAge,
                    qualification: dataToSet.qualification,
                    classCode: dataToSet.classCode,
                    remarks: dataToSet.remarks,
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
    const handleDelete = async (designationId) => {
        deleteCooldown.current = true;
        //setShowSave(false);
        setLoading(true);

        try {
            const ciphertext = encAESData(secretKey, { designationId });
            const response = await getDelete("hrms", "desigMaster", ciphertext);
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
                    const newData = prevTableData.filter((item) => item.designationId !== designationId);

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
                            const id = params.data.designationId; // Access the row data to get the roleId
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
                                        const id = params.data.designationId; // Access row data to get the salId
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

        const filteredData = rowData
            .filter((apiDataRec) => {
                // Define filter conditions
                const matchesDesignation = searchRcds.designation
                    ? apiDataRec.designation.toLowerCase().includes(searchRcds.designation.toLowerCase())
                    : true;

                const matchesClass = searchRcds.classCode
                    ? apiDataRec.classValue === searchRcds.classCode
                    : true;

                // Return true if both conditions are met
                return matchesClass && matchesDesignation;
            })
            .map((item, sno) => ({
                serialNo: sno + 1,
                designation: item.designation,
                desiCategory: item.desiCategory,
                seniorityLevel: item.seniorityLevel,
                retirementAge: item.retirementAge,
                classCode: item.classCode,
                designationId: item.designationId,
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

    const employees = [
        {
            id: 1,
            location: "CAU, Head Quarter",
            ddo: "Comptroller Office, CAU HQ, Imphal",
            employeeCode: "HQ/CPG-0019",
            employeeName: "Dhiraj Sairemba",
            department: "Comptroller Office",
            designation: "Support Staff",
            natureType: "Contractual",
            postingCity: "Imphal",
            fundType: "Plan"
        },
        {
            id: 2,
            location: "CAU, Branch Office",
            ddo: "Finance Office, CAU Branch, Delhi",
            employeeCode: "HQ/CPG-0020",
            employeeName: "Ramesh Kumar",
            department: "Finance",
            designation: "Accountant",
            natureType: "Permanent",
            postingCity: "Delhi",
            fundType: "Non-Plan"
        },
        {
            id: 3,
            location: "CAU, Research Center",
            ddo: "Research Office, CAU Research, Kolkata",
            employeeCode: "HQ/CPG-0021",
            employeeName: "Suresh Yadav",
            department: "Research",
            designation: "Scientist",
            natureType: "Contractual",
            postingCity: "Kolkata",
            fundType: "Plan"
        },
        {
            id: 4,
            location: "CAU, Training Center",
            ddo: "Training Office, CAU Training, Mumbai",
            employeeCode: "HQ/CPG-0022",
            employeeName: "Amit Sharma",
            department: "Training",
            designation: "Trainer",
            natureType: "Permanent",
            postingCity: "Mumbai",
            fundType: "Non-Plan"
        },
        {
            id: 5,
            location: "CAU, Regional Office",
            ddo: "Admin Office, CAU Regional, Bangalore",
            employeeCode: "HQ/CPG-0023",
            employeeName: "Neha Gupta",
            department: "Administration",
            designation: "Clerk",
            natureType: "Contractual",
            postingCity: "Bangalore",
            fundType: "Plan"
        }
    ];

   // State to store selected records
   const [selectedRecords, setSelectedRecords] = useState([]);

   // Handle individual checkbox change
   const handleCheckboxChange = (employee) => {
       setSelectedRecords((prev) => {
           let updatedRecords;
           if (prev.some((item) => item.id === employee.id)) {
               updatedRecords = prev.filter((item) => item.id !== employee.id);
               console.log(`Unchecked: ${employee.employeeCode}`);
           } else {
               updatedRecords = [...prev, employee];
               console.log(`Checked: ${employee.employeeCode}`);
           }
           console.log("Updated Records Array:", updatedRecords.map(emp => emp.employeeCode));
           return updatedRecords;
       });
   };

   // Handle "Select All" checkbox change
   const handleSelectAll = (e) => {
       if (e.target.checked) {
           setSelectedRecords(employees);
           console.log("All Checked:", employees.map(emp => emp.employeeCode));
       } else {
           setSelectedRecords([]);
           console.log("All Unchecked");
       }
   };



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
                                        <SelectComponent
                                            label={data.locationLabel}
                                            name={data.locationName}
                                            selectedValue={rcds.location}
                                            options={locationRcds}
                                            onChange
                                            icon={icon.arrowDown} // Example icon class for FontAwesome
                                            size="small"
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    location: value,
                                                }))
                                            }
                                            required={true}

                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <SelectComponent
                                            label={data.ddoLabel}
                                            name={data.ddoName}
                                            selectedValue={rcds.ddo}
                                            options={ddoRcds}
                                            errorMessage=""
                                            icon={icon.arrowDown}
                                            size="small"
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    ddo: value,
                                                }))
                                            }
                                            required={true}

                                        />
                                    </div>

                                </div>
                                <div className="row mb-3">

                                    <div className="col-md-6">
                                        <FormText
                                            label={data.orderNoLabel}
                                            name={data.orderNoName}
                                            value={rcds.orderNo}
                                            holder={data.orderNoHolder}
                                            errorMessage={errorMessages.orderNo} // Pass the error message for roleLevel
                                            onChange={handleChange}
                                            icon={icon.envelope} // Example icon (FontAwesome star icon)
                                            required={true}

                                        />
                                    </div>


                                    <div className="col-md-6">
                                        <SelectComponent
                                            label={data.sacntionedByLabel}
                                            name={data.sanctionedByName}
                                            selectedValue={rcds.sanctionedBy}
                                            options={sanctRcds}
                                            errorMessage={errorMessages.sanctionedBy} // Pass the error message for roleLevel
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    sanctionedBy: value,
                                                }))
                                            }
                                            icon="fas fa-star"
                                            required={true}

                                        />
                                    </div>
                                </div>

                                <div className="row mb-2">
                                    <div className="col-md-6">
                                        <SelectComponent
                                            label={data.approvedByLabel}
                                            name={data.approvedByName}
                                            selectedValue={rcds.approvedBy}
                                            options={appRcds}
                                            errorMessage={errorMessages.approvedBy} // Pass the error message for roleLevel
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    approvedBy: value,
                                                }))
                                            }
                                            icon="fas fa-star"
                                            required={true}

                                        />
                                    </div>


                                    <div className="col-md-6">
                                        <SelectComponent
                                            label={data.advLabel}
                                            name={data.advName}
                                            selectedValue={rcds.advType}
                                            options={advTypeRcds}
                                            errorMessage={errorMessages.advType} // Pass the error message for roleLevel
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    advType: value,
                                                }))
                                            }
                                            icon={icon.paperclip}
                                            required={true}
                                        />
                                    </div>
                                </div>

                                <div className="row mb-2">

                                    <div className="col-md-6">
                                        <FormTextarea
                                            label={data.remarkLabel}
                                            name={data.remarkName}
                                            value={rcds[data.remarkName]}
                                            holder={data.remarkHolder}
                                            errorMessage={errorMessages.remarks} // Pass the error message for roleLevel
                                            onChange={handleChange}
                                            icon={icon.pen}

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
                                                showUpdate={!!rcds.designationId}
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

                    <div>
                        {/* Navigation Tabs */}
                        <ul className="nav nav-tabs">
                            <li className="nav-item m-2">
                                <button
                                    className={`btn ${activeTab === "unprocessed" ? "btn-primary active" : "btn-light"}`}
                                    onClick={() => setActiveTab("unprocessed")}
                                >
                                    Unprocessed Attendance
                                </button>
                            </li>
                            <li className="nav-item m-2">
                                <button
                                    className={`btn ${activeTab === "processed" ? "btn-primary active" : "btn-light"}`}
                                    onClick={() => setActiveTab("processed")}
                                >
                                    Processed Attendance
                                </button>
                            </li>
                            <li className="nav-item m-2">
                                <button
                                    className={`btn ${activeTab === "locked" ? "btn-primary active" : "btn-light"}`}
                                    onClick={() => setActiveTab("locked")}
                                >
                                    Locked Attendance
                                </button>
                            </li>
                        </ul>

                        {/* Content Display Based on Active Tab */}
                        <div className="mt-3">
                            {activeTab === "unprocessed" && (
                               <table className="table table-bordered table-striped">
                               <thead className="thead-dark">
                                   <tr>
                                       <th>
                                           All <input 
                                               type="checkbox" 
                                               onChange={handleSelectAll} 
                                               checked={selectedRecords.length === employees.length}
                                           />
                                       </th>
                                       <th>S.No</th>
                                       <th>Location</th>
                                       <th>DDO</th>
                                       <th>Employee Code</th>
                                       <th>Employee Name</th>
                                       <th>Department</th>
                                       <th>Designation</th>
                                       <th>Nature Type</th>
                                       <th>Posting City</th>
                                       <th>Fund Type</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {employees.map((employee) => (
                                       <tr key={employee.id}>
                                           <td>
                                               <input
                                                   type="checkbox"
                                                   checked={selectedRecords.some((item) => item.id === employee.id)}
                                                   onChange={() => handleCheckboxChange(employee)}
                                               />
                                           </td>
                                           <td>{employee.id}</td>
                                           <td>{employee.location}</td>
                                           <td>{employee.ddo}</td>
                                           <td>{employee.employeeCode}</td>
                                           <td>{employee.employeeName}</td>
                                           <td>{employee.department}</td>
                                           <td>{employee.designation}</td>
                                           <td>{employee.natureType}</td>
                                           <td>{employee.postingCity}</td>
                                           <td>{employee.fundType}</td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                            )}

                            {activeTab === "processed" && (
                                <ul>
                                    <li>Processed Record 1</li>
                                    <li>Processed Record 2</li>
                                    <li>Processed Record 3</li>
                                </ul>
                            )}

                            {activeTab === "locked" && (
                                <ul>
                                    <li>Locked Record 1</li>
                                    <li>Locked Record 2</li>
                                    <li>Locked Record 3</li>
                                </ul>
                            )}
                        </div>
                    </div>





                </div>
            </div >
        </>
    );
};

export default EmployeeAttendance;

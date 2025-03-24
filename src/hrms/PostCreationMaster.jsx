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

const PostCreationMaster = () => {
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
    const [locationRcds, setLocationRcds] = useState([{ value: "", label: "" },]);
    const [ddoRcds, setDdoRcds] = useState([{ value: "", label: "" },]);
    const [departmentRcds, setDepartmentRcds] = useState([{ value: "", label: "" },]);
    const [designationRcds, setdesignationRcds] = useState([{ value: "", label: "" },]);
    const [fundTypeRcds, setFundTypeRcds] = useState([{ value: "", label: "" },]);
    const [disciplineRcds, setdisciplineRcds] = useState([{ value: "", label: "" },]);
    const [budgetHeadRcds, setbudgetHeadRcds] = useState([{ value: "", label: "" },]);
    const [natureTypeRcds, setNatureRcds] = useState([{ value: "", label: "" },]);
    const [gradeRcds, setGradeRcds] = useState([{ value: "", label: "" },]);
    const [payLevelRcds, setPayLevelRcds] = useState([{ value: "", label: "" },]);
    const data = {
        locationLabel: "Collage/Location",
        locationName: "locationId",
        locationHolder: "Select Collage/Location",
        ddoLabel: "DDO",
        ddoName: "ddoId",
        ddoHolder: "Select DDO",
        departmentLabel: "Department",
        departmentName: "departmentId",
        departmentHolder: "Select Department",
        designationLabel: "Designation",
        designationName: "designationId",
        designationHolder: "Select Designation",
        fundTypeLabel: "Fund Type",
        fundTypeName: "fundtypeId",
        fundTypeHolder: "Select Fund Type",
        disciplineLabel: "Discipline",
        disciplineName: "disciplineId",
        disciplineHolder: "Select Discipline",
        budgetHeadLabel: "Budget Head",
        budgetHeadName: "budgeHeadId",
        budgetHeadHolder: "Select Budget Head",
        natureTypeLabel: "Nature Type",
        natureTypeName: "natureTypeId",
        natureTypeHolder: "Select Nature Type",
        totalPostLabel: "Total Post",
        totalPostName: "totalPost",
        totalPostHolder: "Total Post",
        gradeLabel: "Entry Group",
        gradeName: "groupId",
        gradeHolder: "Select Entry Group",
        actualSanctionOrderLabel: "Actual Sanction Order",
        actualSanctionOrderName: "actualSanctionOrder",
        actualSanctionOrderHolder: "Enter Actual Sanction Order",
        payLevelLabel: "Entry Pay Level",
        payLevelName: "payLevel",
        payLevelHolder: "Select Pay Level",
        save: "Save",
        delete: "Delete",
        update: "Update",
        back: "Back",
        reset: "Reset",
    }
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
        postCreationId: "",
        locationId: "",
        ddoId: "",
        departmentId: "",
        designationId: "",
        fundTypeId: "",
        disciplineId: "",
        budgetHeadId: "",
        natureTypeId: "",
        totalPost: "",
        groupId: "",
        actualSanctionOrder: "",
        payLevelId: ""
    })
    const [searchRcds, setSearchRcds] = useState({
        locationId: "",
        departmentId: "",
        designationId: "",
        disciplineId: "",
    });
    const [errorMessages, setErrorMessages] = useState({
        locationId: "",
        ddoId: "",
        departmentId: "",
        designationId: "",
        fundTypeId: "",
        disciplineId: "",
        budgetHeadId: "",
        natureTypeId: "",
        totalPost: "",
        gradeId: "",
        actualSanctionOrder: "",
        payLevel: ""
    });
    const secretKey = retrieveFromCookies("AESDecKey");
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
    const validateFields = () => {
        const errors = {};
        if (!rcds.locationId) errors.locaionId = "Collage/Location is required";
        if (!rcds.departmentId) errors.departmentId = "Department is required";
        if (!rcds.designationId) errors.designationId = "Designation is required";
        if (!rcds.fundTypeId) errors.fundTypeId = "Fund Type is required";
        if (!rcds.disciplineId) errors.disciplineId = "Discipline is required";
        if (!rcds.budgetHeadId) errors.budgetHeadId = "Budget Head is required";
        if (!rcds.natureTypeId) errors.natureTypeId = "Nature Type is required";
        if (!rcds.totalPost) errors.totalPost = "Post is required";
        if (!rcds.groupId) errors.groupId = "Group is required";
        if (!rcds.actualSanctionOrder) errors.actualSanctionOrder = "Actual Sanction Order is required";
        if (!rcds.payLevelId) errors.payLevelId = "Paylevel is required";
        return errors;
    };
    const handleBack = () => {
        setHighlightRow(false); // changes
        deleteCooldown.current = false;
        if (saveButtonRef.current) {
            saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
        }
        setRcds({
            locationId: "",
            ddoId: "",
            departmentId: "",
            designationId: "",
            fundTypeId: "",
            disciplineId: "",
            budgetHeadId: "",
            natureTypeId: "",
            totalPost: "",
            groupId: "",
            actualSanctionOrder: "",
            payLevelId: ""
        });
        setIsEditing(false);
    }
    const handleReset = () => {
        setRcds({
            locationId: "",
            ddoId: "",
            departmentId: "",
            designationId: "",
            fundTypeId: "",
            disciplineId: "",
            budgetHeadId: "",
            natureTypeId: "",
            totalPost: "",
            groupId: "",
            actualSanctionOrder: "",
            payLevelId: ""
        });
        setErrorMessages("");
    }
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
            userId: s_user.userId,
            publicIp: s_user.publicIp,
        };
        try {

            const ciphertext = encAESData(secretKey, updatedRcds);
            if (rcds.postCreationId) {
                // Update case
                deleteCooldown.current = false;
                const response = await getUpdate("hrms", "postCreationMaster", ciphertext);
                responseData = checkResponseStatus(response);
            } else {
                // Save case
                const response = await getSave("hrms", "postCreationMaster", ciphertext);
                responseData = checkResponseStatus(response);
            }

            if (responseData) {
                if (responseData.rType === "Y") {
                    const jsonData = JSON.parse(responseData.rData);
                    const decryptedData = decAESData(secretKey, jsonData);
                    setRcds({
                        locationId: "",
                        ddoId: "",
                        departmentId: "",
                        designationId: "",
                        fundTypeId: "",
                        disciplineId: "",
                        budgetHeadId: "",
                        natureTypeId: "",
                        totalPost: "",
                        groupId: "",
                        actualSanctionOrder: "",
                        payLevelId: "",
                        postCreationId: null,
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

    }
    useEffect(() => {
        if (resetSelect) {
            setResetSelect(false);
        }
    }, [resetSelect]);

    const getData = async () => {
        try {
            const menuId = retrieveFromLocalStorage("activeMenuId");
            const ciphertext = encAESData(secretKey, { menuId });
            const response = await getList("hrms", "postCreationMaster", ciphertext, {});
            const responseData = checkResponseStatus(response);
            if (responseData.rType === "Y") {
                if (responseData.rData) {
                    const jsonData = JSON.parse(responseData.rData);
                    const decryptedData = decAESData(secretKey, jsonData);
                    const header = JSON.parse(decryptedData.recData.header);
                    let updatedData = [];
                    if (decryptedData.recData.data) {
                        const dataRec = JSON.parse(decryptedData.recData.data);
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
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
            // getData();
        }, 500);
        setTimeout(() => {
            resetTable();
        }, 500);
    }, []);

    const handleDelete = async (postCreationId) => {
        deleteCooldown.current = true;
        setShowSave(false);
        setLoading(true);
        try {
            const ciphertext = encAESData(secretKey, { postCreationId });
            const response = await getDelete("hrms", "postCreationMaster", ciphertext);
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
                    const newData = prevTableData.filter((item) => item.postCreationId !== postCreationId);
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
            setShowSave(true);
            deleteCooldown.current = false;
            setTimeout(() => {
                setErrorMessageVisibleComponent(false);
                setErrorDivMessage("");
            }, 4000);
            setHighlightRow(false); //changes
        }
    };

    const viewRecord = async (postCreationId) => {
        deleteCooldown.current = true;
        setErrorMessages("");
        try {
            const ciphertext = encAESData(secretKey, { postCreationId });
            const response = await getViewRecord("hrms", "postCreationMaster", ciphertext);
            const responseData = checkResponseStatus(response);
            if (responseData.rData) {
                const recJson = JSON.parse(responseData.rData);
                const decryptedData = decAESData(secretKey, recJson);
                const dataToRec = JSON.parse(decryptedData.recData);
                const dataToSet = dataToRec[0];
                setRcds({
                    postCreationId: dataToSet.postCreationId,
                    locationId: dataToSet.locationId,
                    ddoId: dataToSet.ddoId,
                    departmentId: dataToSet.departmentId,
                    designationId: dataToSet.designationId,
                    fundTypeId: dataToSet.fundTypeId,
                    disciplineId: dataToSet.disciplineId,
                    budgetHeadId: dataToSet.budgetHeadId,
                    natureTypeId: dataToSet.natureTypeId,
                    totalPost: dataToSet.totalPost,
                    groupId: dataToSet.groupId,
                    actualSanctionOrder: dataToSet.actualSanctionOrder,
                    payLevelId: String(dataToSet.payLevelId),
                    userId: s_user.userId, // Set userId here
                    publicIp: s_user.publicIp, // Set publicIp here
                });
            } else {
                console.error("encryptData is undefined in the backend response.");
            }
        } catch (error) {
            console.error("Error retrieving data:", error);
        }
    };

    const demparmentDropdown = {
        table: "department_mast",
        fields: "DEPT_ID,DEPARTMENT",
        condition: "1=1",
        orderBy: ""
    }
    const natureTypeDropdown = {
        table: "nature_mast",
        fields: "NATURE_ID,NATURE",
        condition: "1=1",
        orderBy: " ",
    }
    const disciplineDropdown = {
        table: "discipline_mast",
        fields: "DISC_ID,DISCIPLINE",
        condition: "1=1",
        orderBy: " ",
    }
    const locationDropdown = {
        table: "leave_location_mast lm, ddolocationmapping dlm",
        fields: "DISTINCT dlm.LOCATION_CODE, lm.LOCATION_NAME",
        condition: "lm.LOCATION_CODE = dlm.LOCATION_CODE",
        orderBy: " ",
    }
    const ddoDropdown = {
        table: "ddolocationmapping dlm LEFT JOIN ddo ON ddo.DDO_ID = dlm.DDO_ID",
        fields: "dlm.DDO_ID, ddo.DDONAME",
        condition: `dlm.LOCATION_CODE = "${rcds.locationId}"`,
        orderBy: "",
    }
    const fundTypeDropdown = {
        table: "fund_type_master",
        fields: "fund_type_id,description",
        condition: "1=1",
        orderBy: "order by fund_type_order"
    }
    const budgetHeadDropdown = {
        table: "fund_type_master f JOIN budget_head_master b ON f.FUND_TYPE_ID = b.FUND_TYPE",
        fields: "b.BUDGET_HEAD_ID, GET_BUDGET_HEAD(b.BUDGET_HEAD_ID) AS BUDGET_HEAD_NAME",
        condition: `f.FUND_TYPE_ID = '${rcds.fundTypeId}' AND b.ISACTIVE = 'Y' AND b.ISPENSION = 'Y'`,
        orderBy: "ORDER BY BUDGET_HEAD_NAME",
    };
    const designationDropdown = {
        table: "designation_mast",
        fields: "DESIGNATION_ID,DESIGNATION",
        condition: "1=1",
        orderBy: " "
    }
    const gradeMasterDropdown = {
        table: "grade_mast",
        fields: "GRADE_ID,GRADE_NAME",
        condition: "1=1",
        orderBy: " ",
    }
    const gradeDetailsDropdown = {
        table: "grade_details gd JOIN grade_mast gm ON gd.GRADE_ID = gm.GRADE_ID",
        fields: "gd.GD_ID, gd.BASIC_FROM",
        condition: `gm.GRADE_ID = '${rcds.groupId}'`,
        orderBy: " ",
    };

    const getDepartmentDropdownData = async () => {
        getDropDown(demparmentDropdown, departmentRcds, setDepartmentRcds, "hrms", secretKey);
    }
    const getNatureTypeDropDown = async () => {
        getDropDown(natureTypeDropdown, natureTypeRcds, setNatureRcds, "hrms", secretKey)
    }
    const getDisciplineDropDown = async () => {
        getDropDown(disciplineDropdown, disciplineRcds, setdisciplineRcds, "hrms", secretKey)
    }

    useEffect(() => {
console.log(disciplineRcds,"||||||------disciplineRcds");
    },[disciplineRcds]);

    const getLocationDropdown = async () => {
        getDropDown(locationDropdown, locationRcds, setLocationRcds, "common", secretKey)
    }
    const getDdoDropdown = async () => {
        getDropDown(ddoDropdown, ddoRcds, setDdoRcds, "common", secretKey);
    }
    const getFundTypeDropdown = async () => {
        getDropDown(fundTypeDropdown, fundTypeRcds, setFundTypeRcds, "budget", secretKey);
    }
    const getBudgetHeadDropdown = async () => {
        getDropDown(budgetHeadDropdown, budgetHeadRcds, setbudgetHeadRcds, "budget", secretKey);
    }
    const getDesignationDropdown = async () => {
        getDropDown(designationDropdown, designationRcds, setdesignationRcds, "hrms", secretKey);

    }
    const getGradeMasterDropdown = async () => {
        getDropDown(gradeMasterDropdown, gradeRcds, setGradeRcds, "hrms", secretKey);
    }
    const getGradeDetailsDropdown = async () => {
        getDropDown(gradeDetailsDropdown, payLevelRcds, setPayLevelRcds, "hrms", secretKey);
    }

    useEffect(() => {
        getGradeMasterDropdown();
        getGradeDetailsDropdown();
    }, [rcds.groupId]);

    useEffect(() => {
        getBudgetHeadDropdown();
        getFundTypeDropdown();
    }, [rcds.fundTypeId]);

    useEffect(() => {
        getDdoDropdown();
        getLocationDropdown();
    }, [rcds.locationId]);

    useEffect(() => {
        getDisciplineDropDown();
        getDesignationDropdown();
        getNatureTypeDropDown();
        getDepartmentDropdownData();
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
                            const id = params.data.postCreationId;
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
                                    const id = params.data.postCreationId; // Access row data to get the salId
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
    ];
    //--------------------Search Data By Advance Search Option --------------------//
    useEffect(() => {
        if (columnDefsApi && columnDefsApi.length > 0) {
            setTableHeader(columnDefs);
        }
    }, [columnDefsApi]);

    const filterTableData = () => {
        const filteredData = rowData.filter((apiDataRec) => {
            const matchesLocation = searchRcds.locationId ? apiDataRec.locationId === searchRcds.locationId : true;
            const matchesDepartment = searchRcds.departmentId ? apiDataRec.departmentId === searchRcds.departmentId : true;
            const matchesDesignation = searchRcds.designationId ? apiDataRec.designationId === searchRcds.designationId : true;
            const matchesDiscipline = searchRcds.disciplineId ? apiDataRec.disciplineId === searchRcds.disciplineId : true;
            return matchesLocation && matchesDepartment && matchesDesignation && matchesDiscipline;
        }).map((item, index) => ({
            serialNo: index + 1,
            location: item.location,
            ddo: item.ddo,
            department: item.department,
            designation: item.designation,
            fundType: item.fundType,
            discipline: item.discipline,
            budgetHead: item.budgetHead,
            natureType: item.natureType,
            totalPost: item.totalPost,
            group: item.group,
            payLevel: item.payLevel,
            actualSanctionOrder: item.actualSanctionOrder,
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
                    <form action="#" className="mb-5">
                        <div className="col-6">
                            <p className="card-titile h6">{retrieveFromLocalStorage("pageName")}</p>
                        </div>
                        <div className="card">
                            <div className="card-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <SelectComponent
                                            autofocus={true}
                                            label={data.locationLabel}
                                            name={data.locationName}
                                            holder={data.locationHolder}
                                            selectedValue={rcds.locationId}
                                            options={locationRcds}
                                            errorMessage={errorMessages.locationId}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    locationId: value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <SelectComponent
                                            label={data.ddoLabel}
                                            name={data.ddoName}
                                            holder={data.ddoHolder}
                                            selectedValue={rcds.ddoId}
                                            options={ddoRcds}
                                            errorMessage={errorMessages.ddoId}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    ddoId: value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <SelectComponent
                                            label={data.departmentLabel}
                                            name={data.departmentName}
                                            holder={data.departmentHolder}
                                            selectedValue={rcds.departmentId}
                                            options={departmentRcds}
                                            errorMessage={errorMessages.departmentId}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    departmentId: value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <SelectComponent
                                            label={data.designationLabel}
                                            name={data.designationName}
                                            holder={data.designationHolder}
                                            selectedValue={rcds.designationId}
                                            options={designationRcds}
                                            errorMessage={errorMessages.designationId}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    designationId: value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <SelectComponent
                                            label={data.fundTypeLabel}
                                            name={data.fundTypeName}
                                            holder={data.fundTypeHolder}
                                            selectedValue={rcds.fundTypeId}
                                            options={fundTypeRcds}
                                            errorMessage={errorMessages.fundTypeId}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    fundTypeId: value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <SelectComponent
                                            label={data.disciplineLabel}
                                            name={data.disciplineName}
                                            holder={data.disciplineHolder}
                                            selectedValue={rcds.disciplineId}
                                            options={disciplineRcds}
                                            errorMessage={errorMessages.disciplineId}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    disciplineId: value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <SelectComponent
                                            label={data.budgetHeadLabel}
                                            name={data.budgetHeadName}
                                            holder={data.budgetHeadHolder}
                                            selectedValue={rcds.budgetHeadId}
                                            options={budgetHeadRcds}
                                            errorMessage={errorMessages.budgetHeadId}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    budgetHeadId: value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <SelectComponent
                                            label={data.natureTypeLabel}
                                            name={data.natureTypeName}
                                            holder={data.natureTypeHolder}
                                            selectedValue={rcds.natureTypeId}
                                            options={natureTypeRcds}
                                            errorMessage={errorMessages.natureTypeId}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    natureTypeId: value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <FormText
                                            label={data.totalPostLabel}
                                            name={data.totalPostName}
                                            holder={data.totalPostHolder}
                                            value={rcds.totalPost}
                                            errorMessage={errorMessages.locationId}
                                            onChange={handleChange}
                                            icon={icon.user}
                                            Maxlength={25}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <SelectComponent
                                            label={data.gradeLabel}
                                            name={data.gradeName}
                                            holder={data.gradeHolder}
                                            selectedValue={rcds.groupId}
                                            options={gradeRcds}
                                            errorMessage={errorMessages.gradeId}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    groupId: value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <FormText
                                            label={data.actualSanctionOrderLabel}
                                            name={data.actualSanctionOrderName}
                                            holder={data.actualSanctionOrderHolder}
                                            value={rcds.actualSanctionOrder}
                                            errorMessage={errorMessages.actualSanctionOrder}
                                            onChange={handleChange}
                                            icon={icon.user}
                                            Maxlength={25}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <SelectComponent
                                            label={data.payLevelLabel}
                                            name={data.payLevelName}
                                            holder={data.payLevelHolder}
                                            selectedValue={rcds.payLevelId}
                                            options={payLevelRcds}
                                            errorMessage={errorMessages.payLevel}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    payLevelId: value,
                                                }))
                                            }
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
                                                showUpdate={!!rcds.postCreationId}
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
                    <p className='h6 card-title list-header'> <small> List of Post Creation<span className='parenthesis'>(</span>s<span className='parenthesis'>)</span></small></p>
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
                                                label={data.locationLabel}
                                                name={data.locationName}
                                                holder={data.locationHolder}
                                                selectedValue={searchRcds.locationId}
                                                options={locationRcds}
                                                onChange={handleSearchChange}
                                                onSelects={(value) =>
                                                    setSearchRcds((prevState) => ({
                                                        ...prevState,
                                                        locationId: value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <SelectComponent
                                                label={data.departmentLabel}
                                                name={data.departmentName}
                                                holder={data.departmentHolder}
                                                selectedValue={searchRcds.departmentId}
                                                options={departmentRcds}
                                                onChange={handleSearchChange}
                                                onSelects={(value) =>
                                                    setSearchRcds((prevState) => ({
                                                        ...prevState,
                                                        departmentId: value,
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <SelectComponent
                                                label={data.disciplineLabel}
                                                name={data.disciplineName}
                                                holder={data.disciplineHolder}
                                                selectedValue={searchRcds.disciplineId}
                                                options={disciplineRcds}
                                                onChange={handleSearchChange}
                                                onSelects={(value) =>
                                                    setSearchRcds((prevState) => ({
                                                        ...prevState,
                                                        disciplineId: value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <SelectComponent
                                                label={data.designationLabel}
                                                name={data.designationName}
                                                holder={data.designationHolder}
                                                selectedValue={searchRcds.designationId}
                                                options={designationRcds}
                                                onChange={handleSearchChange}
                                                onSelects={(value) =>
                                                    setSearchRcds((prevState) => ({
                                                        ...prevState,
                                                        designationId: value,
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="row mb-3 offset-4 ">
                                        <div className="col-md-6 d-flex">
                                            <button className="me-1 btn btn-primary btn-color"
                                                onClick={filterTableData}>Search</button>
                                            <button className="btn btn-warning btn-color ms-2"
                                                onClick={() => {
                                                    setSearchRcds({
                                                        locationId: "",
                                                        departmentId: "",
                                                        designationId: "",
                                                        disciplineId: "",
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

export default PostCreationMaster
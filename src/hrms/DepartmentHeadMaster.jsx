// Developer : Tushar Rajput

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
import { getDelete, getDropDown, getList, getSave, getUpdate, getViewRecord } from "../utils/api";
import SelectComponent from "../components/SelectComponent";


const DepartmentHeadMaster = () => {
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

   

    const [locationRcds, setLocationRcds] = useState([
        { value: "", label: "" },
    ])

    const [rcds, setRcds] = useState({
        departHeadId: "",
        headName: "",
        departmentAlias: "",
        location: "",
        ddo: "",
        department: []
    })

    const [detailRcds, setDetailRcds] = useState({
        departmentId: ""
    })
    const [errorMessages, setErrorMessages] = useState({
        departHeadId: "",
        headName: "",
        location: "",
        ddo: "",
        departmentAlias: "",
        departmentId: "",
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
        deptFromLabel: "Head Name",
        deptFromName: "DeptName",
        departmentFromHolder: "Department Name",
        locationlable: "Location/College",
        DdoLable: "DDO",
        baseToLabel: "Head Alias",
        baseToName: "HeadAlias",
        HeadAliasHolder: "Head Alias",
        DepartmentLabel: "Department",
        department: "departmentId",
        location: "location",
        ddo: "ddo",
        save: "Save",
        delete: "Delete",
        update: "Update",
        back: "Back",
        reset: "Reset",
    }

    const validateGradeDetails = () => {
        const errors = {};
        if (!rcds.headName) errors.headName = "Department Name is required.";
        if (!rcds.departmentAlias) errors.departmentAlias = "Department Alias is required.";
        if (!rcds.location) errors.location = "Location is required.";
        if (!rcds.ddo) errors.ddo = "Ddo is required.";
        if (!detailRcds.departmentId) errors.departmentId = "Department is required.";
        return errors;
    }

    const secretKey = retrieveFromCookies("AESDecKey");
    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setRcds((prevState) => ({
            ...prevState,
            [name]: value,
        }));

        setDetailRcds((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        setErrorMessages((prevErrors) => ({
            ...prevErrors,
            [name]: "",
        }));
    };
    const [searchRcds, setSearchRcds] = useState({
        headName: "",
    });
    const handleSearchChange = (evt) => {
        const { name, value } = evt.target;
        setSearchRcds((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };
    const handleBack = () => {
        setHighlightRow(false);
        deleteCooldown.current = false;
        if (saveButtonRef.current) {
            saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
        }
        setRcds({
            departHeadId: "",
            headName: "",
            departmentAlias: "",
            department: [],
        });
        setDetailRcds({
            departmentId: "",
        })
        setApiData([]);
        setIsEditing(false);
    };
    const handleReset = () => {
        setRcds({
            departHeadId: "",
            headName: "",
            departmentAlias: "",
            department: []

        });
        setDetailRcds({
            departmentId: "",
        })
        setApiData([]);
        setErrorMessages("");
    };

    const addMoreGroupDetails = (evt) => {
        evt.preventDefault();

        const errors = validateGradeDetails();
        if (Object.keys(errors).length > 0) {
            setErrorMessages(errors);
            return;
        }
        if (!detailRcds.departmentId) {
            setErrorMessages({ departmentId: "Department is required." });
            return;
        }

        const departmentExists = apiData.some((item) => item.departmentId === detailRcds.departmentId);
        if (departmentExists) {
            setErrorMessages({
                ...errorMessages,
                departmentId: "Record already exists.",
            });
            return;
        }

        let departLabel = "";
        clgCatgRcds.filter((department) => {
            return department.value === detailRcds.departmentId;
        }).map((departmentdf) => {
            departLabel = departmentdf.label;
        });

        setApiData((prevData) => [
            ...prevData,
            {
                id: prevData.length + 1,
                departmentId: detailRcds.departmentId,
                departLabel: departLabel,
            },
        ]);
    };

    const deleteGroupRecord = ({ departHeadId }) => {
        const updatedData = apiData.filter((_, index) => index !== departHeadId - 1);
        setApiData(updatedData);
    };

    const handleUpdateGroup = (evt) => {
        console.log(rcds);
        evt.preventDefault();

        if (!rcds.departHeadId) {
            console.error("DepartHeadId is missing in the update record.");
            return;
        }

        if (!detailRcds.departmentId) {
            setErrorMessages({ departmentId: "Department is required." });
            return;
        }

        const departmentExists = apiData.some((item) => item.departmentId === detailRcds.departmentId);
        if (departmentExists) {
            setErrorMessages({
                ...errorMessages,
                departmentId: "Record already exists.",
            });
            return;
        }

        let departLabel = "";
        clgCatgRcds.filter((department) => {
            return department.value === detailRcds.departmentId
        }).map((departmentdf) => {
            departLabel = departmentdf.label;
        })

        setApiData((prevData) => [
            ...prevData,
            {
                id: prevData.length + 1,
                departmentId: detailRcds.departmentId,
                departLabel: departLabel
            }
        ]);
        const updatedData = apiData.map(item => {
            const isMatch = item.departHeadId === rcds.departHeadId;
            return isMatch ? { ...item, ...detailRcds } : item;
        });
        setDetailRcds({
            departmentId: "",
        });

        setApiData(updatedData);
        console.log("Data updated: ", updatedData);
    };

    const [allDept, setAllDept] = useState([{ value: "", label: "" }]);
    const [clgCatgRcds, setclgCatgRcds] = useState([
        { value: "", label: "" },
    ]);
    const clgCatgQuery = {
        table: "department_mast",
        fields: "DEPT_ID,DEPARTMENT",
        condition: "1=1",
        orderBy: "",
    }

    const getClgCatgDropDownData = async () => {
        getDropDown(clgCatgQuery, allDept, setAllDept, "hrms", secretKey);
    }

    useEffect(() => {
        getClgCatgDropDownData();
    }, []);

    useEffect(() => {
        setclgCatgRcds([...allDept]);
    }, [allDept]);   

    const locationQuery = {
        table: "leave_location_mast",
        fields: "location_code,location_name",
        condition: "1=1 ",
        orderBy: "",
    };

    const getLocationDropDownData = async () => {
        try {
            getDropDown(
                locationQuery,
                locationRcds,
                setLocationRcds,
                "common",
                secretKey
            );
        } catch {
            console.log(error);
        }
    };

    useEffect(() => {
        getLocationDropDownData();
    }, []);

    const [DDORcds, setDDORcds] = useState([{ value: "", label: "" }]);

    const DDOQuery = {
        table: " ddo left join ddolocationmapping dlm on ddo.ddo_id = dlm.DDO_ID",
        fields: "DISTINCT ddo.ddo_id, ddo.DDONAME",
        condition: `dlm.LOCATION_CODE='${rcds.location}'`,
        orderBy: "",
    };

    const getDDODropDownData = async () => {
        console.log(DDOQuery);
        try {
            getDropDown(DDOQuery, DDORcds, setDDORcds, "common", secretKey);
        } catch {
            console.log(error);
        }
    };

    useEffect(() => {
        getDDODropDownData();
    }, [rcds.location]);

    const validateFields = () => {
        const errors = {};
        if (!rcds.departHeadId && !detailRcds.departmentId) {
            errors.departmentId = "Department is required.";
        }
        if (!rcds.departmentAlias) errors.departmentAlias = " Department Alias Is Required."
        if (!rcds.headName) errors.headName = "Head Name Is Required."
        return errors;
    }

    const handleCreate = async (evt) => {
        let responseData;
        evt.preventDefault();
        const errors = validateFields();
        if (Object.keys(errors).length > 0) {
            setErrorMessages(errors);
            setLoading(false);
            return;
        }

        const updatedRcds = {
            ...rcds,
            userId: s_user.userId,
            publicIp: s_user.publicIp,
            department: [...apiData],
        };


        try {
            const ciphertext = encAESData(secretKey, updatedRcds);
            if (rcds.departHeadId) {
                deleteCooldown.current = false;
                const response = await getUpdate("hrms", "departHeadMaster", ciphertext);
                responseData = checkResponseStatus(response);
            } else {
                const response = await getSave("hrms", "departHeadMaster", ciphertext);
                responseData = checkResponseStatus(response);
            }
            if (responseData) {
                if (responseData.rType === "Y") {
                    const jsonData = JSON.parse(responseData.rData);
                    const decryptedData = decAESData(secretKey, jsonData);
                    setRcds({
                        departHeadId: "",
                        headName: "",
                        userId: rcds.userId,
                        publicIp: rcds.publicIp,
                    });
                    setDetailRcds({
                        department: [],
                    })
                    setApiData([])
                    setErrorMessageVisibleComponent(true);
                    setErrorType(true);
                    setErrorDivMessage(responseData.rMessage);
                    setTimeout(() => {
                        setErrorMessageVisibleComponent(false);
                        setErrorDivMessage("");
                    }, 4000);
                } else {
                    setErrorMessageVisibleComponent(true);
                    setErrorDivMessage(responseData.rMessage);

                    setTimeout(() => {
                        setErrorMessageVisibleComponent(false);
                        setErrorDivMessage("");
                    }, 4000);
                }
                getData();
            }
        } catch (error) {
            console.error("Error during create/update:", error);
            setResponseMessage("Error saving data: " + error.message);
        } finally {
            setLoading(false);
            setHighlightRow(false);
            deleteCooldown.current = false;
        }
    };

    useEffect(() => {
        getData();
        window.scrollTo({ top: 0, behavior: "smooth" });

    }, []);



    const getData = async () => {
        try {
            const menuId = retrieveFromLocalStorage("activeMenuId");
            const ciphertext = encAESData(secretKey, { menuId });

            const response = await getList("hrms", "departHeadMaster", ciphertext, {});
            const responseData = checkResponseStatus(response);

            if (responseData.rType === "Y") {
                if (responseData.rData) {
                    const jsonData = JSON.parse(responseData.rData);

                    const decryptedData = decAESData(secretKey, jsonData);

                    console.log(decryptedData);

                    const header = JSON.parse(decryptedData.recData.header);

                    let parsedLocations = [];
                    let updatedData = [];
                    if (decryptedData.recData.data) {
                        const dataRec = JSON.parse(decryptedData.recData.data);
                        console.log(dataRec, "==========================================");
                        const departmentIdsInDataRec = dataRec.map(item => {
                            const parsedItem = JSON.parse(item);  
                            return parsedItem[0]?.department;  
                        });
                        console.log("Department IDs to remove:", departmentIdsInDataRec);

                        setclgCatgRcds((prevState) => {
                            return prevState.filter(item => !departmentIdsInDataRec.includes(item.label));
                        });
    
                        console.log("Updated clgCatgRcds after removing selected departments:", clgCatgRcds);
    
                        
                        dataRec.forEach((jsonString) => {
                            const parsedArray = JSON.parse(jsonString);
                            if (parsedArray.length > 0) {
                                parsedLocations.push(parsedArray[0]);
                            }
                        });

                        updatedData = parsedLocations.map((item, index) => ({
                            ...item,
                            serialNo: index + 1,
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
                                whiteSpace: "normal",
                                wordWrap: "break-word",
                            },
                            autoHeight: true,
                        }));

                    setTimeout(() => {
                        setTableData(updatedData);
                        setColumnDefsApi(updatedHeader);
                        setRowData(updatedData);
                    }, 500);
                }
            } else {
                setColumnDefsApi([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const viewRecord = async (departHeadId) => {
        try {
            deleteCooldown.current = true;

            setErrorMessages("");
            const ciphertext = encAESData(secretKey, { departHeadId });
            const response = await getViewRecord(
                "hrms",
                "departHeadMaster",
                ciphertext
            );

            const responseData = checkResponseStatus(response);
            if (responseData.rData) {
                const recJson = JSON.parse(responseData.rData);
                const decryptedData = decAESData(secretKey, recJson);
                const dataToRec = JSON.parse(decryptedData.recData);
                const dataToSet = dataToRec[0];
                console.log("Decrypted Data:", dataToSet);

                setRcds({
                    departHeadId: dataToSet.deptHeadId,
                    headName: dataToSet.departmentHeadName,
                    departmentAlias: dataToSet.deptHeadAlias,
                    department: dataToSet.department,
                });

                const updatedApiData = dataToSet.department.map((dpart, sno) => {
                    return {
                        id: sno + 1,
                        departmentId: dpart,
                    };
                });
                let updatedApiDataWithLabels = updatedApiData.map((data) => {
                    let departLabel = '';
                    const department = allDept.find(department => department.value === data.departmentId);
                    if (department) {
                        departLabel = department.label;
                    }

                    return {
                        ...data,
                        departLabel,
                    };
                });
                setApiData(updatedApiDataWithLabels);
            } else {
                console.error("EncryptData is undefined in the backend response.");
            }
        } catch (error) {
            console.error("Error retrieving data:", error);
        }
    };

    const handleDelete = async (departHeadId) => {

        deleteCooldown.current = true;
        setLoading(true);
        try {
            const ciphertext = encAESData(secretKey, { departHeadId });

            const response = await getDelete(
                "hrms",
                "departHeadMaster",
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
                setErrorMessageVisibleComponent(true);
                setErrorType(true);
                setErrorDivMessage(responseData.rMessage);
                setTimeout(() => {
                    setErrorMessageVisibleComponent(false);
                    setErrorDivMessage("");
                }, 4000);

                setTableData((prevTableData) => {
                    const newData = prevTableData.filter((item) => item.departHeadId !== departHeadId);
                    const updatedTableData = newData.map((item, index) => ({
                        ...item,
                        serialNo: index + 1,
                    }));
                    setRowData(updatedTableData);
                    return updatedTableData;
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

            deleteCooldown.current = false;

            setTimeout(() => {
                setErrorMessageVisibleComponent(false);
                setErrorDivMessage("");
            }, 4000);
            setHighlightRow(false);
        }
    };

    const dynamicTableData = {
        headers: ["SNo.", "Department", "Delete"],
        rows: apiData.map((item, sno) => ({
            id: sno + 1,
            one: item.departLabel,
            three: !isEditing && (
                <span
                    className={`manipulation-icon delete-color ${deleteCooldownForDetailGrid.current ? "disabled" : ""}`}
                    onClick={() => {
                        if (!deleteCooldownForDetailGrid.current) {
                            const departHeadId = { departHeadId: sno + 1 };
                            deleteGroupRecord(departHeadId);
                        }
                    }}
                    style={{
                        pointerEvents: deleteCooldownForDetailGrid.current ? "none" : "auto",
                        opacity: deleteCooldownForDetailGrid.current ? 0.5 : 1,
                    }}
                >
                    <FontAwesomeIcon icon={faTrash} />
                    <span className="manipulation-text"> Delete </span>
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
            width: 100,
            headerClass: 'ag-header-cell',
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
                            setHighlightRow(true);
                            const id = params.data.departHeadId;
                            viewRecord(id);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                    >
                        <FontAwesomeIcon icon={faEdit} className="icon-size" />
                    </span>

                    <span

                        className={`manipulation-icon delete-color ${deleteCooldown.current ? "disabled" : ""
                            } mx-1`}
                        onClick={() => {
                            if (!deleteCooldown.current) {

                                const confirmDelete = window.confirm(
                                    "Are you sure you want to delete this record?"
                                );
                                if (confirmDelete) {
                                    if (!deleteCooldown.current) {
                                        setHighlightRow(true);
                                        const id = params.data.departHeadId;
                                        handleDelete(id);
                                    }
                                }
                            }
                        }}
                        style={{
                            pointerEvents: deleteCooldown.current ? "none" : "auto",
                            opacity: deleteCooldown.current ? 0.5 : 1,
                            cursor: deleteCooldown.current ? "not-allowed" : "pointer",
                        }}
                    >
                        <FontAwesomeIcon icon={faTrash} className="icon-size" />
                    </span>

                </>
            ),
            sortable: false,
            filter: false,
            cellClass: 'ag-center-cols-cell',
            width: 100,
        }
    ];

    useEffect(() => {
        if (columnDefsApi && columnDefsApi.length > 0) {
            setTableHeader(columnDefs);
        }
    }, [columnDefsApi]);

    const filterTableData = () => {
        const filteredData = rowData.filter((apiDataRec) => {
            const matchesSaluation = searchRcds.headName ? apiDataRec.headName.toLowerCase().includes(searchRcds.headName.toLowerCase()) : true;
            return matchesSaluation;
        })
            .map((item, sno) => ({
                serialNo: sno + 1,
                departHeadId: item.departHeadId,
                headName: item.headName,
                departmentAlias: item.departmentAlias,
                department: item.department
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

    function openModal() {
        setCustomModelIsOpen(true);
    }
    useEffect(() => {
        // changes
        resetTable();
    }, []);

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
            resetTable();

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
                                            label={data.deptFromLabel}
                                            name='headName'
                                            holder={data.departmentFromHolder}
                                            value={rcds.headName}
                                            errorMessage={errorMessages.headName}
                                            onChange={handleChange}
                                            icon={icon.user}
                                            Maxlength={25}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <FormText
                                            label={data.baseToLabel}
                                            name='departmentAlias'
                                            holder={data.HeadAliasHolder}
                                            value={rcds.departmentAlias}
                                            errorMessage={errorMessages.departmentAlias}
                                            onChange={handleChange}
                                            icon={icon.user}
                                            Maxlength={25}
                                        />
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <SelectComponent
                                            label={data.DepartmentLabel}
                                            name={data.department}
                                            selectedValue={detailRcds.departmentId}
                                            options={clgCatgRcds}
                                            errorMessage={errorMessages.departmentId}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setDetailRcds((prevState) => ({
                                                    ...prevState,
                                                    departmentId: value,
                                                }))
                                            }
                                            icon={icon.star}
                                        />
                                        {errorMessages.departmentId && (
                                            <div className="error-message">{errorMessages.departmentId}</div>
                                        )}
                                    </div>

                                    <div className="col-md-6">
                                        
                                        <SelectComponent
                                            label={data.locationlable}
                                            name="location"
                                            selectedValue={rcds.location}  // Bind the location value here
                                            options={locationRcds}
                                            errorMessage={errorMessages.location}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    location: value, // This updates the location in the rcds state
                                                }))
                                            }
                                            icon={icon.star}
                                        />

                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <SelectComponent
                                            label={data.DdoLable}
                                            name="ddo"
                                            selectedValue={detailRcds.ddo}
                                            options={DDORcds}
                                            errorMessage={errorMessages.ddo}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    ddo: value,
                                                }))
                                            }
                                            icon={icon.star}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-12 text-center mt-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-color  btn-sm"
                                        onClick={rcds.departHeadId ? handleUpdateGroup : addMoreGroupDetails}>
                                        {rcds.departHeadId ? "Modify" : "Add New"}
                                    </button>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <DynamicTable data={dynamicTableData} />
                                </div>
                            </div>
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
                                showUpdate={!!rcds.departHeadId}
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
                    <p className='h6 card-title list-header'> <small> List of Department Head <span className='parenthesis'>(</span>s<span className='parenthesis'>)</span></small></p>
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
                                                label={data.deptFromLabel}
                                                name='headName'
                                                holder={data.departmentFromHolder}
                                                value={searchRcds.headName}
                                                errorMessage={errorMessages.headName}
                                                onChange={handleSearchChange}
                                                icon={icon.user}
                                                Maxlength={25}
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
                                                        headName: "",
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
export default DepartmentHeadMaster
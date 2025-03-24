// Author - Tushar 

import React, { useState, useEffect, useRef, useContext } from "react";
import "../styles/inputStyle.css";
import FormText from "../components/FormText";
import SelectComponent from "../components/SelectComponent";
import FormButton from "../components/FormButton";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../styles/AdvancedSearch.css";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import ErrorMessageABD from "../components/ErrorMessageABD";

import {
    getDelete,
    getList,
    getSave,
    getUpdate,
    getViewRecord,
    getDropDown,
    getDataApi,
} from "../utils/api";
import AgGridTable from "../components/AgGridTable";
import Breadcrumbs from "../components/Breadcrumbs";
import icon from "../properties/icon";
import { retrieveFromLocalStorage, retrieveFromCookies, storeInLocalStorage } from "../utils/CryptoUtils";
import AdvanceSearchModal from "../components/AdvanceSearchModal";
import { GlobalContext } from "../context/GlobalContextProvider";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import CustomModal from "../components/CustomModal";
import FormMultiSelect from "../components/FormMultiSelect";
import FilterTags from "../components/FilterTags";




const UserDeptHeadMapping = () => {
    const deleteCooldown = useRef(false);
    const [modalIsOpen, setIsOpen] = React.useState(false);
    const [errorVisibleComponent, setErrorMessageVisibleComponent] =
        useState(false);
    const [errorType, setErrorType] = useState();
    const [errorDivMessage, setErrorDivMessage] = useState("");


    const [errorMessages, setErrorMessages] = useState({
        location: "",
        ddo: "",
        userName: "",
        deptHeadMast: "",
        DeptHeadAssignDate: "",
        DeptHeadReleaseDate: "",
    });


    const [rcds, setRcds] = useState({
        UserDeptId: "",
        location: "",
        ddo: "",
        userName: "",
        deptHeadMast: "",
        DeptHeadAssignDate: "",
        DeptHeadReleaseDate: "",
        userId: "",
        publicIp: "",
        createdBy: "",
        modifiedBy: "",
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

    const [userTypeRcds, setUserypeRcds] = useState([{ value: "", label: "" }]);

    const secretKey = retrieveFromCookies("AESDecKey");

    const saveButtonRef = useRef(null);

    const [searchRcds, setSearchRcds] = useState({
        userName: "",
        deptHeadMast: "",
    });
    const [showSave, setShowSave] = useState(true);
    const [loading, setLoading] = useState(false);
    const { checkResponseStatus } = useCheckResponseStatus();

    const data = {
        locationLable: "Location",
        ddoLable: "DDO",
        userLable: "User Name",
        deptHeadLable: "Department Head Name ",
        releseDateLable: "Depart Head Release Date",
        assignDateLable: "Depart Head Assign Date",
        assignDate: "assigneDate",
        releaseDate: "releaseDate",
        save: "Save",
        delete: "Delete",
        update: "Update",
        back: "Back",
        reset: "Reset",
    };

    const handleBack = () => {
        deleteCooldown.current = false;
        if (saveButtonRef.current) {
            saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
        }
        setRcds({
            userTypeId: "",
            userType: "",
            empCode: "",
            empName: "",
            fatherName: "",
            department: "",
            designation: "",
            email: "",
            isActive: "",
            college: "",
            userId: "",
        });
    };

    const handleReset = () => {
        setRcds({
            userTypeId: "",
            userType: "",
            empCode: "",
            empName: "",
            fatherName: "",
            department: "",
            designation: "",
            email: "",
            isActive: "",
            college: "",
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
        const { name, value } = evt.target;
        setSearchRcds((prevState) => ({
            ...prevState,
            [name]: value,
        }));

    };

    const validateFields = () => {
        const errors = {};
        if (!rcds.userName) errors.userName = "User Name is required";
        if (!rcds.location) errors.location = "Location is required";
        if (!rcds.ddo) errors.ddo = "DDO is required";
        if (!rcds.deptHeadMast) errors.deptHeadMast = "Department Head is required";
        if (!rcds.DeptHeadAssignDate) errors.DeptHeadAssignDate = "Assign Date is required";
        if (!rcds.DeptHeadReleaseDate) errors.DeptHeadReleaseDate = "Release Date is required";
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
        setShowSave(false)

        const updatedRcds = {
            ...rcds,
            userId: s_user.userId,
            publicIp: s_user.publicIp,
        };

        try {
            const ciphertext = encAESData(secretKey, updatedRcds);
            console.log("Encrypted Data: ", ciphertext);
            let responseData;

            if (rcds.UserDeptId) {
                const response = await getUpdate("user", "userDeptHeadMap", ciphertext);
                responseData = checkResponseStatus(response);

            } else {
                const response = await getSave("user", "userDeptHeadMap", ciphertext);
                responseData = checkResponseStatus(response);
            }

            setRcds({
                UserDeptId: "",
                location: "",
                ddo: "",
                userName: "",
                deptHeadMast: "",
                DeptHeadAssignDate: "",
                DeptHeadReleaseDate: "",
                isActive: "",
                userId: rcds.userId,
                publicIp: rcds.publicIp,
            });

            if (responseData) {
                if (responseData.rType === "Y") {
                    const jsonData = JSON.parse(responseData.rData);
                    const decryptedData = decAESData(secretKey, jsonData);

                    setErrorMessageVisibleComponent(true);
                    setErrorType(true);
                    setErrorDivMessage(responseData.rMessage);
                    setShowSave(true)

                    setTimeout(() => {
                        setErrorMessageVisibleComponent(false);
                        setErrorDivMessage("");

                    }, 4000);
                } else {
                    setErrorMessageVisibleComponent(true);
                    setErrorDivMessage(responseData.rMessage);
                    setErrorType(false);
                    setShowSave(true);
                    setTimeout(() => {
                        setErrorMessageVisibleComponent(false);
                        setErrorDivMessage("");
                    }, 4000);

                }
                getData();
            }
        } catch (error) {
            console.error("Error during create/update : ", error);
        } finally {
            setLoading(false);
            deleteCooldown.current = false;
        }
    };

    const getData = async () => {
        try {

            const menuId = retrieveFromLocalStorage("activeMenuId");

            const ciphertext = encAESData(secretKey, { menuId });

            const response = await getList("user", "userDeptHeadMap", ciphertext);

            console.log("Full response from backend:", response);
            const responseData = checkResponseStatus(response, "user");



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

    const getDropDownData = async () => {
        try {
            getDropDown(
                userTypeQuery,
                userTypeRcds,
                setUserypeRcds,
                "common",
                secretKey
            );
        } catch { }
    };

    useEffect(() => {
        getDropDownData();
        getData();
    }, []);


    const [locationRcds, setLocationRcds] = useState([{ value: "", label: "" }]);

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
                secretKey,
                'user'
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
        try {
            getDropDown(DDOQuery, DDORcds, setDDORcds, "common", secretKey);
        } catch {
            console.log(error);
        }
    };

    useEffect(() => {
        getDDODropDownData();
    }, [rcds.location]);
    useEffect(() => {
        if (DDORcds.length > 0) {
            setRcds((prev) => ({
                ...prev,
                ddo: DDORcds[0].value,
            }))
        }


    }, [DDORcds]);



    useEffect(() => {
        getLocationDropDownData();
    }, []);


    const [UserNameRcds, setUserNameRcds] = useState([{ value: "", label: "" }]);

    const getuserNameDetails = async () => {
        const query = `select * from (select distinct e.employeeId, concat(e.employeeName,'(', e.employeeCodeM, ')') as emp_name 
    from ( SELECT E.employeeId as id FROM emp_promotion_mast E   INNER JOIN (select employeeId as id, 
        max(createDate) as cdate from emp_promotion_mast where employeeStatus!='D' group by id) as P 
              where E.employeeId = P.id and E.createDate = P.cdate 
            and E.location = '${rcds.location}' and E.ddo = '${rcds.ddo}') p, 
         employee_mast e where p.id = e.employeeId 
                and e.EmployeeLeftStatus!='Y'
            union select employeeId, concat(employeeName,'(',employeeCodeM, ')') as emp_name 
             from employee_mast  where Location = '${rcds.location}' and ddo = '${rcds.ddo}' and employeeId not in (select 
               distinct employeeId from emp_promotion_mast where employeeStatus!='D') 
              and EmployeeLeftStatus != 'Y' ) as xx order by 2;`;

        const ciphertext = encAESData(secretKey, { query });
        const response = await getDataApi("commonData", false, ciphertext, "user");
        const responseData = checkResponseStatus(response, "user");

        if (responseData.rData) {
            const recJson = JSON.parse(responseData.rData);
            const decryptedData = decAESData(secretKey, recJson);

            setUserNameRcds(() => (decryptedData.recData.map((item) => ({
                value: item[0],
                label: item[1],
            }))));
        }
    };

    useEffect(() => {
        getuserNameDetails();
    }, [rcds.ddo]);

    const [searchUserNameRcds, setSearchUserNameRcds] = useState([{ value: "", label: "" }]);

    const getSearchuserNameDetails = async () => {
        const query = `select * from (select distinct e.employeeId, concat(e.employeeName,'(', e.employeeCodeM, ')') as emp_name 
    from ( SELECT E.employeeId as id FROM emp_promotion_mast E   INNER JOIN (select employeeId as id, 
        max(createDate) as cdate from emp_promotion_mast where employeeStatus!='D' group by id) as P 
              where E.employeeId = P.id and E.createDate = P.cdate) p, 
         employee_mast e where p.id = e.employeeId 
                and e.EmployeeLeftStatus!='Y'
            union select employeeId, concat(employeeName,'(',employeeCodeM, ')') as emp_name 
             from employee_mast  where employeeId not in (select 
               distinct employeeId from emp_promotion_mast where employeeStatus!='D') 
              and EmployeeLeftStatus != 'Y' ) as xx order by 2;`;

        const ciphertext = encAESData(secretKey, { query });
        const response = await getDataApi("commonData", false, ciphertext, "user");
        const responseData = checkResponseStatus(response, "user");

        if (responseData.rData) {
            const recJson = JSON.parse(responseData.rData);
            const decryptedData = decAESData(secretKey, recJson);

            setSearchUserNameRcds(() => (decryptedData.recData.map((item) => ({
                value: item[0],
                label: item[1],
            }))));
        }
    };

    useEffect(() => {
        if(setIsOpen){
            getSearchuserNameDetails();
        }
    }, [setIsOpen]);

    const [deptHeadRcds, setDeptHeadRcds] = useState([
        {
            value: "", label: ""
        }
    ])

    const deptHeadQuery = {
        table: "DEPARTMENT_HEAD_MAST",
        fields: "DEPT_HEAD_ID, DEPARTMENT_HEAD_NAME",
        condition: "1=1",
        orderBy: ""
    }

    const getDeptHeadDropDown = async () => {
        try {
            getDropDown(
                deptHeadQuery,
                deptHeadRcds,
                setDeptHeadRcds,
                "common",
                secretKey,
                'user'
            );
        } catch {
            console.log(error);
        }
    }

    useEffect(() => {
        if (rcds.userName) {
            getDeptHeadDropDown();
        }
    }, [rcds.userName, searchRcds.userName]);

    const viewRecord = async (userName, department_mast) => {


        try {
            deleteCooldown.current = true;
            setErrorMessages("");
            const data = {
                userName: userName,
                department_mast: department_mast
            }
            const ciphertext = encAESData(secretKey, data);
            const response = await getViewRecord(
                "user",
                "userDeptHeadMap",
                ciphertext
            );

            const responseData = checkResponseStatus(response);

            if (responseData.rData) {
                const recJson = JSON.parse(responseData.rData);
                const decryptedData = decAESData(secretKey, recJson);
                const dataToRec = JSON.parse(decryptedData.recData);
                const dataToSet = dataToRec[0];

                setRcds({
                    UserDeptId: dataToSet.userDeptId,
                    location: dataToSet.location,
                    ddo: dataToSet.ddo,
                    userName: dataToSet.userName,
                    deptHeadMast: dataToSet.deptHeadMast,
                    DeptHeadAssignDate: dataToSet.DeptHeadAssignDate,
                    DeptHeadReleaseDate: dataToSet.DeptHeadReleaseDate,
                    userId: s_user.userId,
                    publicIp: s_user.publicIp
                });
            }

        } catch (error) {
            console.error("Error retrieving data:", error);
        }
    };

    const columnDefs = [
        {
            headerName: 'Serial No.',
            field: 'serialNo',
            sortable: false,
            cellStyle: { textAlign: "center" },
            width: 100,
            headerClass: 'ag-header-cell',
        },
        ...columnDefsApi,
        {
            headerName: 'Action',
            field: 'button',
            cellStyle: { textAlign: "center" },
            cellRenderer: (params) => (
                <>
                    <span
                        className="manipulation-icon edit-color mx-3"
                        onClick={() => {
                            const userName = params.data.userNameId;
                            const department_mast = params.data.deptHeadMastId
                            setHighlightRow(true);
                            viewRecord(userName, department_mast);

                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                    >
                        <FontAwesomeIcon icon={faEdit} className='icon-size' />
                    </span>

                </>
            ),
            sortable: false,
            filter: false,
            cellClass: 'ag-center-cols-cell',
            width: 100,
        },
    ];



    useEffect(() => {
        if (columnDefsApi && columnDefsApi.length > 0) {
            setTableHeader(columnDefs);
        }
    }, [columnDefsApi]);


    const filterTableData = () => {

        const filteredData = rowData
            .filter((apiDataRec) => {

                const matchesUserType = searchRcds.userName ? apiDataRec.userNameId === searchRcds.userName : true;
                const matchesDepartment = searchRcds.deptHeadMast ? apiDataRec.deptHeadMastId === searchRcds.deptHeadMast : true;
                return matchesDepartment && matchesUserType;
            })
            .map((item, sno) => ({
                serialNo: sno + 1,
                userName: item.userName,
                location: item.location,
                ddo: item.ddo,
                deptHeadMast: item.deptHeadMast,
                DeptHeadReleaseDate: item.DeptHeadReleaseDate,
                DeptHeadAssignDate: item.DeptHeadAssignDate,
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
                                        <SelectComponent
                                            autofocus={true}
                                            label={data.locationLable}
                                            name="location"
                                            selectedValue={rcds.location}
                                            options={locationRcds}
                                            errorMessage={errorMessages.location}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    location: value,
                                                }))
                                            }
                                            icon={icon.star}

                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <SelectComponent

                                            label={data.ddoLable}
                                            name="ddo"
                                            selectedValue={rcds.ddo}
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

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <SelectComponent

                                            label={data.userLable}
                                            name="userName"
                                            selectedValue={rcds.userName}
                                            options={UserNameRcds}
                                            errorMessage={errorMessages.userName}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    userName: value,
                                                }))
                                            }
                                            icon={icon.star}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <SelectComponent

                                            label={data.deptHeadLable}
                                            name="deptHeadMast"
                                            selectedValue={rcds.deptHeadMast}
                                            options={deptHeadRcds}
                                            errorMessage={errorMessages.deptHeadMast}
                                            onChange={handleChange}
                                            onSelects={(value) =>
                                                setRcds((prevState) => ({
                                                    ...prevState,
                                                    deptHeadMast: value,
                                                }))
                                            }
                                            icon={icon.star}
                                        />
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <FormText
                                            label={data.assignDateLable}
                                            name="DeptHeadAssignDate"
                                            value={rcds.DeptHeadAssignDate}
                                            holder={data.dHolder}
                                            errorMessage={errorMessages.DeptHeadAssignDate}
                                            onChange={handleChange}
                                            icon={icon.star}
                                            type="date"
                                        />
                                    </div>


                                    <div className="col-md-6">
                                        <FormText
                                            label={data.releseDateLable}
                                            name="DeptHeadReleaseDate"
                                            value={rcds.DeptHeadReleaseDate}
                                            holder={data.fHolder}
                                            errorMessage={errorMessages.DeptHeadReleaseDate}
                                            onChange={handleChange}
                                            icon={icon.star}
                                            type="date"
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
                                                showUpdate={!!rcds.UserDeptId}
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
                            setVisible={setErrorMessageVisibleComponent}
                        />
                )}

                <div className="container-body mx-3 mb-3">
                    <p className="h6 card-title list-header">
                        {" "}
                        <small>
                            {" "}
                            List Of User Department Head Mapping<span className="parenthesis">(</span>s
                            <span className="parenthesis">)</span>
                        </small>
                    </p>

                    <div
                        className="refresh-table "
                        id="refresh-table"
                        aria-label="" data-bs-toggle="tooltip" data-bs-placement="auto" title={`Refresh Data {Shift + R}`}
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
                            setIsOpen={setIsOpen}>
                            <div className="card advanceSearchModal">
                                <div className="card-body">
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <SelectComponent
                                                label={data.userLable}
                                                name="userName"
                                                selectedValue={searchRcds.userName}
                                                options={searchUserNameRcds}
                                                errorMessage={errorMessages.userName}
                                                onChange={handleChange}
                                                onSelects={(value) =>
                                                    setSearchRcds((prevState) => ({
                                                        ...prevState,
                                                        userName: value,
                                                    }))
                                                }
                                                icon={icon.star}
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <SelectComponent
                                                label={data.deptHeadLable}
                                                name="deptHeadMast"
                                                selectedValue={searchRcds.deptHeadMast}
                                                options={deptHeadRcds}
                                                errorMessage={errorMessages.deptHeadMast}
                                                onChange={handleChange}
                                                onSelects={(value) =>
                                                    setSearchRcds((prevState) => ({
                                                        ...prevState,
                                                        deptHeadMast: value,
                                                    }))
                                                }
                                                icon={icon.star}
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

export default UserDeptHeadMapping;

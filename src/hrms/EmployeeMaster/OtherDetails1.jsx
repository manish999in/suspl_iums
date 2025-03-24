import React, { useContext, useEffect, useState } from "react";
import SelectComponent from "../../components/SelectComponent"; // Dropdown component
import icon from "../../properties/icon"; // Custom icon property
import FormText from "../../components/FormText"; // Text input component
import FormCheckbox from "../../components/FormCheckbox"; // Checkbox component
import FormDate from "../../components/FormDate"; // Date input component
import { EmployeeContext } from "../../context/EmployeeMaster/EmployeeMasterContext";
import { GlobalContext } from "../../context/GlobalContextProvider";
import { getDataApi, getDropDown } from "../../utils/api";
import { error } from "jquery";
import useCheckResponseStatus from "../../hooks/useCheckResponseStatus";

function OtherDetails1() {
  const { secretKey } = useContext(GlobalContext);
  const { otherDetail1Rcds, setOtherDetail1Rcds, errors, setRcds } =
    useContext(EmployeeContext);
  const { checkResponseStatus } = useCheckResponseStatus();

  const data = {
    locationName: "location",
    locationLabel: "Location",
    locationHolder: "Select Location",

    ddoName: "ddo",
    ddoLabel: "DDO'(s)",
    ddoHolder: "Select DDO",

    departmentName: "department",
    departmentLabel: "Department",
    departmentHolder: "Select Department",

    departmentHeadName: "departmentHead",
    departmentHeadLabel: "Department Head",
    departmentHeadHolder: "Select Department Head",

    designationName: "designation",
    designationLabel: "Designation",
    designationHolder: "Select Designation",

    disciplineName: "discipline",
    disciplineLabel: "Discipline",
    disciplineHolder: "Select Discipline",

    dateOfAppointmentName: "dateOfAppointment",
    dateOfAppointmentLabel: "Date of Appointment",
    dateOfAppointmentHolder: "Select Date of Appointment",

    dateOfJoiningName: "dateOfJoining",
    dateOfJoiningLabel: "Date of Joining",
    dateOfJoiningHolder: "Select Date of Joining",

    employeeCodeName: "employeeCode",
    employeeCodeLabel: "Employee Code",
    employeeCodeHolder: "Enter Employee Code",

    isProbationName: "isProbation",
    isProbationLabel: "Is on Probation",
    isProbationHolder: "Select Probation Status",

    lastAppointmentDateName: "lastAppointmentDate",
    lastAppointmentDateLabel: "Last Appointment Date",
    lastAppointmentDateHolder: "Select Last Appointment Date",

    dateOfRetirementName: "dateOfRetirement",
    dateOfRetirementLabel: "Date of Retirement",
    dateOfRetirementHolder: "Select Date of Retirement",

    fundTypeName: "fundType",
    fundTypeLabel: "Fund Type",
    fundTypeHolder: "Select Fund Type",

    lastJoiningDateName: "lastJoiningDate",
    lastJoiningDateLabel: "Last Joining Date",
    lastJoiningDateHolder: "Select Last Joining Date",

    budgetHeadName: "budgetHead",
    budgetHeadLabel: "Budget Head",
    budgetHeadHolder: "Select Budget Head",

    employeeLeftStatusName: "employeeLeftStatus",
    employeeLeftStatusLabel: "Employee Left Status",
    employeeLeftStatusHolder: "Select Employee Left Status",

    natureTypeName: "natureType",
    natureTypeLabel: "Nature Type",
    natureTypeHolder: "Select Nature Type",

    leavingDateName: "leavingDate",
    leavingDateLabel: "Leaving Date",
    leavingDateHolder: "Select Leaving Date",

    presentDisciplineName: "presentDiscipline",
    presentDisciplineLabel: "Present Discipline",
    presentDisciplineHolder: "Select Present Discipline",

    leavingRemarksName: "leavingRemarks",
    leavingRemarksLabel: "Leaving Remarks",
    leavingRemarksHolder: "Enter Leaving Remarks",
  };

  // Handle change for form fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If checkbox, use checked property, else use value
    setOtherDetail1Rcds({
      ...otherDetail1Rcds,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    });
    // Remove the error for the current field while typing
    if (errors[name]) {
      errors[name] = ""; // Clear error message for that field
    }
  };

  ///********************************************DropDowns*****************************************************///

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
        secretKey
      );
    } catch {
      // console.log(error);
    }
  };

  useEffect(() => {
    getLocationDropDownData();
  }, []);

  const [DDORcds, setDDORcds] = useState([{ value: "", label: "" }]);

  const DDOQuery = {
    table: " ddo left join ddolocationmapping dlm on ddo.ddo_id = dlm.DDO_ID",
    fields: "distinct ddo.ddo_id, ddo.DDONAME",
    condition: `dlm.LOCATION_CODE='${otherDetail1Rcds.location}'`,
    orderBy: "",
  };

  const getDDODropDownData = async () => {
    console.log(DDOQuery);
    try {
      getDropDown(DDOQuery, DDORcds, setDDORcds, "common", secretKey);
    } catch {
      // console.log(error);
    }
  };

  const getEmployeeCodeDropdown = async () => {
    const ciphertext = encAESData(secretKey, {
      query: `select lpad((ifnull(max(right(employeeCode,4)),0)+1),4,0) as 
      sequence ,'Y','Y' from employee_mast where upper(ddo)='${otherDetail1Rcds.ddo}' and upper(location)= '${otherDetail1Rcds.location}'`,
      // query: `select * from tree_Menu`
    });

    const response = await getDataApi("commonData", null, ciphertext);

    const responseData = checkResponseStatus(response);

    if (responseData) {
      if (responseData.rType === "Y") {
        const jsonData = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, jsonData);
        console.log(decryptedData, "-------code---------");

        let id = decryptedData.recData[0][0];

        const ciphertext2 = encAESData(secretKey, {
          query: `select  concat(l.LOCATION_ID, '-', '${id}') emp_code ,'Y'  from ddolocationmapping m, ddo d, leave_location_mast l  where m.DDO_ID = m.DDO_ID 
				and l.LOCATION_CODE=m.LOCATION_CODE and upper(l.LOCATION_CODE)= '${otherDetail1Rcds.location}' 
        and upper(d.DDO_ID) = '${otherDetail1Rcds.ddo}'`,
        });
        const response2 = await getDataApi("commonData", null, ciphertext2);
        const responseData2 = checkResponseStatus(response2);
        if (responseData2.rType === "Y") {
          const jsonData2 = JSON.parse(responseData2.rData);
          const decryptedData2 = decAESData(secretKey, jsonData2);

          console.log(decryptedData2, "-------decryptedData2---------");

          setRcds((prev) => ({
            ...prev,
            empCode: decryptedData2.recData[0][0],
          }));
        }
      }
    }
  };

  useEffect(() => {
    getDDODropDownData();
  }, [otherDetail1Rcds.location]);

  useEffect(() => {
    setRcds((prev) => ({
      ...prev,
      empCode: "",
    }));
    if (otherDetail1Rcds.location !== "" && otherDetail1Rcds.ddo !== "") {
      getEmployeeCodeDropdown();
    }
  }, [otherDetail1Rcds.location, otherDetail1Rcds.ddo]);

  const [gradeRcds, setGradeRcds] = useState([{ value: "", label: "" }]);
  const [payLevelRcds, setPayLevelRcds] = useState([{ value: "", label: "" }]);

  const [departmentRcds, setDepartmentRcds] = useState([
    { value: "", label: "" },
  ]);
  const demparmentDropdown = {
    table:
      "designation_fund_mapping_mast dfm  left join department_mast dm on dm.dept_id = dfm.department",
    fields: "dfm.department , dm.department",
    condition: `dfm.ddo= '${otherDetail1Rcds.ddo}' `,
    orderBy: "",
  };

  const getDepartmentDropdownData = async () => {
    getDropDown(
      demparmentDropdown,
      departmentRcds,
      setDepartmentRcds,
      "common",
      secretKey
    );
  };

  const [natureTypeRcds, setNatureRcds] = useState([{ value: "", label: "" }]);
  const natureTypeDropdown = {
    table:
      "designation_fund_mapping_mast dfm  left join nature_mast nm on nm.nature_id = dfm.nature_id",
    fields: "dfm.nature_id , nm.nature",
    condition: `dfm.ddo= '${otherDetail1Rcds.ddo}' `,
    orderBy: " ",
  };
  const getNatureTypeDropDown = async () => {
    getDropDown(
      natureTypeDropdown,
      natureTypeRcds,
      setNatureRcds,
      "common",
      secretKey
    );
  };

  const [disciplineRcds, setdisciplineRcds] = useState([
    { value: "", label: "" },
  ]);
  const disciplineDropdown = {
    table:
      "designation_fund_mapping_mast dfm  left join discipline_mast nm on nm.DISC_ID = dfm.discipline_id",
    fields: "distinct dfm.discipline_id,nm.discipline",
    condition: `dfm.ddo= '${otherDetail1Rcds.ddo}' `,
    orderBy: " ",
  };

  const getDisciplineDropDown = async () => {
    getDropDown(
      disciplineDropdown,
      disciplineRcds,
      setdisciplineRcds,
      "common",
      secretKey
    );
  };

  //  const gradeMasterDropdown = {
  //   table: "designation_fund_mapping_mast dfm  left join grade_mast nm on nm.GRADE_ID = dfm.GRADE_ID",
  //   fields: "dfm.GRADE_ID , nm.GRADE_NAME",
  //   condition: `dfm.ddo= '${otherDetail1Rcds.ddo}' `,
  //   orderBy: " ",
  // }
  //   const getGradeMasterDropdown = async () => {
  //   getDropDown(gradeMasterDropdown, gradeRcds, setGradeRcds, "user", secretKey);
  // }
  const [designationRcds, setdesignationRcds] = useState([
    { value: "", label: "" },
  ]);

  const designationDropdown = {
    table:
      " designation_fund_mapping_mast dfm  left join designation_mast nm on nm.designation_id = dfm.designation_id ",
    fields: "distinct dfm.designation_id,nm.designation",
    condition: `dfm.ddo= '${otherDetail1Rcds.ddo}' `,
    orderBy: " ",
  };
  const getDesignationDropdown = async () => {
    getDropDown(
      designationDropdown,
      designationRcds,
      setdesignationRcds,
      "common",
      secretKey
    );
  };

  const [fundTypeRcds, setFundTypeRcds] = useState([{ value: "", label: "" }]);

  const getFundTypeDropdown = async () => {
    const ciphertext = encAESData(secretKey, {
      ddo: otherDetail1Rcds.ddo,
      dept: otherDetail1Rcds.department,
      desig: otherDetail1Rcds.designation,
      fstatus: "F",
    });

    const response = await getDataApi("hrms", "employeeMaster", ciphertext);

    const responseData = checkResponseStatus(response);

    if (responseData) {
      if (responseData.rType === "Y") {
        const jsonData = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, jsonData);
        console.log(decryptedData, "----------------");
        let ids = decryptedData.recData;

        const stringIDs = ids.map((item) => `'${item}'`).join(",");

        console.log(stringIDs, "----------");

        const fundTypeDropdown = {
          table: "fund_type_master",
          fields: "distinct FUND_TYPE_ID,description",
          condition: `fund_type_id in (${stringIDs}) `,
          orderBy: "",
        };
        getDropDown(
          fundTypeDropdown,
          fundTypeRcds,
          setFundTypeRcds,
          "budget",
          secretKey,
          "budget"
        );
      }
    }
  };

  const [budgetHeadRcds, setbudgetHeadRcds] = useState([
    { value: "", label: "" },
  ]);

  const getBudgetHeadDropdown = async () => {
    const ciphertext = encAESData(secretKey, {
      ddo: otherDetail1Rcds.ddo,
      dept: otherDetail1Rcds.department,
      desig: otherDetail1Rcds.designation,
      fundType: otherDetail1Rcds.fundType,
      fstatus: "BH",
    });

    const response = await getDataApi("hrms", "employeeMaster", ciphertext);

    const responseData = checkResponseStatus(response);

    if (responseData) {
      if (responseData.rType === "Y") {
        const jsonData = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, jsonData);
        console.log(decryptedData, "----------------");
        let ids = decryptedData.recData;

        const stringIDs = ids.map((item) => `'${item}'`).join(",");

        console.log(stringIDs, "----------");

        const budgetHeadTypeDropdown = {
          table: "budget_head_master",
          fields: "budget_head_id , budget_head",
          condition: `budget_head_id in (${stringIDs}) `,
          orderBy: "",
        };
        getDropDown(
          budgetHeadTypeDropdown,
          budgetHeadRcds,
          setbudgetHeadRcds,
          "budget",
          secretKey,
          "budget"
        );
      }
    }
  };

  const [presetDisciplineRcds, setPresentDisciplineRcds] = useState([
    { value: "", label: "" },
  ]);
  const presentDisciplineDropdown = {
    table: "discipline_mast",
    fields: "disc_id,discipline",
    condition: `1=1`,
    orderBy: "",
  };

  const getPresentDisciplineDropDown = async () => {
    getDropDown(
      presentDisciplineDropdown,
      presetDisciplineRcds,
      setPresentDisciplineRcds,
      "common",
      secretKey
    );
  };

  const [departmentHeadRcds, setDepartmentHeadRcds] = useState([
    { value: "", label: "" },
  ]);

  const departmentHeadDropdown = {
    table:
      "depthead_dept_mapping_mast map left join department_head_mast mast on mast.dept_head_id=map.dept_head_id",
    fields: "distinct map.dept_head_id,mast.department_head_name",
    condition: `map.ddoid= '${otherDetail1Rcds.ddo}' and map.locationid= '${otherDetail1Rcds.location}' and map.dept_id= '${otherDetail1Rcds.department}'`,
    orderBy: " ",
  };
  const getDepartmentHeadDropdown = async () => {
    getDropDown(
      departmentHeadDropdown,
      departmentHeadRcds,
      setDepartmentHeadRcds,
      "common",
      secretKey
    );
  };

  // const budgetHeadDropdown = {
  //   table: "fund_type_master f JOIN budget_head_master b ON f.FUND_TYPE_ID = b.FUND_TYPE",
  //   fields: "b.BUDGET_HEAD_ID, GET_BUDGET_HEAD(b.BUDGET_HEAD_ID) AS BUDGET_HEAD_NAME",
  //   condition: `f.FUND_TYPE_ID = '${rcds.fundTypeId}' AND b.ISACTIVE = 'Y' AND b.ISPENSION = 'Y'`,
  //   orderBy: "ORDER BY BUDGET_HEAD_NAME",
  // };

  // const gradeDetailsDropdown = {
  //   table: "grade_details gd JOIN grade_mast gm ON gd.GRADE_ID = gm.GRADE_ID",
  //   fields: "gd.GD_ID, gd.BASIC_FROM",
  //   condition: `gm.GRADE_ID = '${rcds.groupId}'`,
  //   orderBy: " ",
  // };

  // const getGradeDetailsDropdown = async () => {
  //   getDropDown(gradeDetailsDropdown, payLevelRcds, setPayLevelRcds, "hrms", secretKey);
  // }

  useEffect(() => {
    getDepartmentDropdownData();
    getNatureTypeDropDown();
    getDisciplineDropDown();
    getDesignationDropdown();
    getPresentDisciplineDropDown();
  }, [otherDetail1Rcds.ddo]);

  useEffect(() => {
    if (
      otherDetail1Rcds.ddo &&
      otherDetail1Rcds.department &&
      otherDetail1Rcds.designation
    ) {
      getFundTypeDropdown();
    }
  }, [
    otherDetail1Rcds.ddo,
    otherDetail1Rcds.department,
    otherDetail1Rcds.designation,
  ]);

  useEffect(() => {
    if (
      otherDetail1Rcds.location &&
      otherDetail1Rcds.ddo &&
      otherDetail1Rcds.department &&
      otherDetail1Rcds.designation &&
      otherDetail1Rcds.fundType
    ) {
      getBudgetHeadDropdown();
    } else if (
      otherDetail1Rcds.ddo &&
      otherDetail1Rcds.department &&
      otherDetail1Rcds.location
    ) {
      getDepartmentHeadDropdown();
    }
  }, [
    otherDetail1Rcds.ddo,
    otherDetail1Rcds.department,
    otherDetail1Rcds.designation,
    otherDetail1Rcds.fundType,
  ]);

  useEffect(() => {
    if(departmentHeadRcds.length >0){
    if (departmentHeadRcds[0].value) {
      setOtherDetail1Rcds((prev) => ({
        ...prev,
        departmentHead: departmentHeadRcds[0].value,
      }));
    }}
  }, [departmentHeadRcds]);

  // useEffect(() => {
  //   console.log(otherDetail1Rcds , "|\\\\\\\\\\\\\\\\\=======")
  // } , [otherDetail1Rcds]);

  const employeeLeftStatusOptions = [
    { label: "Yes", value: "Y" },
    { label: "No", value: "N" },
    // Add more options as needed
  ];

  // Form rendering
  return (
    <>
      <div className="card shadow-lg rounded-3">
        <div className="card-body p-4">
          <h5 className="text-center mb-4">Other Details 1</h5>
          <div className="row g-1">
            <div className="col-md-4">
              <SelectComponent
                label={data.locationLabel}
                name={data.locationName}
                selectedValue={otherDetail1Rcds.location}
                errorMessage={errors.location}
                required={true}
                icon={icon.arrowDown}
                options={locationRcds}
                size="small"
                onSelects={(value) =>
                  setOtherDetail1Rcds((prevState) => ({
                    ...prevState,
                    location: value,
                  }))
                }
              />
            </div>

            <div className="col-md-4">
              <SelectComponent
                label={data.ddoLabel}
                name={data.ddoName}
                selectedValue={otherDetail1Rcds.ddo}
                errorMessage={errors.ddo}
                required={true}
                icon={icon.arrowDown}
                options={DDORcds}
                size="small"
                onSelects={(value) =>
                  setOtherDetail1Rcds((prevState) => ({
                    ...prevState,
                    ddo: value,
                  }))
                }
              />
            </div>

            <div className="col-md-4">
              <SelectComponent
                label={data.departmentLabel}
                name={data.departmentName}
                selectedValue={otherDetail1Rcds.department}
                errorMessage={errors.department}
                required={true}
                icon={icon.arrowDown}
                options={departmentRcds}
                size="small"
                onSelects={(value) =>
                  setOtherDetail1Rcds((prevState) => ({
                    ...prevState,
                    [data.departmentName]: value,
                  }))
                }
              />
            </div>

            <div className="col-md-4">
              <SelectComponent
                label={data.departmentHeadLabel}
                name={data.departmentHeadName}
                selectedValue={otherDetail1Rcds.departmentHead}
                errorMessage=""
                icon={icon.arrowDown}
                options={departmentHeadRcds}
                size="small"
                onSelects={(value) =>
                  setOtherDetail1Rcds((prevState) => ({
                    ...prevState,
                    [data.departmentHeadName]: value,
                  }))
                }
                disabled={true}
              />
            </div>

            <div className="col-md-4">
              <SelectComponent
                label={data.designationLabel}
                name={data.designationName}
                selectedValue={otherDetail1Rcds.designation}
                errorMessage={errors.designation}
                required={true}
                icon={icon.arrowDown}
                options={designationRcds}
                size="small"
                onSelects={(value) =>
                  setOtherDetail1Rcds((prevState) => ({
                    ...prevState,
                    [data.designationName]: value,
                  }))
                }
              />
            </div>

            <div className="col-md-4">
              <SelectComponent
                label={data.disciplineLabel}
                name={data.disciplineName}
                selectedValue={otherDetail1Rcds.discipline}
                errorMessage={errors.discipline}
                required={true}
                icon={icon.arrowDown}
                options={disciplineRcds}
                size="small"
                onSelects={(value) =>
                  setOtherDetail1Rcds((prevState) => ({
                    ...prevState,
                    [data.disciplineName]: value,
                  }))
                }
              />
            </div>

            <div className="col-md-4">
              <FormDate
                label={data.dateOfAppointmentLabel}
                name={data.dateOfAppointmentName}
                holder={data.dateOfAppointmentHolder}
                value={otherDetail1Rcds.dateOfAppointment}
                errorMessage={errors.dateOfAppointment}
                required={true}
                onChange={handleChange}
                icon={icon.calender}
                Maxlength="25"
              />
            </div>

            <div className="col-md-4">
              <FormDate
                label={data.dateOfJoiningLabel}
                name={data.dateOfJoiningName}
                holder={data.dateOfJoiningHolder}
                value={otherDetail1Rcds.dateOfJoining}
                errorMessage={errors.dateOfJoining}
                required={true}
                onChange={handleChange}
                icon={icon.calender}
                Maxlength="25"
              />
            </div>

            {/* <div className="col-md-4">
              <FormText
                label={`${data.employeeCodeLabel}(M) `}
                name={data.employeeCodeName}
                holder={`${data.employeeCodeHolder}(M) `}
                value={otherDetail1Rcds.employeeCode}
                errorMessage=""
                onChange={handleChange}
                icon={icon.user}
                Maxlength="25"
              />
            </div> */}

            <div className="col-md-4">
              <FormCheckbox
                label={data.isProbationLabel}
                name={data.isProbationName}
                checked={otherDetail1Rcds.isProbation === "Y"}
                errorMessage=""
                onChange={handleChange}
                icon={icon.user}
              />
            </div>

            <div className="col-md-4">
              <FormDate
                label={data.lastAppointmentDateLabel}
                name={data.lastAppointmentDateName}
                holder={data.lastAppointmentDateHolder}
                value={otherDetail1Rcds.lastAppointmentDate}
                errorMessage=""
                onChange={handleChange}
                icon={icon.calender}
                Maxlength="25"
              />
            </div>

            <div className="col-md-4">
              <FormDate
                label={data.dateOfRetirementLabel}
                name={data.dateOfRetirementName}
                holder={data.dateOfRetirementHolder}
                value={otherDetail1Rcds.dateOfRetirement}
                errorMessage=""
                onChange={handleChange}
                icon={icon.calender}
                Maxlength="25"
              />
            </div>

            <div className="col-md-4">
              <SelectComponent
                label={data.fundTypeLabel}
                name={data.fundTypeName}
                selectedValue={otherDetail1Rcds.fundType}
                errorMessage={errors.fundType}
                required={true}
                icon={icon.arrowDown}
                options={fundTypeRcds}
                size="small"
                onSelects={(value) =>
                  setOtherDetail1Rcds((prevState) => ({
                    ...prevState,
                    [data.fundTypeName]: value,
                  }))
                }
              />
            </div>

            <div className="col-md-4">
            <FormDate
                label={data.lastJoiningDateLabel}
                name={data.lastJoiningDateName}
                holder={data.lastJoiningDateHolder}
                value={otherDetail1Rcds.lastJoiningDate}
                errorMessage=""
                onChange={handleChange}
                icon={icon.calender}
                Maxlength="25"
              />
              {/* <FormDate
                label={data.lastJoiningDateLabel}
                name={data.lastJoiningDateName}
                holder={data.lastJoiningDateHolder}
                value={OtherDetails1.lastJoiningDate}
                errorMessage=""
                onChange={handleChange}
                icon={icon.calender}
                Maxlength="25"
              /> */}
            </div>

            <div className="col-md-4">
              <SelectComponent
                label={data.budgetHeadLabel}
                name={data.budgetHeadName}
                selectedValue={otherDetail1Rcds.budgetHead}
                errorMessage={errors.budgetHead}
                required={true}
                icon={icon.arrowDown}
                options={budgetHeadRcds}
                size="small"
                onSelects={(value) =>
                  setOtherDetail1Rcds((prevState) => ({
                    ...prevState,
                    [data.budgetHeadName]: value,
                  }))
                }
              />
            </div>

            <div className="col-md-4">
              <SelectComponent
                label={data.employeeLeftStatusLabel}
                name={data.employeeLeftStatusName}
                selectedValue={otherDetail1Rcds.employeeLeftStatus}
                errorMessage=""
                icon={icon.arrowDown}
                options={employeeLeftStatusOptions}
                size="small"
                onSelects={(value) =>
                  setOtherDetail1Rcds((prevState) => ({
                    ...prevState,
                    [data.employeeLeftStatusName]: value,
                  }))
                }
              />
            </div>

            <div className="col-md-4">
              <SelectComponent
                label={data.natureTypeLabel}
                name={data.natureTypeName}
                selectedValue={otherDetail1Rcds.natureType}
                errorMessage={errors.natureType}
                required={true}
                icon={icon.arrowDown}
                options={natureTypeRcds}
                size="small"
                onSelects={(value) =>
                  setOtherDetail1Rcds((prevState) => ({
                    ...prevState,
                    [data.natureTypeName]: value,
                  }))
                }
              />
            </div>

            <div className="col-md-4">
              <FormDate
                label={data.leavingDateLabel}
                name={data.leavingDateName}
                holder={data.leavingDateHolder}
                value={otherDetail1Rcds.leavingDate}
                errorMessage=""
                onChange={handleChange}
                icon={icon.calender}
                Maxlength="25"
              />
            </div>

            <div className="col-md-4">
              <SelectComponent
                label={data.presentDisciplineLabel}
                name={data.presentDisciplineName}
                selectedValue={otherDetail1Rcds.presentDiscipline}
                errorMessage={errors.presentDiscipline}
                required={true}
                icon={icon.arrowDown}
                options={presetDisciplineRcds}
                size="small"
                onSelects={(value) =>
                  setOtherDetail1Rcds((prevState) => ({
                    ...prevState,
                    [data.presentDisciplineName]: value,
                  }))
                }
              />
            </div>

            <div className="col-md-4">
              <FormText
                label={data.leavingRemarksLabel}
                name={data.leavingRemarksName}
                holder={data.leavingRemarksHolder}
                value={otherDetail1Rcds.leavingRemarks}
                errorMessage=""
                onChange={handleChange}
                icon={icon.user}
                Maxlength="25"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OtherDetails1;

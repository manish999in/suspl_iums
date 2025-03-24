import React, { useContext, useEffect, useState } from "react";
import SelectComponent from "../../components/SelectComponent";
import FormText from "../../components/FormText";
import icon from "../../properties/icon";
import FormDate from "../../components/FormDate";
import { GlobalContext } from "../../context/GlobalContextProvider";
import { EmployeeContext } from "../../context/EmployeeMaster/EmployeeMasterContext";
import { getDropDown } from "../../utils/api";

function SalaryStructure() {

  const { secretKey } = useContext(GlobalContext);
  const { otherDetail1Rcds,salaryStructRcds, setSalaryStructRcds,validateFields,errors} = useContext(EmployeeContext);

  // State to manage form data
  // const [salaryStructRcds, setSalaryStructRcds] = useState({
  //   cpfType: "",
  //   postingCity: "",
  //   designation: otherDetail1Rcds.designation,
  //   postedDesignation: otherDetail1Rcds.designation,
  //   entryGroup: "",
  //   entryPayLevel: "",
  //   incrementType: "",
  //   presentGroup: "",
  //   presentPayLevel: "",
  //   basic: "",
  //   incrementDueDate: "",
  // });

  const data = {
    cpfTypeName: "cpfType",
    cpfTypeLabel: "CPF/GPF/NPS Type",
    cpfTypeHolder: "Select CPF/GPF/NPS Type",

    postingCityName: "postingCity",
    postingCityLabel: "Posting City",
    postingCityHolder: "Select Posting City",

    designationName: "designation",
    designationLabel: "Designation",
    designationHolder: "Select Designation",

    postedDesignationName: "postedDesignation",
    postedDesignationLabel: "Posted Designation",
    postedDesignationHolder: "Select Posted Designation",

    entryGroupName: "entryGroup",
    entryGroupLabel: "Entry Group",
    entryGroupHolder: "Select Entry Group",

    entryPayLevelName: "entryPayLevel",
    entryPayLevelLabel: "Entry Pay Level",
    entryPayLevelHolder: "Select Entry Pay Level",

    incrementTypeName: "incrementType",
    incrementTypeLabel: "Increment Type",
    incrementTypeHolder: "Select Increment Type",

    presentGroupName: "presentGroup",
    presentGroupLabel: "Present Group",
    presentGroupHolder: "Select Present Group",

    presentPayLevelName: "presentPayLevel",
    presentPayLevelLabel: "Present Pay Level",
    presentPayLevelHolder: "Select Present Pay Level",

    basicName: "basic",
    basicLabel: "Basic",
    basicHolder: "Enter Basic",

    incrementDueDateName: "incrementDueDate",
    incrementDueDateLabel: "Increment Due Date",
    incrementDueDateHolder: "Enter Increment Due Date"
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If checkbox, use checked property, else use value
    setSalaryStructRcds({
      ...salaryStructRcds,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    });

   // Remove the error for the current field while typing
   if (errors[name]) {
    errors[name] = ''; // Clear error message for that field
  }
  };

 

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateFields()) {
      console.log("Form Submitted");
    }
  };

  useEffect(() => {
    setSalaryStructRcds((prev) => ({
      ...prev,
      designation:otherDetail1Rcds.designation
    }))
  },[otherDetail1Rcds.designation])

  const [cityRcds, setCityRcds] = useState([{ value: "", label: "" }]);

  const cityQuery = {
    table: "city_master",
    fields: "city_id,city_name",
    condition: `1=1`,
    orderBy: "",
  };

  const getCityDropDownData = async () => {
    try {
      getDropDown(
        cityQuery,
        cityRcds, setCityRcds,
        "common",
        secretKey
      );
    } catch (error) {
      console.log(error);
    }
  };

  const [designationRcds, setdesignationRcds] = useState([{ value: "", label: "" }]);

  const designationQuery = {
    table: "designation_mast",
    fields: "designation_id,designation",
    condition: `1=1`,
    orderBy: "",
  };

  const getdesignationDropDownData = async () => {
    try {
      getDropDown(
        designationQuery,
        designationRcds, setdesignationRcds,
        "common",
        secretKey
      );
    } catch (error) {
      console.log(error);
    }
  };
  const [gradeRcds, setGradeRcds] = useState([{ value: "", label: "" }]);

  const gradeQuery = {
    table: "designation_fund_mapping_mast dfm left join grade_mast gm on dfm.grade_id=gm.GRADE_ID",
    fields: "dfm.grade_id,gm.grade_name",
    condition: `dfm.department='${otherDetail1Rcds.department}' and dfm.DDO ='${otherDetail1Rcds.ddo}' and dfm.DESIGNATION_ID='${otherDetail1Rcds.designation}' and dfm.location_ID='${otherDetail1Rcds.location}'`,
    orderBy: "",
  };

  const getGradeDropDownData = async () => {
    try {
      getDropDown(
        gradeQuery,
        gradeRcds, setGradeRcds,
        "common",
        secretKey
      );
    } catch (error) {
      console.log(error);
    }
  };

  const [presentgradeRcds, setpresentGradeRcds] = useState([{ value: "", label: "" }]);

  const presentgradeQuery = {
    table: "grade_mast",
    fields: "grade_id,grade_name",
    condition: `1=1`,
    orderBy: "",
  };

  const getpresentGradeDropDownData = async () => {
    try {
      getDropDown(
        presentgradeQuery,
        presentgradeRcds, setpresentGradeRcds,
        "common",
        secretKey
      );
    } catch (error) {
      console.log(error);
    }
  };


  
  
  const [pFtYPERcds, setpFtYPERcds] = useState([{ value: "", label: "" }]);
  
  const ppFtYPERcdsQuery = {
    table: "salary_head_mast",
    fields: "SALARY_HEAD_ID,DESCRIPTION",
    condition: `IS_PF = 'Y' and IS_ACTIVE='Y'`,
    orderBy: "",
  };
  
  const getppFtYPEDropDownData = async () => {
    try {
      getDropDown(
        ppFtYPERcdsQuery,
        pFtYPERcds, setpFtYPERcds,
        "common",
        secretKey,
        "user"
      );
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getppFtYPEDropDownData();
    getGradeDropDownData();
    getdesignationDropDownData();
    getCityDropDownData();
    getpresentGradeDropDownData();
  }, []);
  useEffect(() => {
    getpayLevelDropDownData();
    console.log("Salary Structure: ", salaryStructRcds);
    
  }, [salaryStructRcds.entryGroup]);
  const [payLevelRcds, setpayLevelRcds] = useState([{ value: "", label: "" }]);
  
  const payLevelQuery = {
    table: "designation_fund_mapping_mast dfm left join grade_details gd on dfm.grade_id=gd.GRADE_ID",
    fields: "gd.GRADE_ORDER,gd.basic_from",
    condition: `dfm.department='${otherDetail1Rcds.department}' and dfm.DDO ='${otherDetail1Rcds.ddo}' and dfm.DESIGNATION_ID='${otherDetail1Rcds.designation}' and dfm.location_ID='${otherDetail1Rcds.location}' and dfm.grade_id='${salaryStructRcds.entryGroup}'`,
    orderBy: "",
  };

  const getpayLevelDropDownData = async () => {
    try {
      getDropDown(
        payLevelQuery,
        payLevelRcds, setpayLevelRcds,
        "common",
        secretKey
      );
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getpayLevelDropDownData();
  }, [salaryStructRcds.entryGroup]);

  const [presentpayLevelRcds, setpresentpayLevelRcds] = useState([{ value: "", label: "" }]);

  const presentpayLevelQuery = {
    table: "grade_mast gm left join grade_details gd on  gm.grade_id=gd.GRADE_ID",
    fields: "gd.GRADE_ORDER,gd.basic_from",
    condition: `gm.GRADE_ID ='${salaryStructRcds.presentGroup}'`,
    orderBy: "",
  };

  const getpresentpayLevelDropDownData = async () => {
    try {
      getDropDown(
        presentpayLevelQuery,
        presentpayLevelRcds, setpresentpayLevelRcds,
        "common",
        secretKey
      );
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getpresentpayLevelDropDownData();
  }, [salaryStructRcds.presentGroup]);


  const incrementTypeOptions = [
    { label: "Fixed Amount", value: "FA" },
    { label: "Percentage", value: "PT" },
    // Add more options as needed
  ];

  return (
    <div className="card shadow-lg rounded-3">
      <div className="card-body p-4">
        <h5 className="text-center mb-4">Salary Structure</h5>
        <form onSubmit={handleSubmit}>
          <div className="row g-1">
            {/* CPF/GPF/NPS Type */}
            <div className="col-md-4">
              <SelectComponent
                label={data.cpfTypeLabel}
                name={data.cpfTypeName}
                selectedValue={salaryStructRcds.cpfType}
                errorMessage=""
                icon={icon.arrowDown}
                options={pFtYPERcds}
                size="small"
                onSelects={(value) =>
                  setSalaryStructRcds((prevState) => ({
                    ...prevState,
                    [data.cpfTypeName]: value,
                  }))} />
            </div>

            {/* Posting City */}
            <div className="col-md-4">
              <SelectComponent
                label={data.postingCityLabel}
                name={data.postingCityName}
                holder={data.postingCityHolder}
                selectedValue={salaryStructRcds.postingCity}
                errorMessage={errors.postingCity}
                required={true}
                icon={icon.arrowDown}
                options={cityRcds}
                size="small"
                onSelects={(value) =>
                  setSalaryStructRcds((prevState) => ({
                    ...prevState,
                    [data.postingCityName]: value,
                  }))} />
            </div>

            {/* Designation */}
            <div className="col-md-4">
              <SelectComponent
                label={data.designationLabel}
                name={data.designationName}
                selectedValue={salaryStructRcds.designation}
                errorMessage={errors.designation}
                required={true}
                icon={icon.arrowDown}
                options={designationRcds}
                size="small"
                onSelects={(value) =>
                  setSalaryStructRcds((prevState) => ({
                    ...prevState,
                    [data.designationName]: value,
                  }))}
                disabled={true}
              />
            </div>

            {/* Posted Designation */}
            <div className="col-md-4">
              <SelectComponent
                label={data.postedDesignationLabel}
                name={data.postedDesignationName}
                selectedValue={salaryStructRcds.postedDesignation}
                errorMessage=""
                icon={icon.arrowDown}
                options={designationRcds}
                size="small"
                onSelects={(value) =>
                  setSalaryStructRcds((prevState) => ({
                    ...prevState,
                    [data.postedDesignationName]: value,
                  }))} />
            </div>

            {/* Entry Group */}
            <div className="col-md-4">
              <SelectComponent
                label={data.entryGroupLabel}
                name={data.entryGroupName}
                selectedValue={salaryStructRcds.entryGroup}
                errorMessage={errors.entryGroup}
                required={true}
                icon={icon.arrowDown}
                options={gradeRcds}
                size="small"
                onSelects={(value) =>
                  setSalaryStructRcds((prevState) => ({
                    ...prevState,
                    [data.entryGroupName]: value,
                  }))} />
            </div>

            {/* Entry Pay Level */}
            <div className="col-md-4">
              <SelectComponent
                label={data.entryPayLevelLabel}
                name={data.entryGroupName}
                selectedValue={salaryStructRcds.entryPayLevel}
                errorMessage={errors.entryPayLevel}
                required={true}
                icon={icon.arrowDown}
                options={payLevelRcds}
                size="small"
                onSelects={(value) =>
                  setSalaryStructRcds((prevState) => ({
                    ...prevState,
                    [data.entryPayLevelName]: value,
                  }))} />
            </div>

            {/* Increment Type */}
            <div className="col-md-4">
              <SelectComponent
                label={data.incrementTypeLabel}
                name={data.incrementTypeName}
                selectedValue={salaryStructRcds.incrementType}
                errorMessage=""
                icon={icon.arrowDown}
                options={incrementTypeOptions}
                size="small"
                onSelects={(value) =>
                  setSalaryStructRcds((prevState) => ({
                    ...prevState,
                    [data.incrementTypeName]: value,
                  }))} />
            </div>

            {/* Present Group */}
            <div className="col-md-4">
              <SelectComponent
                label={data.presentGroupLabel}
                name={data.presentGroupName}
                selectedValue={salaryStructRcds.presentGroup}
                errorMessage={errors.presentGroup}
                required={true}
                icon={icon.arrowDown}
                options={presentgradeRcds}
                size="small"
                onSelects={(value) =>
                  setSalaryStructRcds((prevState) => ({
                    ...prevState,
                    [data.presentGroupName]: value,
                  }))} />
            </div>

            {/* Present Pay Level */}
            <div className="col-md-4">
              <SelectComponent
                label={data.presentPayLevelLabel}
                name={data.presentPayLevelName}
                selectedValue={salaryStructRcds.presentPayLevel}
                errorMessage={errors.presentPayLevel}
                required={true}
                icon={icon.arrowDown}
                options={presentpayLevelRcds}
                size="small"
                onSelects={(value) =>
                  setSalaryStructRcds((prevState) => ({
                    ...prevState,
                    [data.presentPayLevelName]: value,
                  }))} />
            </div>

            {/* Basic */}
            <div className="col-md-4">
              <FormText
                label={data.basicLabel}
                name={data.basicName}
                holder={data.basicHolder}
                value={salaryStructRcds.basic}
                errorMessage={errors.basic}
                required={true}
                onChange={handleChange}
                icon={icon.user}
                Maxlength="25"
                type={"number"}
              />
            </div>

            {/* Increment Due Date */}
            <div className="col-md-4">
              <FormDate
                label={data.incrementDueDateLabel}
                name={data.incrementDueDateName}
                value={salaryStructRcds.incrementDueDate}
                errorMessage={errors.incrementDueDate}
                required={true}
                onChange={handleChange}
                icon={icon.days}
                Maxlength="25"

              />
            </div>
          </div>


        </form>
      </div>
    </div>
  );
}

export default SalaryStructure;

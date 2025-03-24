import React, { useContext, useEffect, useState } from "react";
import SelectComponent from "../../components/SelectComponent"; // Dropdown component
import FormCheckbox from "../../components/FormCheckbox"; // Checkbox component
import icon from "../../properties/icon"; // Icon set
import { getDropDown } from "../../utils/api";
import { GlobalContext } from "../../context/GlobalContextProvider";
import { EmployeeContext } from "../../context/EmployeeMaster/EmployeeMasterContext";

function OtherDetails2() {

    const { secretKey } = useContext(GlobalContext);
      const { otherDetail1Rcds ,otherDetail2Rcds, setOtherDetail2Rcds,errors} = useContext(EmployeeContext);


  const data = {
    reportingToName: "reportingTo",
    reportingToLabel: "Reporting To",
    reportingToHolder: "Select Reporting To",

    onDeputationName: "onDeputation",
    onDeputationLabel: "On Deputation",
    onDeputationHolder: "Deputation?",

    reportingDirectorName: "reportingDirector",
    reportingDirectorLabel: "Reporting Director",
    reportingDirectorHolder: "Select Reporting Director",

    deputedLocationName: "deputedLocation",
    deputedLocationLabel: "Deputed Location",
    deputedLocationHolder: "Select Deputed Location",

    isSuspendedName: "isSuspended",
    isSuspendedLabel: "Is Suspended?",
    isSuspendedHolder: "Suspended?",

    associationName: "association",
    associationLabel: "Association",
    associationHolder: "Select Association",

    salaryBillTypeName: "salaryBillType",
    salaryBillTypeLabel: "Salary Bill Type",
    salaryBillTypeHolder: "Select Salary Bill Type",

    isHandicappedName: "isHandicapped",
    isHandicappedLabel: "Is Handicapped?",
    isHandicappedHolder: "Handicapped?",

    className: "class",
    classLabel: "Class",
    classHolder: "Select Class",

    postingDDOName: "postingDDO",
    postingDDOLabel: "Posting DDO",
    postingDDOHolder: "Select Posting DDO",

    ptApplicableName: "ptApplicable",
    ptApplicableLabel: "PT Applicable",
    ptApplicableHolder: "PT Applicable",

    stopSalaryName: "stopSalary",
    stopSalaryLabel: "Stop Salary",
    stopSalaryHolder: "Stop Salary"
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If checkbox, use checked property, else use value
    setOtherDetail2Rcds({
      ...otherDetail2Rcds,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    });

   // Remove the error for the current field while typing
   if (errors[name]) {
    errors[name] = ''; // Clear error message for that field
  }
  };

    ///********************************************DropDowns*****************************************************///
  
    const [reportingToRcds, setReportingToRcds] = useState([{ value: "", label: "" }]);
    
    const reportingToQuery = {
      table: "employee_mast e, designation_mast d",
      fields: "employeeId,concat( e.employeeName, ' [', e.employeeCode, '] ','- ' , d.DESIGNATION) des",
      condition: `e.designation = d.DESIGNATION_ID and  e.ddo='${otherDetail1Rcds.ddo}' and e.postingLocation='${otherDetail1Rcds.location}'`,
      orderBy: "order by 2",
    };
    
    const getReportingDropDownData = async () => {
      try {
        getDropDown(
          reportingToQuery,
          reportingToRcds, setReportingToRcds,
          "common",
          secretKey
        );
      } catch(error) {
        console.log(error);
      }
    };
    
    const [assocRcds, setAssocRcds] = useState([{ value: "", label: "" }]);
    
    const assocQuery = {
      table: "association_mast",
      fields: "ASSOCIATION_ID,association_name",
      condition: `1=1`,
      orderBy: "order by 2",
    };
    
    const getAssocDropDownData = async () => {
      try {
        getDropDown(
          assocQuery,
          assocRcds, setAssocRcds,
          "common",
          secretKey
        );
      } catch(error) {
        console.log(error);
      }
    };

    const [salaryBillRcds, setSalaryBillRcds] = useState([{ value: "", label: "" }]);
    
    const salaryBillQuery = {
      table: "salary_bill_mast",
      fields: "BILL_TYPE_ID,DESCRIPTION",
      condition: `1=1`,
      orderBy: "",
    };
    
    const getSalaryBillDropDownData = async () => {
      try {
        getDropDown(
          salaryBillQuery,
          salaryBillRcds, setSalaryBillRcds,
          "common",
          secretKey
        );
      } catch(error) {
        console.log(error);
      }
    };

    const [classRcds, setClassRcds] = useState([{ value: "", label: "" }]);
    
    const classQuery = {
      table: "class_mast",
      fields: "class_id,class",
      condition: `1=1`,
      orderBy: "",
    };
    
    const getClassDropDownData = async () => {
      try {
        getDropDown(
          classQuery,
          classRcds, setClassRcds,
          "common",
          secretKey
        );
      } catch(error) {
        console.log(error);
      }
    };

    const [postingDDORcds, setPostingDDORcds] = useState([{ value: "", label: "" }]);
    
    const postingDDOQuery = {
      table: "ddo",
      fields: "ddo_id,ddoname",
      condition: `1=1`,
      orderBy: "",
    };
    
    const getPostingDDODropDownData = async () => {
      try {
        getDropDown(
          postingDDOQuery,
          postingDDORcds, setPostingDDORcds,
          "common",
          secretKey
        );
      } catch(error) {
        console.log(error);
      }
    };
    
    useEffect(() => {
      getReportingDropDownData();
      getAssocDropDownData();
      getSalaryBillDropDownData();
      getClassDropDownData();
      getPostingDDODropDownData();
    }, []);
    
    const [reportingDirectorRcds, setReportingDirectorRcds] = useState([{ value: "", label: "" }]);
    const reportingDirectorQuery = {
      table: "employee_mast e,cparam c",
      fields: "e.employeeId,e.employeeName",
      condition: `e.designation=(select PDOC from cparam where CODE='HRMS' and SERIAL='Desig' and PARAM1='Y'and DESCP1='Director of Instruction')`,
      orderBy: "",
    };

  
    const getReportingDirectorDropDownData = async () => {
      try {
        getDropDown(
          reportingDirectorQuery,
          reportingDirectorRcds, setReportingDirectorRcds,
          "common",
          secretKey
        );
      } catch(error) {
        console.log(error);
      }
    };
  
    useEffect(() => {
      getReportingDropDownData();
      getReportingDirectorDropDownData();
    }, []);


  return (
    <>
    <div className="card shadow-lg rounded-3">
      <div className="card-body p-4">
        <h5 className="text-center mb-4">Other Details</h5>
        <div className="row g-1">
          {/* Reporting To Select */}
          <div className="col-md-4">
            <SelectComponent
              label={data.reportingToLabel}
              name={data.reportingToName}
              selectedValue={otherDetail2Rcds.reportingTo}
              errorMessage=""
              icon={icon.arrowDown}
              options={reportingToRcds}
              size="small"
              onSelects={(value) =>
                setOtherDetail2Rcds((prevState) => ({
                  ...prevState,
                  [data.reportingToName]: value,
                }))}
            />
          </div>

          {/* On Deputation Checkbox */}
          <div className="col-md-4 d-flex justify-content-center align-items-center">
            <FormCheckbox
              label={data.onDeputationLabel}
              name={data.onDeputationName}
              holder={data.onDeputationHolder}
              errorMessage=""
              onChange={handleChange}
              icon={icon.user}
              Maxlength="25" 
              checked={otherDetail2Rcds.onDeputation === "Y"}
            />
          </div>

          {/* Reporting Director Select */}
          <div className="col-md-4">
            <SelectComponent
              label={data.reportingDirectorLabel}
              name={data.reportingDirectorName}
              errorMessage=""
              icon={icon.arrowDown}
              options={reportingDirectorRcds}
              size="small"
              selectedValue={otherDetail2Rcds.reportingDirector}
              onSelects={(value) =>
                setOtherDetail2Rcds((prevState) => ({
                  ...prevState,
                  [data.reportingDirectorName]: value,
                }))}
            />
          </div>

          {/* Deputed Location Select */}
          <div className="col-md-4">
            <SelectComponent
              label={data.deputedLocationLabel}
              name={data.deputedLocationName}
              errorMessage=""
              icon={icon.arrowDown}
              // options={departmentHeadOptions}
              size="small"
              selectedValue={otherDetail2Rcds.deputedLocation}
              onSelects={(value) =>
                setOtherDetail2Rcds((prevState) => ({
                  ...prevState,
                  [data.deputedLocationName]: value,
                }))}
                disabled={true}
            />
          </div>

          {/* Is Suspended Checkbox */}
          <div className="col-md-4 d-flex justify-content-center align-items-center">
            <FormCheckbox
              label={data.isSuspendedLabel}
              name={data.isSuspendedName}
              holder={data.isSuspendedHolder}
              errorMessage=""
              onChange={handleChange}
              icon={icon.user}
              checked={otherDetail2Rcds.isSuspended === "Y"}
            />
          </div>

          {/* Association Select */}
          <div className="col-md-4">
            <SelectComponent
              label={data.associationLabel}
              name={data.associationName}
              errorMessage=""
              icon={icon.arrowDown}
              options={assocRcds}
              size="small"
              selectedValue={otherDetail2Rcds.association}
              onSelects={(value) =>
                setOtherDetail2Rcds((prevState) => ({
                  ...prevState,
                  [data.associationName]: value,
                }))}
            />
          </div>

          {/* Salary Bill Type Select */}
          <div className="col-md-4">
            <SelectComponent
              label={data.salaryBillTypeLabel}
              name={data.salaryBillTypeName}
              errorMessage={errors.salaryBillType}
              required={true}
              icon={icon.arrowDown}
              options={salaryBillRcds}
              size="small"
              selectedValue={otherDetail2Rcds.salaryBillType}
              onSelects={(value) =>
                setOtherDetail2Rcds((prevState) => ({
                  ...prevState,
                  [data.salaryBillTypeName]: value,
                }))}
            />
          </div>

          {/* Is Handicapped Checkbox */}
          <div className="col-md-4 d-flex justify-content-center align-items-center">
            <FormCheckbox
              label={data.isHandicappedLabel}
              name={data.isHandicappedName}
              holder={data.isHandicappedHolder}
              errorMessage=""
              onChange={handleChange}
              icon={icon.user}
              checked={otherDetail2Rcds.isHandicapped === "Y"}
            />
          </div>

          {/* Class Select */}
          <div className="col-md-4">
            <SelectComponent
              label={data.classLabel}
              name={data.className}
              // errorMessage={errors.class}
              icon={icon.arrowDown}
              options={classRcds}
              size="small"
              selectedValue={otherDetail2Rcds.class}
              onSelects={(value) =>
                setOtherDetail2Rcds((prevState) => ({
                  ...prevState,
                  [data.className]: value,
                }))}
                required={true}
            />
          </div>

          {/* Posting DDO Select */}
          <div className="col-md-4">
            <SelectComponent
              label={data.postingDDOLabel}
              name={data.postingDDOName}
              errorMessage=""
              icon={icon.arrowDown}
              options={postingDDORcds}
              size="small"
              selectedValue={otherDetail2Rcds.postingDDO}
              onSelects={(value) =>
                setOtherDetail2Rcds((prevState) => ({
                  ...prevState,
                  [data.postingDDOName]: value,
                }))}
            />
          </div>

          {/* PT Applicable Checkbox */}
          <div className="col-md-4 d-flex justify-content-center align-items-center">
            <FormCheckbox
              label={data.ptApplicableLabel}
              name={data.ptApplicableName}
              holder={data.ptApplicableHolder}
              errorMessage=""
              onChange={handleChange}
              icon={icon.user}
              checked={otherDetail2Rcds.ptApplicable === "Y"}
            />
          </div>

          {/* Stop Salary Checkbox */}
          <div className="col-md-4 d-flex justify-content-center align-items-center">
            <FormCheckbox
              label={data.stopSalaryLabel}
              name={data.stopSalaryName}
              holder={data.stopSalaryHolder}
              errorMessage=""
              onChange={handleChange}
              icon={icon.user}
              checked={otherDetail2Rcds.stopSalary === "Y"}
            />
          </div>
        </div>
      </div>
    </div>

  </>
  );
}

export default OtherDetails2;

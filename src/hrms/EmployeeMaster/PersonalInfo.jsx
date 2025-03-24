import React, { useContext, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import SelectComponent from "../../components/SelectComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import icon from "../../properties/icon";
import FormText from "../../components/FormText";
import FormDate from "../../components/FormDate";
import FormEmail from "../../components/FormEmail";
import "../../styles/personalInfo.css";
import { EmployeeContext } from "../../context/EmployeeMaster/EmployeeMasterContext";
import { getDropDown } from "../../utils/api";
import { retrieveFromCookies } from "../../utils/CryptoUtils";

function PersonalInfo() {
  const secretKey = retrieveFromCookies("AESDecKey");
  const { personalInfoRcds, setPersonalInfoRcds,errors} = useContext(EmployeeContext);
  useEffect(() => {console.log(personalInfoRcds)},[personalInfoRcds]);


  // Handle form field changes
  const handleChange = (evt) => {
    const { name, value, type, checked } = evt.target;
    setPersonalInfoRcds((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    }));

   // Remove the error for the current field while typing
   if (errors[name]) {
    errors[name] = ''; // Clear error message for that field
  }
  };
  const data = {
    genderName: "gender",
    genderLabel: "Gender",
    genderHolder: "Select Gender",

    categoryName: "category",
    categoryLabel: "Category",
    categoryHolder: "Select Category",

    postCategoryName: "postCategory",
    postCategoryHolder: "Select Post Category",
    postCategoryLabel: "Post Category",

    maritalName: "maritalStatus",
    maritalHolder: "Select Marital Status",
    maritalLabel: "Marital Status",

    religionName: "religion",
    religionHolder: "Select Religion",
    religionLabel: "Religion",

    dobName: "dob",
    dobHolder: "Enter Date Of Birth",
    dobLabel: "Date of Birth",

    mobileName: "mobile",
    mobileHolder: "Enter Mobile Number",
    mobileLabel: "Mobile No.",

    adharName: "adharNo",
    adharHolder: "Enter Adhar No",
    adharLabel: "Adhar No.",

    stateName: "state",
    stateHolder: "Select State",
    stateLabel: "State",

    emailName: "email",
    emailHolder: "Enter Email Address",
    emailLabel: "Email",

  };


  ///********************************************DropDowns*****************************************************///

  const [stateRcds, setStateRcds] = useState([{ value: "", label: "" }]);

  const stateQuery = {
    table: "state_mast",
    fields: "state_id,state",
    condition:
      "1=1 ",
    orderBy: "",
  };

  const getDropDownData = async () => {
    try {
      getDropDown(
        stateQuery,
        stateRcds, setStateRcds,
        "common",
        secretKey
      );
    } catch { }
  };


  const [categoryRcds, setCategoryRcds] = useState([{ value: "", label: "" }]);

  const categoryQuery = {
    table: "category_mast",
    fields: "category_id,category",
    condition:
      "1=1 ",
    orderBy: "",
  };

  const getCategoryDropDownData = async () => {
    try {
      getDropDown(
        categoryQuery,
        categoryRcds,
        setCategoryRcds,
        "common",
        secretKey
      );
    } catch { }
  };

  const [religionRcds, setReligionRcds] = useState([{ value: "", label: "" }]);

  const religionQuery = {
    table: "religion_mast",
    fields: "religion_id,religion",
    condition:
      "1=1 ",
    orderBy: "",
  };

  const getReligionDropDownData = async () => {
    try {
      getDropDown(
        religionQuery,
        religionRcds,
        setReligionRcds,
        "common",
        secretKey
      );
    } catch { }
  };

  const [maritalRcds, setMaritalRcds] = useState([{ value: "", label: "" }]);

  const maritalQuery = {
    table: "marital_mast",
    fields: "marital_id,marital",
    condition:
      "1=1 ",
    orderBy: "",
  };

  const getMaritalDropDownData = async () => {
    try {
      getDropDown(
        maritalQuery,
        maritalRcds,
        setMaritalRcds,
        "common",
        secretKey
      );
    } catch { }
  };

  const [genderRcds, setGenderRcds] = useState([{ value: "", label: "" }]);

  const genderQuery = {
    table: "cparam",
    fields: "pdoc,descp1",
    condition:
      "serial ='gender' and code = 'web' ",
    orderBy: "",
  };

  const getGenderDropDownData = async () => {
    try {
      getDropDown(
        genderQuery,
        genderRcds,
        setGenderRcds,
        "common",
        secretKey
      );
    } catch { }
  };

  useEffect(() => {
    getDropDownData();
    getCategoryDropDownData();
    getReligionDropDownData();
    getMaritalDropDownData();
    getGenderDropDownData();
  }, []);

  return (
    <div className="card shadow-lg rounded-3">
    <div className="card-body p-4">
      <h5 className="text-center mb-4">Personal Information</h5>
      <div className="row g-1">
        {/* Gender Select */}
        <div className="col-md-4">
          <SelectComponent
            required={true}

            label={data.genderLabel}
            name={data.genderName}
            selectedValue={personalInfoRcds.gender}
            errorMessage={errors.gender}
            icon={icon.arrowDown}
            options={genderRcds}
            size="small"
            onSelects={(value) =>
              setPersonalInfoRcds((prevState) => ({
                ...prevState,
                gender: value,
              }))}
              
          />
        </div>

        {/* Personal Category Select */}
        <div className="col-md-4">
          <SelectComponent
            label="Personal Category"
            name={data.categoryName}
            selectedValue={personalInfoRcds.category}
            errorMessage=""
            icon={icon.arrowDown}
            options={categoryRcds}
            size="small"
            onSelects={(value) =>
              setPersonalInfoRcds((prevState) => ({
                ...prevState,
                category: value,
              }))}
          />
        </div>

        {/* Religion Select */}
        <div className="col-md-4">
          <SelectComponent
                      required={true}
            label={data.religionLabel}
            name={data.religionName}
            selectedValue={personalInfoRcds.religion}
            errorMessage={errors.religion}
            icon={icon.arrowDown}
            options={religionRcds}
            size="small"

            onSelects={(value) =>
              setPersonalInfoRcds((prevState) => ({
                ...prevState,
                religion: value,
              }))}
          />
        </div>

        {/* Post Category Select */}
        <div className="col-md-4">
          <SelectComponent
            label={data.postCategoryLabel}
            name={data.postCategoryName}
            selectedValue={personalInfoRcds[data.postCategoryName]}
            errorMessage=""
            icon={icon.arrowDown}
            options={categoryRcds}
            size="small"
            onSelects={(value) =>
              setPersonalInfoRcds((prevState) => ({
                ...prevState,
                postCategory: value,
              }))}
          />
        </div>

        {/* Marital Status Select */}
        <div className="col-md-4">
          <SelectComponent
            label={data.maritalLabel}
            name={data.maritalName}
            selectedValue={personalInfoRcds.maritalStatus}
            errorMessage={errors.maritalStatus}
            required={true}
            icon={icon.arrowDown}
            options={maritalRcds}
            size="small"
            holder={data.maritalHolder}
            onSelects={(value) =>
              setPersonalInfoRcds((prevState) => ({
                ...prevState,
                maritalStatus: value,
              }))} />
        </div>

        {/* Date of Birth Input */}
        <div className="col-md-4">
          <FormDate
            label={data.dobLabel}
            name={data.dobName}
            holder={data.dobHolder}
            value={personalInfoRcds[data.dobName]}
            errorMessage={errors.dob}
            required={true}
            onChange={handleChange}
            icon={icon.user}
            Maxlength="25"

          />
        </div>

        {/* Email Input */}
        <div className="col-md-4">
          <FormEmail
            label={data.emailLabel}
            name={data.emailName}
            holder={data.emailHolder}
            value={personalInfoRcds[data.emailName]}
            errorMessage={errors.email}
            required={true}
            onChange={handleChange}
            icon={icon.user}
            Maxlength="25"
          />
        </div>

        {/* Adhaar No. Input */}
        <div className="col-md-4">
          <FormText
            label={data.adharLabel}
            name={data.adharName}
            holder={data.adharHolder}
            value={personalInfoRcds[data.adharName]}
            errorMessage=""
            onChange={handleChange}
            icon={icon.user}
            Maxlength="16"
            type={"number"}
          />
        </div>

        {/* Mobile No. Input */}
        <div className="col-md-4">
          <FormText
            label={data.mobileLabel}
            name={data.mobileName}
            holder={data.mobileHolder}
            value={personalInfoRcds[data.mobileName]}
            errorMessage={errors.mobile}
            required={true}
            onChange={handleChange}
            icon={icon.user}
            Maxlength="10"
            type={"number"}
          />
        </div>

        {/* State Select */}
        <div className="col-md-4">
          <SelectComponent
            label={data.stateLabel}
            name={data.stateName}
            selectedValue={personalInfoRcds.state}
            errorMessage={errors.state}
            required={true}
            icon={icon.arrowDown}
            options={stateRcds}
            size="small"
            onSelects={(value) =>
              setPersonalInfoRcds((prevState) => ({
                ...prevState,
                state: value,
              }))}
          />
        </div>
      </div>
    </div>
  </div>

  );
}

export default PersonalInfo;

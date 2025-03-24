import React, { useContext, useEffect, useRef, useState } from "react";
import Breadcrumbs from "../../components/Breadcrumbs";
import icon from "../../properties/icon";
import FormText from "../../components/FormText";
import SelectComponent from "../../components/SelectComponent";
import "../../styles/inputStyle.css";
import ManageEmployeeTabs from "./ManageEmployeeTabs";
import { getDropDown, getSave, getUpdate } from "../../utils/api";
import { EmployeeContext } from "../../context/EmployeeMaster/EmployeeMasterContext";
import useCheckResponseStatus from "../../hooks/useCheckResponseStatus";
import FormButton from "../../components/FormButton";
import ErrorMessageABD from "../../components/ErrorMessageABD";
import ProgressBar from "../../components/ProgressBar";
import EmployeeDetailsPage from "./EmployeeDetailsPage";
import { GlobalContext } from "../../context/GlobalContextProvider";
import useKeyboardShortcut from "../../hooks/useKeyboardShortcut";

const CreateEmployee = ({ toggleDiv, handleBackButtonClick }) => {
  const [showModal, setShowModal] = useState(false);
  const [salutationRcds, setSalutationRcds] = useState([{ value: "", label: "" }]);
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const { secretKey } = useContext(GlobalContext);
  const {
    test,
    rcds,
    setRcds,
    validateFields,
    errors,
    handleSaveEmployee,
    clearAllFields,
    progress,
    isValid,
    viewRecordData,
  } = useContext(EmployeeContext);
  useEffect(() => {
    console.log(viewRecordData, "----------||viewRecordData");
  }, []);

  const { checkResponseStatus } = useCheckResponseStatus();
  const deleteCooldown = useRef(false);
  const [loading, setLoading] = useState(false);
  const [errorVisibleComponent, setErrorMessageVisibleComponent] = useState(false);
  const [errorType, setErrorType] = useState();
  const [errorDivMessage, setErrorDivMessage] = useState("");

  const handleChange = (evt) => {
    const { name, value, type, checked } = evt.target;
    setRcds((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    }));

    if (errors[name]) {
      errors[name] = ""; // Clear error message for that field
    }
  };
  /////////////////////////***************** Data Related To Employee Creation /////////////////////////////////////////////////*/

  const data = {
    salName: "salutation",
    salLabel: "Salutation",
    salHolder: " ",

    empName: "empName",
    empLabel: "Employee Name",
    empHolder: "Enter Employee name",

    empCodeName: "empCode",
    empCodeHolder: "Auto Generated",
    empCodeLabel: "Employee Code",

    empManCodeName: "empManualCode",
    empManCodeHolder: "Enter Manual Employee Code",
    empManCodeLabel: "Manual Employee Code",

    fatherName: "fatherName",
    fatherHolder: "Enter Father Name",
    fatherLabel: "Father Name",
  };

  

  const salutationQuery = {
    table: "salutation_mast",
    fields: "sal_id,salutation",
    condition: "1=1 ",
    orderBy: "",
  };

  const getDropDownData = async () => {
    try {
      console.log(salutationQuery);
      getDropDown(
        salutationQuery,
        salutationRcds,
        setSalutationRcds,
        "common",
        secretKey,
        "user"
      );
    } catch {}
  };

  useEffect(() => {
    getDropDownData();
  }, []);

  const handleReset = () => {
    clearAllFields();
  };

  const handleCreate = async (evt) => {
    evt.preventDefault();
    setLoading(true);

    const errorsMsg = validateFields();
    const areAllValuesEmpty = Object.values(errorsMsg).every(
      (value) => value === ""
    );
    if (!areAllValuesEmpty) {
      setLoading(false);
      return;
    }
    const data = await handleSaveEmployee();
    

    try {
      console.log("Data: ",data);
      const ciphertext = encAESData(secretKey, data);
      let responseData;

      if (rcds.employeeId) {
        deleteCooldown.current = false;
        // Update case
        const response = await getUpdate("hrms", "employeeMaster", ciphertext,"user");
        responseData = checkResponseStatus(response,"user");
      } else {
        // Save case
        const response = await getSave("hrms", "employeeMaster", ciphertext,"user");
        console.log("response in save in employeeMaster:", response);

        responseData = checkResponseStatus(response,"user");
      }

      if (responseData) {
        if (responseData.rType === "Y") {
          const jsonData = JSON.parse(responseData.rData);
          const decryptedData = decAESData(secretKey, jsonData);
          clearAllFields();

          setErrorMessageVisibleComponent(true);
          setErrorType(true);
          setErrorDivMessage(responseData.rMessage);
        } else {
          setErrorMessageVisibleComponent(true);
          setErrorType(false);
          setErrorDivMessage(responseData.rMessage);
        }
      }
    } catch (error) {
      console.error(error);
      setErrorType(false);
      setErrorDivMessage(error.message || "An error occurred");
      setErrorMessageVisibleComponent(true);
    } finally {
      deleteCooldown.current = false;
      setLoading(false);
      setTimeout(() => {
        setErrorMessageVisibleComponent(false);
        setErrorDivMessage("");
      }, 4000);
    }
  };

  useKeyboardShortcut(
    "N",
    () => {
      handleBackButtonClick();
    },
    { alt: true }
  );

  return (
    <>
      <div className="container-fluid px-1">
        <Breadcrumbs />
      </div>
      <div className="container-body mx-3 mb-3">
        <div className="card-body px-4 py-1">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="text-center mb-1">Create and Manage Employee</h5>

              <div className="d-flex justify-content-center align-items-center">
                <ProgressBar progress={progress} isValid={isValid} />
              </div>
              {/* <div>
      <Button variant="primary" onClick={handleShow}>
        View Employee Details
      </Button>

      <EmployeeDetailsPage show={showModal} handleClose={handleClose} />
    </div> */}
            </div>
          </div>
          <div className="row g-1">
            <div className="col-md-4">
              <FormText
                label={data.empCodeLabel}
                name={data.empCodeName}
                holder={data.empCodeHolder}
                value={rcds[data.empCodeName]}
                onChange={handleChange}
                icon={icon.user}
                Maxlength="25"
                disabled={true}
                required={true}
              />
            </div>

            <div className="col-md-4">
              <FormText
                label={data.empManCodeLabel}
                name={data.empManCodeName}
                holder={data.empManCodeHolder}
                value={rcds[data.empManCodeName]}
                errorMessage={errors.empManualCode}
                onChange={handleChange}
                icon={icon.user}
                Maxlength="25"
                required={true}
              />
            </div>

            <div className="col-md-4">
              <FormText
                label={data.fatherLabel}
                name={data.fatherName}
                holder={data.fatherHolder}
                value={rcds[data.fatherName]}
                errorMessage=""
                onChange={handleChange}
                icon={icon.user}
                Maxlength="25"
              />
            </div>

            <div className="col-md-6">
              <div className="row">
                <div className="col-4">
                  <SelectComponent
                    label={data.salLabel}
                    name={data.salName}
                    selectedValue={rcds.salutation}
                    holder={data.salHolder}
                    errorMessage={errors.salutation}
                    required={true}
                    onChange={handleChange}
                    onSelects={(value) =>
                      setRcds((prevState) => ({
                        ...prevState,
                        salutation: value,
                      }))
                    }
                    icon={icon.arrowDown}
                    options={salutationRcds}
                    size="small"
                    width="100%"
                  />
                </div>
                <div className="col-8">
                  <FormText
                    label={data.empLabel}
                    name={data.empName}
                    holder={data.empHolder}
                    value={rcds[data.empName]}
                    errorMessage={errors.empName}
                    required={true}
                    onChange={handleChange}
                    icon={icon.user}
                    Maxlength="25"
                    width="250px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-body mx-3 mb-3">
        <ManageEmployeeTabs />

        <div className="d-flex justify-content-start mx-4 mt-4">
          <FormButton
            btnType1={"Save"}
            btnType3={"Update"}
            btnType4={"Back"}
            btnType5={"Reset"}
            onClick={handleCreate}
            onBack={handleBackButtonClick}
            onReset={handleReset}
            showUpdate={!!rcds.employeeId}
            rcds={rcds}
            loading={loading}
          />
          {!rcds.employeeId && (
            <button
              type="button"
              className="btn btn-secondary btn-sm ms-2 me-2"
              onClick={handleBackButtonClick}
            >
              {" "}
              <i className="fa fa-arrow-left me-2"></i> Back To Page
            </button>
          )}
        </div>
        {errorVisibleComponent && (
          <ErrorMessageABD
            text={errorDivMessage}
            isSuccess={errorType}
            isVisible={errorVisibleComponent}
            setVisible={setErrorMessageVisibleComponent}
          />
        )}
      </div>
    </>
  );
};

export default CreateEmployee;

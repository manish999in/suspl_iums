import React, { useContext, useEffect, useState } from 'react';
import SelectComponent from "../../components/SelectComponent";
import FormText from "../../components/FormText";
import icon from "../../properties/icon";
import { getDropDown } from '../../utils/api';
import { GlobalContext } from '../../context/GlobalContextProvider';
import { EmployeeContext } from "../../context/EmployeeMaster/EmployeeMasterContext";
function BankDetails() {

  const { secretKey } = useContext(GlobalContext);
  const { bankDetailsRcds,setBankDetailsRcds,errors} = useContext(EmployeeContext);

  // const [bankDetailsRcds, setBankDetailsRcds] = useState({
  //   paymentMode: '',
  //   accountNumber: '',
  //   bank: '',
  //   accountType: '',
  //   ifsc: '',
  //   micr: '',
  //   vendorCode: 'N/A',
  // });

  const data = {
    paymentModeName: "paymentMode",
    paymentModeLabel: "Payment Mode",
    paymentModeHolder: "Select Payment Mode",
    accountNumberName: "accountNumber",
    accountNumberLabel: "Account Number",
    accountNumberHolder: "Enter Account Number",
    bankName: "bank",
    bankLabel: "Bank",
    bankHolder: "Enter Bank Name",
    accountTypeName: "accountType",
    accountTypeLabel: "Account Type",
    accountTypeHolder: "Select Account Type",
    ifscName: "ifsc",
    ifscLabel: "IFSC",
    ifscHolder: "Enter IFSC",
    micrName: "micr",
    micrLabel: "MICR",
    micrHolder: "Enter MICR",
    vendorCodeName: "vendorCode",
    vendorCodeLabel: "Vendor Code",
    vendorCodeHolder: "Enter Vendor Code",
  };

  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If checkbox, use checked property, else use value
    setBankDetailsRcds({
      ...bankDetailsRcds,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    });

     // Remove the error for the current field while typing
     if (errors[name]) {
      errors[name] = ''; // Clear error message for that field
    }

  };

  const [paymentModeRcds, setPaymentModeRcds] = useState([{ value: "", label: "" }]);

  const paymentModeQuery = {
    table: "cparam",
    fields: "PDOC,DESCP1",
    condition: `CODE='HRMS' AND SERIAL='PAY_MODE' AND PARAM1='Y'`,
    orderBy: "",
  };

  const getPaymentModeDropDownData = async () => {
    try {
      getDropDown(
        paymentModeQuery,
        paymentModeRcds, setPaymentModeRcds,
        "common",
        secretKey
      );
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {

    getPaymentModeDropDownData();
  }, []);
  
  
  const accoutnTypeOptions = [
    { label: "Saving", value: "S" },
    { label: "Current", value: "C" },
    // Add more options as needed
  ];


  return (
    <>
      {/* Bank Details Form */}
      <div className="card shadow-lg rounded-3">
        <div className="card-body p-4">
          <h5 className="text-center mb-4">Bank Details</h5>

          {/* Form Fields */}
          <div className="row g-1">
            {/* Payment Mode Select */}
            <div className="col-md-4">
              <SelectComponent
                label={data.paymentModeLabel}
                name={data.paymentModeName}
                selectedValue={bankDetailsRcds.paymentMode}
                errorMessage={errors.paymentMode}
                required={true}
                icon={icon.arrowDown}
                options={paymentModeRcds}
                onSelects={(value) =>
                  setBankDetailsRcds((prevState) => ({
                    ...prevState,
                    [data.paymentModeName]: value,
                  }))}
              />
            </div>

            {/* Account Number Text */}
            <div className="col-md-4">
              <FormText
                label={data.accountNumberLabel}
                name={data.accountNumberName}
                value={bankDetailsRcds.accountNumber}
                onChange={handleChange}
                icon={icon.user}
                Maxlength="25"
                holder={data.accountNumberHolder}
                type={"number"}
              />
            </div>

            {/* Bank Text */}
            <div className="col-md-4">
              <FormText
                label={data.bankLabel}
                name={data.bankName}
                value={bankDetailsRcds.bank}
                onChange={handleChange}
                icon={icon.user}
                Maxlength="25"
                holder={data.bankHolder}
              />
            </div>

            {/* Account Type Select */}
            <div className="col-md-4">
              <SelectComponent
                label={data.accountTypeLabel}
                name={data.accountTypeName}
                selectedValue={bankDetailsRcds.accountType}
                icon={icon.arrowDown}
                options={accoutnTypeOptions}
                onSelects={(value) =>
                  setBankDetailsRcds((prevState) => ({
                    ...prevState,
                    [data.accountTypeName]: value,
                  }))}
              />
            </div>

            {/* IFSC Text */}
            <div className="col-md-4">
              <FormText
                label={data.ifscLabel}
                name={data.ifscName}
                value={bankDetailsRcds.ifsc}
                onChange={handleChange}
                icon={icon.user}
                Maxlength="25"
                holder={data.ifscHolder}
              />
            </div>

            {/* MICR Text */}
            <div className="col-md-4">
              <FormText
                label={data.micrLabel}
                name={data.micrName}
                value={bankDetailsRcds.micr}
                onChange={handleChange}
                icon={icon.user}
                Maxlength="25"
                holder={data.micrHolder}
              />
            </div>

            {/* Vendor Code Text */}
            <div className="col-md-4">
              <FormText
                label={data.vendorCodeLabel}
                name={data.vendorCodeName}
                value={bankDetailsRcds.vendorCode}
                onChange={handleChange}
                errorMessage={errors.vendorCode}
                required={true}
                icon={icon.user}
                Maxlength="25"
                holder={data.vendorCodeHolder}
              />
            </div>

          </div>
          <div className="row g-1">
            <div className="col-md-4 text-danger mt-3">
              Note: Enter 'N/A' if Vendor Code is not required
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default BankDetails;

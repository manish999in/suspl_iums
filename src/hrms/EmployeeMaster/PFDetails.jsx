import React, { useContext, useState } from "react";
import FormText from "../../components/FormText";
import FormNumber from "../../components/FormNumber";
import icon from "../../properties/icon";
import { EmployeeContext } from "../../context/EmployeeMaster/EmployeeMasterContext";

function PFDetails() {

    const { pfDetailsRcds, setPfDetailsRcds} = useContext(EmployeeContext);
  

  const data = {
    bankCPFGPFNPSName: "bankCPFGPFNPS",
    bankCPFGPFNPSLabel: "CPF/GPF/NPS Bank",
    bankCPFGPFNPSHolder: "Enter CPF/GPF/NPS Bank",

    accountCPFGPFNPSName: "accountCPFGPFNPS",
    accountCPFGPFNPSLabel: "CPF/GPF/NPS Account",
    accountCPFGPFNPSHolder: "Enter CPF/GPF/NPS Account",

    balanceCPFGPFNPSName: "balanceCPFGPFNPS",
    balanceCPFGPFNPSLabel: "CPF/GPF/NPS Balance",
    balanceCPFGPFNPSHolder: "Enter CPF/GPF/NPS Balance",
    
  };

  const [errors, setErrors] = useState({
    bankName: "",
    balance: "",
  });


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If checkbox, use checked property, else use value
    setPfDetailsRcds({
      ...pfDetailsRcds,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    });

    // // Remove the error for the current field while typing
    // setErrorMessages((prevErrors) => ({
    //   ...prevErrors,
    //   [name]: "", // Clear error message for the current field
    // }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Proceed with form submission (e.g., API call or state update)
      console.log("Form Submitted", formData);
    }
  };

  return (
    <>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3 g-1">
              <div className="col-md-4">
                <FormText
                  label={data.bankCPFGPFNPSLabel}
                  name={data.bankCPFGPFNPSName}
                  holder={data.bankCPFGPFNPSHolder}
                  value={pfDetailsRcds.bankCPFGPFNPS}
                  errorMessage={errors.bankName}
                  onChange={handleChange}
                  icon={icon.user} // Example FontAwesome icon; change as needed
                  Maxlength="25"
                />
              </div>

              <div className="col-md-4">
                <FormText
                  label={data.balanceCPFGPFNPSLabel}
                  name={data.balanceCPFGPFNPSName}
                  holder={data.balanceCPFGPFNPSHolder}
                  value={pfDetailsRcds.balanceCPFGPFNPS}
                  // errorMessage={errors.balance}
                  onChange={handleChange}
                  icon={icon.user} // Example FontAwesome icon; change as needed
                  Maxlength="25"
                  type={"number"}
                />
             
              </div>
              <div className="col-md-4">
                <FormText
                  label={data.accountCPFGPFNPSLabel}
                  name={data.accountCPFGPFNPSName}
                  holder={data.accountCPFGPFNPSHolder}
                  value={pfDetailsRcds.accountCPFGPFNPS}
                  // errorMessage={errors.balance}
                  onChange={handleChange}
                  icon={icon.user} // Example FontAwesome icon; change as needed
                  Maxlength="25"
                  type={"number"}
                />
              </div>
            </div>

             
          </form>
        </div>
      </div>
    </>
  );
}

export default PFDetails;

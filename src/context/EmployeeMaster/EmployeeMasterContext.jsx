import React, { useContext, useEffect, useRef, useState } from "react";
import { GlobalContext } from "../GlobalContextProvider";
import { useConvertFile } from "../../hooks/useConvertFile";
import PersonalInfo from "../../hrms/EmployeeMaster/PersonalInfo";
import OtherDetails1 from "../../hrms/EmployeeMaster/OtherDetails1";
import OtherDetails2 from "../../hrms/EmployeeMaster/OtherDetails2";
import OtherRole from "../../hrms/EmployeeMaster/OtherRole";
import BankDetails from "../../hrms/EmployeeMaster/BankDetails";
import PFDetails from "../../hrms/EmployeeMaster/PFDetails";
import SalaryStructure from "../../hrms/EmployeeMaster/SalaryStructure";
// import EarningDeductionHead from "../../hrms/EmployeeMaster/EarningDeductionHead";
import ProfilePicture from "../../hrms/EmployeeMaster/ProfilePicture";
import useBase64ToFile from "../../hooks/useBase64ToFile";

export const EmployeeContext = React.createContext();

// Create a provider component
export const EmployeeContextProvider = ({ children, viewRecordData }) => {
  const { s_user } = useContext(GlobalContext);
  const [activeTab, setActiveTab] = useState(0); // Track the active tab
  const [isValid, setIsValid] = useState(false);

  const [rcds, setRcds] = useState({
    empCode: "",
    empManualCode: "",
    fatherName: "",
    salutation: "",
    empName: "",
    employeeId: "",
    publicIp: s_user.publicIp,
    userId: s_user.userId,
  });

  const [personalInfoRcds, setPersonalInfoRcds] = useState({
    // tab 1
    gender: "",
    category: "",
    postCategory: "",
    religion: "",
    maritalStatus: "",
    dob: "",
    email: "",
    adharNo: "",
    mobile: "",
    state: "",
  });

  const [otherDetail1Rcds, setOtherDetail1Rcds] = useState({
    // tab 2
    location: "",
    ddo: "",
    department: "",
    departmentHead: "",
    designation: "",
    discipline: "",
    dateOfAppointment: "",
    dateOfJoining: "",
    employeeCode: "",
    isProbation: false,
    lastAppointmentDate: "",
    dateOfRetirement: "",
    fundType: "",
    lastJoiningDate: "",
    budgetHead: "",
    employeeLeftStatus: "",
    natureType: "",
    leavingDate: "",
    presentDiscipline: "",
    leavingRemarks: "",
  });

  const [otherDetail2Rcds, setOtherDetail2Rcds] = useState({
    //tab 4
    reportingTo: "",
    onDeputation: "",
    reportingDirector: "",
    deputedLocation: "",
    isSuspended: "",
    association: "",
    salaryBillType: "",
    isHandicapped: "",
    class: "",
    postingDDO: "",
    ptApplicable: "",
    stopSalary: "",
  });

  // State to manage form data
  const [pfDetailsRcds, setPfDetailsRcds] = useState({
    // tab 6
    bankCPFGPFNPS: "",
    accountCPFGPFNPS: "",
    balanceCPFGPFNPS: "",
  });

  const [salaryStructRcds, setSalaryStructRcds] = useState({
    // tab 7
    cpfType: "",
    postingCity: "",
    designation: otherDetail1Rcds.designation,
    postedDesignation: otherDetail1Rcds.designation,
    entryGroup: "",
    entryPayLevel: "",
    incrementType: "",
    presentGroup: "",
    presentPayLevel: "",
    basic: 0,
    incrementDueDate: "",
  });

  const [bankDetailsRcds, setBankDetailsRcds] = useState({
    // tab 5
    paymentMode: "",
    accountNumber: "",
    bank: "",
    accountType: "",
    ifsc: "",
    micr: "",
    vendorCode: "N/A",
  });

  const [imageRcds, setImageRcds] = useState({
    // tab 8
    imageName: "",
    image: "",
  });

  // State to track progress
  const [progress, setProgress] = useState(0);

  // Function to calculate progress dynamically
  const calculateProgress = () => {
    // Count total number of fields and filled fields for all tabs
    const totalFields =
      Object.keys(rcds).length +
      Object.keys(personalInfoRcds).length +
      Object.keys(otherDetail1Rcds).length +
      Object.keys(otherDetail2Rcds).length +
      Object.keys(pfDetailsRcds).length +
      Object.keys(salaryStructRcds).length +
      Object.keys(bankDetailsRcds).length +
      Object.keys(imageRcds).length;

    let filledFields = 0;

    // Count filled fields for each section (rcds, personalInfoRcds, etc.)
    for (let key in rcds) {
      if (rcds[key] !== "") filledFields++;
    }
    for (let key in personalInfoRcds) {
      if (personalInfoRcds[key] !== "") filledFields++;
    }
    for (let key in otherDetail1Rcds) {
      if (otherDetail1Rcds[key] !== "") filledFields++;
    }
    for (let key in otherDetail2Rcds) {
      if (otherDetail2Rcds[key] !== "") filledFields++;
    }
    for (let key in pfDetailsRcds) {
      if (pfDetailsRcds[key] !== "") filledFields++;
    }
    for (let key in salaryStructRcds) {
      if (salaryStructRcds[key] !== "") filledFields++;
    }
    for (let key in bankDetailsRcds) {
      if (bankDetailsRcds[key] !== "") filledFields++;
    }
    for (let key in imageRcds) {
      if (imageRcds[key] !== "") filledFields++;
    }

    ////////////////////////////////////////////

    let invalidTabId = null;

    if (!rcds.empManualCode) {
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }
    if (!rcds.salutation) {
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }
    if (!rcds.empName) {
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }
    if (!personalInfoRcds.gender) {
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }
    if (!personalInfoRcds.religion) {
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }
    if (!personalInfoRcds.maritalStatus) {
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }
    if (!personalInfoRcds.dob) {
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }
    if (!personalInfoRcds.email) {
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }
    if (!personalInfoRcds.mobile) {
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }
    if (!personalInfoRcds.state) {
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }
    if (!otherDetail1Rcds.location) {
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }
    if (!otherDetail1Rcds.ddo) {
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }
    if (!otherDetail1Rcds.department) {
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }
    if (!otherDetail1Rcds.designation) {
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }
    // if (!otherDetail1Rcds.discipline)
    //   newErrors.discipline = "Discipline is required";
    if (!otherDetail1Rcds.dateOfAppointment) {
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }
    if (!otherDetail1Rcds.dateOfJoining) {
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }
    if (!otherDetail1Rcds.fundType) {
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }
    if (!otherDetail1Rcds.budgetHead) {
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }
    if (!otherDetail1Rcds.natureType) {
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }
    if (!otherDetail1Rcds.presentDiscipline) {
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }

    if (!otherDetail2Rcds.salaryBillType) {
      if (invalidTabId == null) {
        invalidTabId = 3;
      }
    }
    // if (!otherDetail2Rcds.class) {
    //   if (invalidTabId == null) {
    //     invalidTabId = 3;
    //   }
    // }

    if (!bankDetailsRcds.paymentMode) {
      if (invalidTabId == null) {
        invalidTabId = 4;
      }
    }
    if (!bankDetailsRcds.vendorCode) {
      if (invalidTabId == null) {
        invalidTabId = 4;
      }
    }

    if (!salaryStructRcds.postingCity) {
      if (invalidTabId == null) {
        invalidTabId = 6;
      }
    }
    if (!salaryStructRcds.designation) {
      if (invalidTabId == null) {
        invalidTabId = 6;
      }
    }
    if (!salaryStructRcds.entryGroup) {
      if (invalidTabId == null) {
        invalidTabId = 6;
      }
    }
    if (!salaryStructRcds.entryPayLevel) {
      if (invalidTabId == null) {
        invalidTabId = 6;
      }
    }
    if (!salaryStructRcds.presentGroup) {
      if (invalidTabId == null) {
        invalidTabId = 6;
      }
    }
    if (!salaryStructRcds.presentPayLevel) {
      if (invalidTabId == null) {
        invalidTabId = 6;
      }
    }
    if (!salaryStructRcds.basic) {
      if (invalidTabId == null) {
        invalidTabId = 6;
      }
    }
    if (!salaryStructRcds.incrementDueDate) {
      if (invalidTabId == null) {
        invalidTabId = 6;
      }
    }

    if (invalidTabId == null) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }

    // Calculate percentage progress
    const progressPercentage = (filledFields / totalFields) * 100;
    setProgress(progressPercentage);
  };

  // useEffect to track any changes in form fields and update progress
  useEffect(() => {
    calculateProgress();
  }, [
    rcds,
    personalInfoRcds,
    otherDetail1Rcds,
    otherDetail2Rcds,
    pfDetailsRcds,
    salaryStructRcds,
    bankDetailsRcds,
    imageRcds,
  ]);

  const [otherRoleData, setOtherRoleData] = useState([]); // tab 3
  const { base64ToFile, fileName } = useBase64ToFile();
  const [errors, setErrors] = useState({
    empManualCode: "",
    salutation: "",
    empName: "",
    postingCity: "",
    designation: "",
    entryGroup: "",
    entryPayLevel: "",
    presentGroup: "",
    presentPayLevel: "",
    paymentMode: "",
    vendorCode: "",
    salaryBillType: "",
    // class: "",
    location: "",
    ddo: "",
    department: "",
    discipline: "",
    dateOfAppointment: "",
    dateOfJoining: "",
    fundType: "",
    budgetHead: "",
    natureType: "",
    presentDiscipline: "",
    gender: "",
    category: "",
    religion: "",
    maritalStatus: "",
    dob: "",
    email: "",
    mobile: "",
    state: "",
  });

  // Validation function
  const validateFields = () => {
    const newErrors = { ...errors };
    let invalidTabId = null;
    if (!rcds.empManualCode) {
      newErrors.empManualCode = "Employee Manual Code is required";
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }
    if (!rcds.salutation) {
      newErrors.salutation = "Salutation is required";
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }
    if (!rcds.empName) {
      newErrors.empName = "Employee Name is required";
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }
    if (!personalInfoRcds.gender) {
      newErrors.gender = "Gender is required";
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }
    if (!personalInfoRcds.religion) {
      newErrors.religion = "Religion is required";
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }
    if (!personalInfoRcds.maritalStatus) {
      newErrors.maritalStatus = "Marital Status is required";
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }
    if (!personalInfoRcds.dob) {
      newErrors.dob = "Date of Birth is required";
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }
    if (!personalInfoRcds.email) {
      newErrors.email = "Email is required";
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }
    if (!personalInfoRcds.mobile) {
      newErrors.mobile = "Mobile No. is required";
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }

    if (!personalInfoRcds.state) {
      newErrors.state = "State is required";
      if (invalidTabId == null) {
        invalidTabId = 0;
      }
    }

    if (!otherDetail1Rcds.location) {
      newErrors.location = "Location is required";
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }
    if (!otherDetail1Rcds.ddo) {
      newErrors.ddo = "DDO is required";
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }
    if (!otherDetail1Rcds.department) {
      newErrors.department = "Department is required";
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }
    if (!otherDetail1Rcds.designation) {
      newErrors.designation = "Designation is required";
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }
    // if (!otherDetail1Rcds.discipline)
    //   newErrors.discipline = "Discipline is required";
    if (!otherDetail1Rcds.dateOfAppointment) {
      newErrors.dateOfAppointment = "Date Of Appointment is required";
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }
    if (!otherDetail1Rcds.dateOfJoining) {
      newErrors.dateOfJoining = "Date Of Joining is required";
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }
    if (!otherDetail1Rcds.fundType) {
      newErrors.fundType = "Fund Type is required";
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }
    if (!otherDetail1Rcds.budgetHead) {
      newErrors.budgetHead = "Budget Head is required";
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }
    if (!otherDetail1Rcds.natureType) {
      newErrors.natureType = "Nature Type is required";
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }
    if (!otherDetail1Rcds.presentDiscipline) {
      newErrors.presentDiscipline = "Present Discipline is required";
      if (invalidTabId == null) {
        invalidTabId = 1;
      }
    }

    if (!otherDetail2Rcds.salaryBillType) {
      newErrors.salaryBillType = "Salary Bill Type is required";
      if (invalidTabId == null) {
        invalidTabId = 3;
      }
    }
    // if (!otherDetail2Rcds.class) {
    //   newErrors.class = "Class is required";
    //   if (invalidTabId == null) {
    //     invalidTabId = 3;
    //   }
    // }


    if (!bankDetailsRcds.paymentMode) {
      newErrors.paymentMode = "Payment Mode is required";
      if (invalidTabId == null) {
        invalidTabId = 4;
      }
    }
    if (!bankDetailsRcds.vendorCode) {
      newErrors.vendorCode = "Vendor Code is required";
      if (invalidTabId == null) {
        invalidTabId = 4;
      }
    }

    if (!salaryStructRcds.postingCity) {
      newErrors.postingCity = "Post City is required";
      if (invalidTabId == null) {
        invalidTabId = 6;
      }
    }
    if (!salaryStructRcds.designation) {
      newErrors.designation = "Designation is required";
      if (invalidTabId == null) {
        invalidTabId = 6;
      }
    }
    if (!salaryStructRcds.entryGroup) {
      newErrors.entryGroup = "Group is required";
      if (invalidTabId == null) {
        invalidTabId = 6;
      }
    }
    if (!salaryStructRcds.entryPayLevel) {
      newErrors.entryPayLevel = "Paylevel is required";
      if (invalidTabId == null) {
        invalidTabId = 6;
      }
    }
    if (!salaryStructRcds.presentGroup) {
      newErrors.presentGroup = "Present Group is required";
      if (invalidTabId == null) {
        invalidTabId = 6;
      }
    }
    if (!salaryStructRcds.presentPayLevel) {
      newErrors.presentPayLevel = "Present Paylevel is required";
      if (invalidTabId == null) {
        invalidTabId = 6;
      }
    }
    if (!salaryStructRcds.basic) {
      newErrors.basic = "Basic is required";
      if (invalidTabId == null) {
        invalidTabId = 6;
      }
    }

    if (invalidTabId != null) {
      setActiveTab(invalidTabId);
    }

    setErrors(newErrors);
    return newErrors;
  };

  const getTabId = (id) => { };

  const handleSaveEmployee = async () => {
    // const fileString = await useConvertFile(imageRcds.image);
    const fileString = await getImageString(imageRcds.image);

    const data = {
      ...rcds,
      ...personalInfoRcds,
      ...otherDetail1Rcds,
      ...otherDetail2Rcds,
      ...bankDetailsRcds,
      ...salaryStructRcds,
      otherRoleDetails: otherRoleData,
      ...pfDetailsRcds,
      image: fileString,
      imageName: imageRcds.imageName,
    };
    console.log("HandleSaveEmployee : ", data);
    
    return data;
  };

  async function getImageString(image) {
    try {
      const fileString = await useConvertFile(image); // Resolve the promise
      return fileString; // Return the string
    } catch (error) {
      console.error("Error converting file:", error);
      return ""; // Return an empty string or handle as needed
    }
  }

  const clearAllFields = () => {
    setRcds({
      empCode: "",
      empManualCode: "",
      fatherName: "",
      salutation: "",
      empName: "",
      employeeId: "",
      publicIp: s_user.publicIp,
      userId: s_user.userId,
    });
    setPersonalInfoRcds({
      gender: "",
      category: "",
      postCategory: "",
      religion: "",
      maritalStatus: "",
      dob: "",
      email: "",
      adharNo: "",
      mobile: "",
      state: "",
    });
    setOtherDetail1Rcds({
      location: "",
      ddo: "",
      department: "",
      departmentHead: "",
      designation: "",
      discipline: "",
      dateOfAppointment: "",
      dateOfJoining: "",
      employeeCode: "",
      isProbation: false,
      lastAppointmentDate: "",
      dateOfRetirement: "",
      fundType: "",
      lastJoiningDate: "",
      budgetHead: "",
      employeeLeftStatus: "",
      natureType: "",
      leavingDate: "",
      presentDiscipline: "",
      leavingRemarks: "",
    });
    setOtherDetail2Rcds({
      reportingTo: "",
      onDeputation: "",
      reportingDirector: "",
      deputedLocation: "",
      isSuspended: "",
      association: "",
      salaryBillType: "",
      isHandicapped: "",
      class: "",
      postingDDO: "",
      ptApplicable: "",
      stopSalary: "",
    });
    setPfDetailsRcds({
      bankCPFGPFNPS: "",
      accountCPFGPFNPS: "",
      balanceCPFGPFNPS: "",
    });
    setSalaryStructRcds({
      cpfType: "",
      postingCity: "",
      designation: otherDetail1Rcds.designation,
      postedDesignation: otherDetail1Rcds.designation,
      entryGroup: "",
      entryPayLevel: "",
      incrementType: "",
      presentGroup: "",
      presentPayLevel: "",
      basic: 0,
      incrementDueDate: "",
    });
    setBankDetailsRcds({
      paymentMode: "",
      accountNumber: "",
      bank: "",
      accountType: "",
      ifsc: "",
      micr: "",
      vendorCode: "N/A",
    });
    setImageRcds({
      imageName: "",
      image: "",
    });
    setOtherRoleData([]);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <PersonalInfo />;
      case 1:
        return <OtherDetails1 />;
      case 2:
        return <OtherRole />;
      case 3:
        return <OtherDetails2 />;
      case 4:
        return <BankDetails />;
      case 5:
        return <PFDetails />;
      case 6:
        return (
          <SalaryStructure
          // handleNext={handleNext}
          />
        );
      // case 7:
      //   return (
      //     <EarningDeductionHead
      //       formData={formData.earningDeductionHead}
      //       updateFormData={(data) => updateFormData("earningDeductionHead", data)}
      //       errors={errors}
      //     />
      //   );
      // case 8:
      //   return (
      //     <ProfilePicture
      //       formData={formData.profilePicture}
      //       updateFormData={(data) => updateFormData("profilePicture", data)}
      //       errors={errors}
      //     />
      //   );
      case 7:
        return <ProfilePicture />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (viewRecordData.length > 0) {
      const data = viewRecordData[0];      
      setRcds({
        empCode: data.empCode,
        empManualCode: data.empManualCode,
        fatherName: data.fatherName,
        salutation: data.salutation,
        empName: data.empName,
        employeeId: data.employeeId,
        publicIp: s_user.publicIp,
        userId: s_user.userId,
      });

      setPersonalInfoRcds({
        gender: data.gender,
        category: data.categoryId,
        postCategory: data.postCategory,
        religion: data.religion,
        maritalStatus: data.maritalStatus,
        dob: data.dob,
        email: data.email,
        adharNo: data.adharNo,
        mobile: data.mobile,
        state: data.stateId,
      });

      setOtherDetail1Rcds({
        location: data.location,
        ddo: data.ddo,
        department: data.department,
        designation: data.designation,
        discipline: data.discipline,
        dateOfAppointment: data.dateOfAppointment,
        dateOfJoining: data.dateOfJoining,
        isProbation: data.isProbation,
        lastAppointmentDate: data.lastAppointmentDate,
        dateOfRetirement: data.dateOfRetirement,
        fundType: data.fundType,
        lastJoiningDate: data.lastJoiningDate,
        budgetHead: data.budgetHead,
        employeeLeftStatus: data.employeeLeftStatus,
        natureType: data.natureTypeId,
        leavingDate: data.leavingDate,
        presentDiscipline: data.presentDiscipline,
        leavingRemarks: data.leavingRemarks,
      });

      setOtherDetail2Rcds({
        reportingTo: data.reportingTo,
        onDeputation: data.onDeputation,
        reportingDirector: data.reportingDirector,
        deputedLocation: data.deputedLocation,
        isSuspended: data.isSuspended,
        association: data.association,
        salaryBillType: data.salaryBillType,
        isHandicapped: data.isHandicapped,
        class: data.class,
        postingDDO: data.postingDDO,
        ptApplicable: data.ptApplicable,
        stopSalary: data.stopSalaryDate && "Y",
      });

      setPfDetailsRcds({
        bankCPFGPFNPS: data.pfBank,
        accountCPFGPFNPS: Number(data.pfAccount),
        balanceCPFGPFNPS: data.pfBalance,
      });
      
      setSalaryStructRcds({
        cpfType: data.pfType,
        postingCity: data.postingCity,
        designation: data.designation,
        postedDesignation: data.designation,
        entryGroup: data.grade,
        entryPayLevel: String(data.paylevel),
        incrementType: data.incrementType,
        presentGroup: data.entryGroup,
        presentPayLevel: String(data.entryPayLevel),
        basic: data.basic,
        incrementDueDate: data.incrementDueDate,
      });

      setBankDetailsRcds({
        paymentMode: data.payMode,
        accountNumber: data.accountNumber,
        bank: data.bank,
        accountType: data.accountType,
        ifsc: data.ifsc,
        micr: data.micr,
        vendorCode: data.vendorCode,
      });
      setOtherRoleData(data.otherRoleDetails ? data.otherRoleDetails : []);
      // Use base64ToFile for profile image
      let file = ""; 
      let fileName = ""; 
      
      if (data.profileImage !== 'N') {
        fileName = data.imageName; 
        file = base64ToFile(data.profileImage, fileName); 
      }
      console.log("File Name: ",fileName);
      
      setImageRcds({
        image: file, 
        imageName: fileName, 
      });            
    }
  }, [viewRecordData]);

  useEffect(() => {
    console.log(otherRoleData, "---------------------otherRoleData");
  }, [otherRoleData]);

  const test = "Testingggg";

  return (
    <EmployeeContext.Provider
      value={{
        test,
        pfDetailsRcds,
        setPfDetailsRcds,
        otherRoleData,
        setOtherRoleData,
        imageRcds,
        setImageRcds,
        rcds,
        setRcds,
        personalInfoRcds,
        setPersonalInfoRcds,
        otherDetail2Rcds,
        setOtherDetail2Rcds,
        otherDetail1Rcds,
        setOtherDetail1Rcds,
        salaryStructRcds,
        setSalaryStructRcds,
        bankDetailsRcds,
        setBankDetailsRcds,
        validateFields,
        errors,
        handleSaveEmployee,
        clearAllFields,
        renderTabContent,
        activeTab,
        setActiveTab,
        progress,
        isValid,
        setIsValid,
        viewRecordData
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

import React, { useState, useEffect, useRef, useContext } from "react";
import "../styles/inputStyle.css";
import FormText from "../components/FormText";
import FormTextarea from "../components/FormTextarea";
import FormButton from "../components/FormButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../styles/AdvancedSearch.css";
import useCheckResponseStatus from "../hooks/useCheckResponseStatus";
import ErrorMessageABD from "../components/ErrorMessageABD";


import {
  getSave,
  getUpdate,
  getDropDown,
  getDataApi
} from "../utils/api";
import icon from "../properties/icon";
import { retrieveFromLocalStorage, retrieveFromCookies, storeInLocalStorage } from "../utils/CryptoUtils";

import Breadcrumbs from "../components/Breadcrumbs";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import { GlobalContext } from "../context/GlobalContextProvider";
import SelectComponent from "../components/SelectComponent";
import DynamicTable from "../components/DynamicTable2";


const AssignWebPageType = () => {


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

  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [showSave, setShowSave] = useState(true);
  const deleteCooldown = useRef(false);
  const [rolesRcds, setRolesRcds] = useState([{ value: "", label: "" },]);
  const [modulesRcds, setModulesRcds] = useState([{ value: "", label: "" },]);
  const[departmentRcds,setdepartmentRcds] =  useState([{ value: "", label: "" },]);
   const[userdepartmentRcds,setUserdepartmentRcds] =  useState([{ value: "", label: "" },]);

  const [errorMessages, setErrorMessages] = useState({
    roleId: "",
    menuId: "",
    collegelocation:"",
    department:"",
    ddo:"",
    userdepartment:"",
    username:"",

  }); // handling error


  const [rcds, setRcds] = useState({
    roleId: "",
    menuId: "",
    collegelocation:"",
    ddo:"",
    userdepartment:"",
    username:"",
    department:"",
    createdBy: "",
    modifiedBy: "",
    userId: "", // Initial value will be updated in useEffect
    publicIp: "", // Initial value will be updated in useEffect
  });

  const [errorVisibleComponent, setErrorMessageVisibleComponent] =useState(false);
  const [errorType, setErrorType] = useState();
  const [errorDivMessage, setErrorDivMessage] = useState("");



  const secretKey = retrieveFromCookies("AESDecKey");
 
  const saveButtonRef = useRef(null); // Reference for the Save button

  const [loading, setLoading] = useState(false); // Loading state
  const { checkResponseStatus } = useCheckResponseStatus();

  const data = {
    rname: "College/Location",
    sHolder: "Select College/Location",
    collegelocation:"collegelocation",
    mname: "DDO",
    rdHolder: "Select DDO",
    ddo:"ddo",
    udName:"User's Department",
    udHolder:"Select Users's Department",
    userdepartment:"userdepartment",
    uName:"User",
    uHolder:"Select User[User Name]",
    username:"username",
    ddName:"Department",
    dHolder:"Select Department",
    department:"department",
    rdName:"Role",
    rHolder:"Select Role",
    roleId: "roleId",
    mdName:"Module",
    mHolder:"Select Module",
    menuId: "menuId",
    save: "Save",
    delete: "Delete",
    update: "Update",
    back: "Back",
    reset: "Reset",
  };
  const handleBack = () => {
    deleteCooldown.current = true;

    setHighlightRow(false); // changes

    // Scroll back to the save button
    if (saveButtonRef.current) {
      saveButtonRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // Alternatively, clear form data and reset state if needed
    setRcds({
      roleId: "",
      menuId: "",
      userId: "",
    });

  };

  const handleReset = () => {
    // Reset rcds to its initial state
    setRcds({
      webPageRightId: rcds.webPageRightId,
      roleId: "",
      menuId: "",
      collegelocation:"",
      ddo:"",
      userdepartment:"",
      username:"",
    });

    setErrorMessages("");
  };

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setRcds((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setErrorMessages((prevMessage) => ({
      ...prevMessage,
      [name]: "",
    }));
  };
  const validate = () => {
    const errors = {};
    if (!rcds.roleId) errors.roleId = "Role Name is required!";
    if (!rcds.menuId) errors.menuId = " Module Name is required!";
    if (!rcds.collegelocation) errors.collegelocation = "College/Location is required!";
    if (!rcds.ddo) errors.ddo = "DDO is required!";
    if (!rcds.userdepartment) errors.userdepartment = "User Department is required!";
    if (!rcds.username) errors.username = " UserName is required!";
    if (!rcds.department) errors.department = " Department is required!";


    return errors;
  };


  const handleCreate = async (evt) => {
    let response;
    setShowSave(false);
    evt.preventDefault(); // Prevent default form submission
    setLoading(true); // Start loading state

    try {
      const errors = validate();
      if (Object.keys(errors).length > 0) {
        setErrorMessages(errors);
        setLoading(false);
        setShowSave(true);
        return;
      }

      // Extract the selected menus from the table data
      const selectedMenus = tableData
        .filter(item => item.selected === '1')  // Only keep items where selected is '1'
        .map(item => item.menuId);  // Extract the menuId of those items
      if (selectedMenus.length === 0) {

        setErrorMessageVisibleComponent(true);
          setErrorType(false);
          setErrorDivMessage("Please select at least one menu.");
          setShowSave(true);
          setTimeout(() => {
            setErrorMessageVisibleComponent(false);
            setErrorDivMessage("");
          }, 4000);
        return;
      }

      const intArray = selectedMenus.map(menu => +menu);

      const userDetId = rcds.roleId.split("~");

      const updatedRcds = {
        username: rcds.username,
        userDetId:userDetId[0],
        menuId: intArray,
        userId: s_user.userId,
        publicIp: s_user.publicIp,
      };

      console.log(updatedRcds, "================+++++++");

      // Encrypt the updated rcds with the userId
      const ciphertext = encAESData(secretKey, updatedRcds);
      console.log("Encrypted Data: ", ciphertext);

      let responseData;

      if (rcds.webPageRightId) {
        // Update the existing record
        response = await getUpdate("user", "assignWebMaster", ciphertext, "user");
        console.log("Update response from backend:", response.data);
        responseData = checkResponseStatus(response, "user");
      } else {
        // Save the new record
        response = await getSave("user", "assignWebMaster", ciphertext, "user");
        console.log("Response from backend:", response.data);
        responseData = checkResponseStatus(response, "user");
      }

      console.log(responseData, "response");

      if (responseData.rType) {
        const jsonData = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, jsonData);
        console.log("Decrypted Data:", decryptedData);

        // Check if the operation was successful
        if (responseData.rType === "Y") {
          // Clear the form fields by resetting rcds to its initial state
          setErrorMessageVisibleComponent(true);
          setErrorType(true);
          setErrorDivMessage(responseData.rMessage);
          setShowSave(true);
          setTimeout(() => {
            setErrorMessageVisibleComponent(false);
            setErrorDivMessage("");
          }, 4000);


          setRcds({
            // Replace with your initial state for rcds
            webPageRightId: null,
            roleId: "",
            menuId: "",
            userId: rcds.userId,
            publicIp: rcds.publicIp,
          });
          setTableData([]);
          setIsOpen(false);
          
        } else {
          setErrorMessageVisibleComponent(true);
          setErrorType(true);
          setErrorDivMessage(responseData.rMessage);
        }
      } else {
        setErrorMessageVisibleComponent(true);
        setErrorDivMessage(responseData.rMessage);

        setShowSave(true);
        setTimeout(() => {
          setErrorMessageVisibleComponent(false);
          setErrorDivMessage("");
        }, 4000);
      }
    } catch (error) {
      console.error("Error during create/update:", error);
      setErrorMessageVisibleComponent(true);
      setErrorType(false);
      setErrorDivMessage(response.data.rMessage);
    } finally {
      setLoading(false);
      setHighlightRow(false); // changes
    }
  };

  const getListData = async () => {
    try {

      const query =
        `select x.menu_id,x.cnt, t.menu_prompt from (  select menu_id,sum(cnt) as cnt  from (   select menu_id, cnt from
 ( SELECT t1.menu_id,0 as cnt FROM TREE_MENU AS T1  LEFT JOIN TREE_MENU AS t2 on t1.parent_id = t2.menu_id  LEFT JOIN TREE_MENU AS t3
 on t2.parent_id = t3.menu_id  LEFT JOIN TREE_MENU AS t4 on t3.parent_id = t4.menu_id  
 where t3.menu_id=${rcds.menuId}
  and t1.jsp_file is not null union 
 SELECT t1.menu_id,0 as cnt FROM TREE_MENU AS T1 LEFT JOIN TREE_MENU AS t2 on t1.parent_id = t2.menu_id LEFT JOIN TREE_MENU AS t3 
 on t2.parent_id = t3.menu_id LEFT JOIN TREE_MENU AS t4 on t3.parent_id = t4.menu_id 
 where t4.menu_id=${rcds.menuId} ) y union 
 select page_id as menu_id, 1 as cnt from capabilities where 
 role_id='${rcds.roleId}'
 and page_id in (select menu_id from tree_menu  where module = (select distinct module from tree_menu where
  parent_id=${rcds.menuId})))z  
 group by menu_id)x, tree_menu t where x.menu_id = t.menu_id`;


      const ciphertext = encAESData(secretKey, { query });

      const response = await getDataApi("commonData", null, ciphertext);

      const responseData = checkResponseStatus(response);

      if (responseData.rData) {
        const recJson = JSON.parse(responseData.rData);
        const decryptedData = decAESData(secretKey, recJson);

        setTableData(decryptedData.recData.map((item, index) => {
          return {
            serialNo: index + 1,
            menuId: item[0], // First element in the item (menuId)
            selected: item[1], // Second element in the item (selected)
            menu: item[2], // Third element in the item (menu)
          };
        }));

        setIsOpen(true);

      } else {
        console.error("encryptData is undefined in the backend response.");
      }


    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  };

  const rolesQuery = {
    table: "roles",
    fields: "role_id,role_name",
    condition: "1=1",
    orderBy: " ",
  }
  const modulesQuery = {
    table: "tree_menu",
    fields: "menu_id,menu_prompt",
    condition: "1=1 and PARENT_ID=0",
    orderBy: " ",
  }

  const  UserDepartmentQuery={
    table: "department_mast",
    fields: "DEPT_ID,DEPARTMENT",
    condition: "1=1",
    orderBy: " ",
  }


  const  departmentQuery={
    table: "user_detail ud",
    fields: "distinct ud.department,(select Department from department_mast where dept_id=ud.department)",
    condition: `1=1 and ud.is_active='Y' and  ud.user_id='${rcds.username}'`,
    orderBy: " ",
  }



  const getDropDownRolesData = async () => {
    getDropDown(rolesQuery, rolesRcds, setRolesRcds, "common", secretKey);
  };
  const getDropDownModulesData = async () => {
    getDropDown(modulesQuery, modulesRcds, setModulesRcds, "common", secretKey);
  };

  const getDropDownUserDepartmentQuery =async()=>{
    getDropDown(UserDepartmentQuery,userdepartmentRcds,setUserdepartmentRcds,"common",secretKey);
  };
  const getDropDownDepartmentQuery =async()=>{
    getDropDown(departmentQuery,departmentRcds,setdepartmentRcds,"common",secretKey);
  };


  useEffect(() => {
    getDropDownRolesData();
    getDropDownModulesData();
    getDropDownUserDepartmentQuery();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (rcds.menuId !== "" && rcds.roleId !== "") {
      getListData(rcds.roleId, rcds.menuId);
    }
  }, [rcds.menuId, rcds.roleId]); // Run this effect when menuId or roleId changes

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
      fields: "DISTINCT ddo.ddo_id, ddo.DDONAME",
      condition: `dlm.LOCATION_CODE='${rcds.collegelocation}'`,
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
  

    useEffect(() => {
      getDDODropDownData();
    }, [rcds.collegelocation]);

    const [userRcds, setUserRcds] = useState([{ value: "", label: "" }]);
  
    const userQuery = {
      table: "user_detail d ,user_mast m  ",
      fields: "distinct m.id,m.USER_NAME",
      condition: `d.user_id=m.id and d.ddo='${rcds.ddo}' and d.location='${rcds.collegelocation}' and d.department='${rcds.userdepartment}' and m.USER_ACTIVE_STATUS='Y' and d.is_active='Y' and IS_REQ_DEFAULT_ROLE='Y'`,
      orderBy: "",
    };
  
    const getUserDropDownData = async () => {
      console.log(DDOQuery);
      try {
        getDropDown(userQuery,userRcds, setUserRcds, "common", secretKey);
      } catch {
        // console.log(error);
      }
    };

    
    const [roleRcds, setRoleRcds] = useState([{ value: "", label: "" }]);
  
    const roleQuery = {
      table: "user_detail ud",
      fields: "concat(ud.user_det_id,'~',ud.role_id),(select role_name from roles where role_id=ud.role_id)",
      condition: `ud.is_active='Y' and ud.department='${rcds.department}' and ud.user_id='${rcds.username}'`,
      orderBy: "",
    };
  
    const getRoleDropDownData = async () => {
      console.log(DDOQuery);
      try {
        getDropDown(roleQuery,roleRcds, setRoleRcds, "common", secretKey);
      } catch {
        // console.log(error);
      }
    };
  

    useEffect(() => {
      getDDODropDownData();
    }, [rcds.collegelocation]);

    useEffect(() => {
      if(rcds.collegelocation != "" && rcds.collegelocation != null && rcds.ddo != "" 
        && rcds.ddo != null && rcds.userdepartment != "" && rcds.userdepartment != null){
          getUserDropDownData();
        }
    }, [rcds.collegelocation, rcds.userdepartment,rcds.ddo]);

    useEffect(() => {
      if(rcds.collegelocation != "" && rcds.collegelocation != null && rcds.ddo != "" 
        && rcds.ddo != null && rcds.userdepartment != "" && rcds.userdepartment != null
        && rcds.username != "" && rcds.username != null){
          
          getDropDownDepartmentQuery();
        }
    }, [rcds.collegelocation, rcds.userdepartment,rcds.ddo,rcds.username]);

    useEffect(() => {
      if(rcds.collegelocation != "" && rcds.collegelocation != null && rcds.ddo != "" 
        && rcds.ddo != null && rcds.department != "" && rcds.department != null 
        && rcds.userdepartment != "" && rcds.userdepartment != null
        && rcds.username != "" && rcds.username != null){
          
          getRoleDropDownData();
        }
    }, [rcds.collegelocation, rcds.userdepartment,rcds.ddo,rcds.department,rcds.username]);


  const dynamicTableData = {
    headers: ["S.No.", "Menu", "Action"],
    rows: tableData.map((item, sno) => ({


      id: sno + 1,
      one: item.menu,
      two: (
        <input
          type="checkbox"
          checked={item.selected === '1'} // Use '1' to check and '0' for unchecked
          onChange={() => {
            const updatedData = tableData.map((row) =>
              row.serialNo === item.serialNo
                ? { ...row, selected: item.selected === '1' ? '0' : '1' } // Toggle between '0' and '1'
                : row
            );
            setTableData(updatedData);
            // console.log("Checkbox changed for serialNo:", item.serialNo, "New selected value:", item.selected === '1' ? '0' : '1');
          }}
          style={{ cursor: "pointer" }}
        />
      ),

    })),
  }

  ///////////////////////////////////*************shortcuts**********////////////////////////////////////////////////////////

  useKeyboardShortcut(
    "S",
    (e) => { // Pass the event to the callback
      handleCreate(e); // Now `e` is available here
    },
    { ctrl: true }
  );


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
                      label={data.rname}
                      name={data.collegelocation}
                      holder={data.sHolder}
                      selectedValue={rcds.collegelocation}
                      options={locationRcds}
                      errorMessage={errorMessages.collegelocation}
                      onChange={handleChange}
                      icon={icon.star}
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          collegelocation: value,
                        }))
                      }
                    />
                  </div>


                  <div className="col-md-6">
                    <SelectComponent
                      holder={data.rdHolder}
                      name={data.ddo}
                      selectedValue={rcds.ddo}
                      options={DDORcds}
                      onChange={handleChange}
                      errorMessage={errorMessages.ddo}
                      label={data.mname}
                      icon={icon.star}
                      onSelects={(value) =>
                        setRcds((prevState) => ({
                          ...prevState,
                          ddo: value,
                        }))
                      }
                    />
                  </div>


                </div>


                <div className="row mb-3">

<div className="col-md-6">
  <SelectComponent
    label={data.udName}
    name={data.userdepartment}
    holder={data.udHolder}
    selectedValue={rcds.userdepartment}
    options={userdepartmentRcds}
    errorMessage={errorMessages.userdepartment}
    onChange={handleChange}
    icon={icon.star}
    onSelects={(value) =>
      setRcds((prevState) => ({
        ...prevState,
        userdepartment: value,
      }))
    }
  />
</div>


<div className="col-md-6">
  <SelectComponent
    holder={data.uHolder}
    name={data.username}
    selectedValue={rcds.username}
    options={userRcds}
    onChange={handleChange}
    errorMessage={errorMessages.username}
    label={data.uName}
    icon={icon.star}
    onSelects={(value) =>
      setRcds((prevState) => ({
        ...prevState,
        username: value,
      }))
    }
  />
</div>


</div>

<div className="row mb-3">

<div className="col-md-6">
  <SelectComponent
    label={data.ddName}
    name={data.department}
    holder={data.dHolder}
    selectedValue={rcds.department}
    options={departmentRcds}
    errorMessage={errorMessages.department}
    onChange={handleChange}
    icon={icon.star}
    onSelects={(value) =>
      setRcds((prevState) => ({
        ...prevState,
        department: value,
      }))
    }
  />
  </div>

<div className="col-md-6">

<SelectComponent
    holder={data.rHolder}
    name={data.roleId}
    selectedValue={rcds.roleId}
    options={roleRcds}
    onChange={handleChange}
    errorMessage={errorMessages.roleId}
    label={data.rdName}
    icon={icon.star}
    onSelects={(value) =>
      setRcds((prevState) => ({
        ...prevState,
        roleId: value,
      }))
    }
  />

  </div>

</div>


<div className="col-md-6">
<SelectComponent
    label={data.mdName}
    name={data.menuId}
    holder={data.mHolder}
    selectedValue={rcds.menuId}
    options={modulesRcds} 
    errorMessage={errorMessages.menuId}
    onChange={handleChange}
    icon={icon.star}
    onSelects={(value) =>
      setRcds((prevState) => ({
        ...prevState,
        menuId: value,
      }))
    }
  />
</div>





<div className="ag-theme-alpine">

  {modalIsOpen &&
    <DynamicTable
      data={dynamicTableData}
    />
  }

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
                        showUpdate={!!rcds.webPageRightId}
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
          <div className="d-flex justify-content-center align-items-center my-4">
            <ErrorMessageABD
              text={errorDivMessage}
              isSuccess={errorType}
              isVisible={errorVisibleComponent}
              setVisible={setErrorMessageVisibleComponent} // Pass the function to reset visibility
            />
          </div>
        )}
        {/* <div className="container-body mx-3 mb-3">


          <div className="ag-theme-alpine">

            {modalIsOpen &&
              <DynamicTable
                data={dynamicTableData}
              />
            }

          </div>
        </div> */}
      </div>
    </>
  );
};

export default AssignWebPageType;


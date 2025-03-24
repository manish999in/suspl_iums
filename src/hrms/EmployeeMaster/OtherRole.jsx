// Developer : Tushar Rajput

import React, { useEffect, useState, useRef, useContext } from "react";
import Breadcrumbs from "../../components/Breadcrumbs"
import FormText from "../../components/FormText"
import icon from "../../properties/icon"
import FormButton from "../../components/FormButton";
import DynamicTable from "../../components/DynamicTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AgGridTable from "../../components/AgGridTable";
import ErrorMessageABD from "../../components/ErrorMessageABD";
import useCheckResponseStatus from "../../hooks/useCheckResponseStatus";
import { error } from "jquery";
import { retrieveFromCookies, retrieveFromLocalStorage } from "../../utils/CryptoUtils";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { GlobalContext } from "../../context/GlobalContextProvider";

import { getDelete, getDropDown, getList, getSave, getUpdate, getViewRecord } from "../../utils/api";
import SelectComponent from "../../components/SelectComponent";
import { EmployeeContext } from "../../context/EmployeeMaster/EmployeeMasterContext";


const OtherRole = () => {

  const { otherRoleData, setOtherRoleData } = useContext(EmployeeContext);

  const deleteCooldown = useRef(false);
  const deleteCooldownForDetailGrid = useRef(false);

  const [errorVisibleComponent, setErrorMessageVisibleComponent] = useState(false);

  const [locationRcds, setLocationRcds] = useState([
    { value: "", label: "" },
  ])

  const [detailRcds, setDetailRcds] = useState({
    roleId: "",
    locationId: "",
    ddoId: "",
    departmentId: "",
    designationId: "",
    assignDateId: "",
    releaseDateId: "",
  })

  const [errorMessages, setErrorMessages] = useState({
    departHeadId: "",
    headName: "",
    location: "",
    ddo: "",
    departmentAlias: "",
    departmentId: "",
  });
  const {
    columnDefsApi,
    setTableHeader,
    setHighlightRow,
  } = useContext(GlobalContext);


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

    designationName: "designation",
    designationLabel: "Designation",
    designationHolder: "Select Designation",

    assignDateName: "assignDateId",
    assignDateLabel: "Assign Date",
    assignDateHolder: "Select Assignment Date",

    releaseDateName: "releaseDateId",
    releaseDateLabel: "Release Date",
    releaseDateHolder: "Select Release Date",
  };

  const validateGradeDetails = () => {
    const errors = {};
    if (!detailRcds.designationId) errors.designationId = "Designation Name is required.";
    if (!detailRcds.locationId) errors.locationId = "Location is required.";
    if (!detailRcds.ddoId) errors.ddoId = "Ddo is required.";
    if (!detailRcds.departmentId) errors.departmentId = "Department is required.";
    if (!detailRcds.releaseDateId) errors.releaseDateId = "Release Date is required.";
    if (!detailRcds.assignDateId) errors.assignDateId = "Assign Date is required.";
    return errors;
  }

  const secretKey = retrieveFromCookies("AESDecKey");

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setDetailRcds((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setDetailRcds((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setErrorMessages((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const addMoreGroupDetails = (evt) => {
    evt.preventDefault();
    const errors = validateGradeDetails();
    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      return;
    }

    const combinationExists = otherRoleData.some((item) => item.designationId === detailRcds.designationId && item.departmentId === detailRcds.departmentId && item.locationId === detailRcds.locationId);
    if (combinationExists) {

      setErrorMessageVisibleComponent(true);
      setErrorMessageVisibleComponent(true);
      return;
    }

    let departLabel = "";
    departmentRcds.filter((department) => {
      return department.value === detailRcds.departmentId;
    }).map((departmentdf) => {
      departLabel = departmentdf.label;
    });

    let locationLabel = "";
    locationRcds.filter((location) => {
      return location.value === detailRcds.locationId;
    }).map((departmentdf) => {
      locationLabel = departmentdf.label;
    });


    let designationLabel = "";
    designationRcds.filter((designation) => {
      return designation.value === detailRcds.designationId;
    }).map((departmentdf) => {
      designationLabel = departmentdf.label;
    });

    let ddoLabel = "";
    DDORcds.filter((ddo) => {
      return ddo.value === detailRcds.ddoId;
    }).map((departmentdf) => {
      ddoLabel = departmentdf.label;
    });

    setOtherRoleData((prevData) => [
      ...prevData,
      {
        id: prevData.length + 1,
        locationId: detailRcds.locationId,
        ddoLabel: ddoLabel,
        departmentId: detailRcds.departmentId,
        locationLabel: locationLabel,
        designationId: detailRcds.designationId,
        designationLabel: designationLabel,
        ddoId: detailRcds.ddoId,
        departLabel: departLabel,
        releaseDate: detailRcds.releaseDateId,
        assignDate: detailRcds.assignDateId,
      },
    ]);
    setDetailRcds({
      locationId: "",
      ddoId: "",
      departmentId: "",
      designationId: "",
      assignDateId: "",
      releaseDateId: "",
    })
  };

  const deleteGroupRecord = ({ id }) => {
    const updatedData = otherRoleData.filter((_, index) => index !== id - 1);
    setOtherRoleData(updatedData);
  };

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
      console.log(error);
    }
  };

  const [DDORcds, setDDORcds] = useState([{ value: "", label: "" }]);

  const getDDODropDownData = async (location) => {
    if (!location) return;
    const DDOQuery = {
      table: "ddo left join ddolocationmapping dlm on ddo.ddo_id = dlm.DDO_ID",
      fields: "DISTINCT ddo.ddo_id, ddo.DDONAME",
      condition: `dlm.LOCATION_CODE='${detailRcds.locationId}'`,
      orderBy: "",
    };

    try {
      getDropDown(DDOQuery, DDORcds, setDDORcds, "common", secretKey);
    } catch {
      console.log(error);
    }
  };

  useEffect(() => {
    getDDODropDownData(detailRcds.locationId);
  }, [detailRcds.locationId])

  const [designationRcds, setdesignationRcds] = useState([
    { value: "", label: "" },
  ]);

  const designationDropdown = {
    table:
      "designation_mast",
    fields: "designation_id,designation",
    condition: `1=1`,
    orderBy: "",
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

  const [departmentRcds, setDepartmentRcds] = useState([
    { value: "", label: "" },
  ]);
  const demparmentDropdown = {
    table:
      "department_mast",
    fields: "dept_id,department",
    condition: `1=1`,
    orderBy: " ",
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

  useEffect(() => {
    getLocationDropDownData();
    getDesignationDropdown();
    getDepartmentDropdownData();
  }, []);




  const dynamicTableData = {
    headers: ["SNo.", "Location", "DDO", "Department", "Designation", "Assign Date", "Release Date", "Delete"],
    rows: otherRoleData.map((item, sno) => ({
      id: sno + 1,
      one: item.locationLabel,
      two: item.ddoLabel,
      three: item.departLabel,
      four: item.designationLabel,
      five: item.assignDate,
      six: item.releaseDate,
      seven: (
        <span
          className={`manipulation-icon delete-color ${deleteCooldownForDetailGrid.current ? "disabled" : ""}`}
          onClick={() => {
            if (!deleteCooldownForDetailGrid.current) {
              const id = { id: sno + 1 };
              deleteGroupRecord(id);
            }
          }}
          style={{
            pointerEvents: deleteCooldownForDetailGrid.current ? "none" : "auto",
            opacity: deleteCooldownForDetailGrid.current ? 0.5 : 1,
          }}
        >
          <FontAwesomeIcon icon={faTrash} />
          <span className="manipulation-text"> Delete </span>
        </span>
      ),
    })),
  };


  const columnDefs = [
    {
      headerName: 'Serial No.',
      field: 'serialNo',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 100,
      headerClass: 'ag-header-cell',
    },
    ...columnDefsApi,
    {
      headerName: 'Action',
      field: 'button',
      cellRenderer: (params) => (
        <>
          <span
            className="manipulation-icon edit-color mx-3"
            onClick={() => {
              setHighlightRow(true);
              const id = params.data.departHeadId;
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <FontAwesomeIcon icon={faEdit} className="icon-size" />
          </span>

          <span

            className={`manipulation-icon delete-color ${deleteCooldown.current ? "disabled" : ""
              } mx-1`}
            onClick={() => {
              if (!deleteCooldown.current) {

                const confirmDelete = window.confirm(
                  "Are you sure you want to delete this record?"
                );
                if (confirmDelete) {
                  if (!deleteCooldown.current) {
                    setHighlightRow(true);
                    const id = params.data.departHeadId;
                    handleDelete(id);
                  }
                }
              }
            }}
            style={{
              pointerEvents: deleteCooldown.current ? "none" : "auto",
              opacity: deleteCooldown.current ? 0.5 : 1,
              cursor: deleteCooldown.current ? "not-allowed" : "pointer",
            }}
          >
            <FontAwesomeIcon icon={faTrash} className="icon-size" />
          </span>

        </>
      ),
      sortable: false,
      filter: false,
      cellClass: 'ag-center-cols-cell',
      width: 100,
    }
  ];

  useEffect(() => {
    if (columnDefsApi && columnDefsApi.length > 0) {
      setTableHeader(columnDefs);
    }
  }, [columnDefsApi]);



  ///////////////////////////////////********Code for add remove headers********/////////////////////////////////////////////////////


  return (
    <>
      <div className="rightArea">


        <div className="container-body mx-3 mb-2">
          <form >
            <div className="row mb-1">
              <h5 className="text-center ">Other Role</h5>
            </div>
            {/* 
            <div className="card">
              <div className="card-body"> */}
            <div className="row mb-3">
              <div className="col-md-6">
                <SelectComponent
                  label={data.locationLabel}
                  name={data.locationName}
                  selectedValue={detailRcds.locationId}
                  options={locationRcds}
                  onChange={handleChange}
                  onSelects={(value) => {
                    setDetailRcds((prevState) => ({
                      ...prevState,
                      locationId: value
                    }));
                  }}
                  icon={icon.star}
                />
              </div>
              <div className="col-md-6">
                <SelectComponent
                  label={data.ddoLabel}
                  name={data.ddoName}
                  selectedValue={detailRcds.ddoId}
                  options={DDORcds}
                  onChange={handleChange}
                  onSelects={(value) => {
                    setDetailRcds((prevState) => ({
                      ...prevState,
                      ddoId: value
                    }));
                  }}
                  icon={icon.star}
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <SelectComponent
                  label={data.departmentLabel}
                  name={data.departmentName}
                  selectedValue={detailRcds.departmentId}
                  options={departmentRcds}
                  errorMessage={errorMessages.departmentId}
                  onChange={handleChange}
                  onSelects={(value) => {
                    setDetailRcds((prevState) => ({
                      ...prevState,
                      departmentId: value
                    }));
                  }}
                  icon={icon.star}
                />
                {errorMessages.departmentId && (
                  <div className="error-message">{errorMessages.departmentId}</div>
                )}
              </div>

              <div className="col-md-6">
                <SelectComponent
                  label={data.designationLabel}
                  name={data.designationName}
                  selectedValue={detailRcds.designationId}
                  options={designationRcds}
                  errorMessage={errorMessages.designationId}
                  onChange={handleChange}
                  onSelects={(value) => {
                    setDetailRcds((prevState) => ({
                      ...prevState,
                      designationId: value
                    }));
                  }}
                  icon={icon.star}
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <FormText
                  label={data.assignDateLabel}
                  name={data.assignDateName}
                  type="Date"
                  holder={data.assignDateHolder}
                  value={detailRcds.assignDateId}
                  errorMessage={errorMessages.assignDateId}
                  onChange={handleChange}
                  icon={icon.user}
                  Maxlength={25}
                />
              </div>
              <div className="col-md-6">
                <FormText
                  label={data.releaseDateLabel}
                  name={data.releaseDateName}
                  type="Date"
                  holder={data.releaseDateHolder}
                  value={detailRcds.releaseDateId}
                  errorMessage={errorMessages.releaseDateId}
                  onChange={handleChange}
                  icon={icon.user}
                  Maxlength={25}
                />
              </div>
            </div>

            <div className="col-md-12 text-center mt-2">
              <button
                type="submit"
                className="btn btn-primary btn-color  btn-sm"
                onClick={detailRcds.roleId ? handleUpdateGroup : addMoreGroupDetails}>
                {detailRcds.roleId ? "Modify" : "Add New"}
              </button>
            </div>
            {/* </div>
            </div> */}

            <div className="row mb-3">
              <div className="col-md-12">
                <DynamicTable data={dynamicTableData} />
              </div>
            </div>
          </form>

        </div>
        {errorVisibleComponent && (
          <div className="d-flex justify-content-center align-items-center text-danger mt-3">
            <div className="fs-4 fw-bold">
              Role Already Exists

            </div>

          </div>
        )}
      </div>
    </>
  )
}
export default OtherRole

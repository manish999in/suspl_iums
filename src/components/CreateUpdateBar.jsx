
import React from "react";
import "../styles/CreatedUpdatedBar.css"; // For styling if you want to move styles out of the component

const CreateUpdateBar = ({preparedData,modifiedData}) => {

  return (
    <div className="page-container">
      <div className="innerLEftToRight left0011">
        <div className="pageInnetChild">Prepared By & Date</div>
        <div className="pageInnetChild001134">{preparedData}</div>
      </div>
      
      <div 
      className="innerLEftToRight right0011">
        <div className="pageInnetChild">Modified By & Date</div>
        <div className="pageInnetChild001134">{modifiedData}</div>
      </div>
    </div>
  );
};

export default CreateUpdateBar;



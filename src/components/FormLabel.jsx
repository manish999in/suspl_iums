import React from "react";
import '../styles/inputStyle.css'
 
const FormLabel = ({labelNames}) => {
 
  return(
      <>
         <label className="text-left customFont" >{labelNames} </label>
      </>
  )
}
 
export default FormLabel
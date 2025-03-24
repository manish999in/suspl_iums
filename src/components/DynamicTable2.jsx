import React, { useState } from "react";
import "../styles/DynamicTable.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

// const DynamicTable = ({ data }) => {
//   const [searchTerm, setSearchTerm] = useState("");

//   // Filter rows based on the search term
//   const filteredRows = data.rows.filter((row) => {
//     return Object.values(row).some((value) =>
//       value.toString().toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   });

//   return (
//     <div className="table-responsive">
//       {/* Modern Search Bar */}
//       {/* <div className="modern-search-container">
//         <input
//           type="text"
//           placeholder="Search..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="modern-search-input"
//         />
//         <button className="modern-search-button">
//           <FontAwesomeIcon icon={faSearch} />
//         </button>
//       </div> */}

//       {/* Table with Data */}
//       <table className="table table-bordered table-striped table-hover">
//         <thead className="dynamicTableHeader">
//           <tr className="dynamicTableHeader">
//             {data.headers.map((header, index) => (
//               <th scope="col" key={index}>
//                 {header}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {filteredRows.length > 0 ? (
//             filteredRows.map((row) => (
//               <tr key={row.id}>
//                 {Object.keys(row).map((key) => (
//                   <td key={key}>{row[key]}</td>
//                 ))}
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={data.headers.length} className="text-center">
//                 No results found
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default DynamicTable;

const DynamicTable = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Check if data and data.rows exist before trying to filter
  const filteredRows = (data && data.rows)
    ? data.rows.filter((row) => {
        return Object.values(row).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : [];

  return (
    <div className="table-responsive">


      {/* Table with Data */}
      <table className="table table-bordered table-striped table-hover">
        <thead className="dynamicTableHeader">
          <tr className="dynamicTableHeader">
            {data && data.headers && data.headers.map((header, index) => (
              <th scope="col" key={index}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredRows.length > 0 ? (
            filteredRows.map((row) => (
              <tr key={row.id}>
                {Object.keys(row).map((key) => (
                  <td   key={key}>{row[key]}</td>    //className="text-center"
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={data && data.headers ? data.headers.length : 0} className="text-center">
                No results found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTable;

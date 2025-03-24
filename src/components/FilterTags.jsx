import React, { useState } from 'react';

const FilterTags = ({ columnDefs, columnDefsApi, setTableHeader ,selectedValues, setSelectedValues}) => {

  // Function to remove a tag
  const removeTag = (tag) => {
    const updatedSelectedValues = [...selectedValues, tag.headerName];
    setSelectedValues(updatedSelectedValues);

    // Update the table header based on the new selected values
    const newTableHeader = columnDefs.filter(
      (column) => !updatedSelectedValues.includes(column.headerName)
    );
    setTableHeader(newTableHeader);
  };

  // Function to refresh tags and reset the table header
  const refreshTags = () => {
    setSelectedValues([]); // Clear the selected values
    setTableHeader(columnDefs); // Restore the original table headers
  };

  return (
    <div className="container">
      <div className="d-flex flex-wrap gap-2 mb-4">
        {columnDefsApi
          .filter((column) => !selectedValues.includes(column.headerName)) // Exclude removed columns
          .map((column, index) => (
            <div
              key={index}
              className="d-flex align-items-center p-2 border rounded bg-light"
            >
              <span>{column.headerName}</span>
              <button
                onClick={() => removeTag(column)}
                className="btn text-danger p-0 ms-2"
              >
                ✕ 
              </button>
            </div>
          ))}
      </div>
      <div className="d-flex justify-content-center">
        <button
          onClick={refreshTags}
          className="btn btn-primary"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default FilterTags;

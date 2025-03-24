import React, { useEffect, useRef, useState, useContext } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css"; // Importing AG Grid styles
import { jsPDF } from "jspdf"; // Import jsPDF
import "jspdf-autotable"; // Import AutoTable plugin for jsPDF
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx"; // For Excel export
import hlogo from "../../public/img/h-logo.png"; // Path to your logo image
import config from "../properties/config";
import { GlobalContext } from "../context/GlobalContextProvider";

const AgGridTable = ({
  columnDefs,
  rowData,
  hardRefreshFlag,
  setrefreshAGGrid,
  highlightRow,
}) => {
  const gridApiRef = useRef(null); // Reference to store grid API

  // Generate PDF header with dynamic content
  function generateHeader(doc, headerName, isFinancialYear, financialYear) {
    const margin = 10; // Margin for the content

    // Ensure hlogo is valid
    if (hlogo) {
      doc.addImage(hlogo, "PNG", margin, margin, 60, 70); // X, Y, Width, Height
    }

    // Set fonts (using standard jsPDF fonts or custom ones)
    doc.setFont("helvetica", "normal");

    // Ensure config.welcomeHeader is a string
    const welcomeHeaderText = config.welcomeHeader || "Welcome to the Report";
    doc.setFontSize(18);
    doc.text(welcomeHeaderText, 80, margin + 20, { align: "center" });

    // Ensure config.companyAddress1 and config.companyAddress2 are strings
    const companyAddressText =
      (config.companyAddress1 || "") + ", " + (config.companyAddress2 || "");
    doc.setFontSize(12);
    doc.text(companyAddressText, 80, margin + 40, { align: "center" });

    // Ensure headerName is a valid string
    doc.setFontSize(16);
    doc.text(headerName || "Report Header", 80, margin + 60, {
      align: "center",
    });

    // Date and Time
    const currentDateTime = new Date().toLocaleString(); // Format current date and time
    doc.setFontSize(12);
    doc.text(config.dateTimeLabel + currentDateTime, 160, margin + 80, {
      align: "right",
    });

    // Financial Year (Optional)
    if (isFinancialYear && financialYear) {
      doc.text(config.financialYearLabel + financialYear, 160, margin + 100, {
        align: "right",
      });
    }

    // Return the document for further use or saving
    return doc;
  }

  // Export to PDF function using jsPDF (excluding the last two rows)
  const onExportPdf = () => {
    const doc = new jsPDF();

    // Format the column names and row data (exclude the last column)
    const headers = columnDefs.map((colDef) => colDef.headerName).slice(0, -1);
    const rows = rowData.map((row) => Object.values(row).slice(0, -1)); // Exclude last column from data

    const headerName = "Invoice Report"; // Example header name
    const isFinancialYear = true;
    const financialYear = "2023-2024"; // Example financial year

    generateHeader(doc, headerName, isFinancialYear, financialYear);

    // Add the table to the PDF using jsPDF AutoTable
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 50, // Starting Y position after logo and text
      margin: { top: 20 },
      theme: "striped", // Optional: Can use 'grid', 'striped', or 'plain' for table theme
    });

    // Save the PDF with a custom filename
    doc.save("export.pdf");
  };

  // Excel Export function
  const fileExport = () => {
    // Exclude the last two columns from the data and headers
    const headers = columnDefs.map((colDef) => colDef.headerName).slice(0, -1); // Remove last two columns from headers
    const dataRows = rowData.map((row) => Object.values(row).slice(0, -1)); // Exclude last column from rows

    // Create the Excel file using XLSX
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "users");
    XLSX.writeFile(wb, "users_table.xlsx");
  };

  // // Function to resize columns when the window is resized
  // for resizing grid on display size change {creates issue when resizing display auto matically changes the width}
  // const onGridSizeChanged = (params) => {
  //   params.api.sizeColumnsToFit();
  // };

  // Optional: Initial column resize when grid is loaded
  useEffect(() => {
    const gridOptions = window.gridOptions;
    if (gridOptions?.api) {
      gridOptions.api.sizeColumnsToFit();
    }
  }, []);

  const gridOptions = {
    columnDefs: columnDefs,
    rowClassRules: {
      "odd-row": (params) => params.node.rowIndex % 2 !== 0, // Apply 'odd-row' class to odd rows
    },
    getContextMenuItems: (params) => [ // enterprise feature not in use yet
      'copy',
      'paste',
      'separator',
      'pinSubMenu',
      'expandAll',
      'collapseAll'
    ]
  };


  const onGridReady = (params) => {
    gridApiRef.current = params.api; // Store grid API
    params.api.sizeColumnsToFit(); // This will resize columns to fit within the container width
  };

  const [gridKey, setGridKey] = useState(0);

  const handleHardRefresh = () => {
    setGridKey((prevKey) => prevKey + 1); // Trigger re-render by changing the key
  };

  useEffect(() => {
    if (hardRefreshFlag) {
      handleHardRefresh();
      setrefreshAGGrid(false);
    }
  }, [hardRefreshFlag]);

  const [selectedRowId, setSelectedRowId] = useState(null); // Track selected row ID


  const onRowClick = (event) => {
    const rowId = event.node.id;

    // // If highlightRow is true, only highlight the row that was clicked
    // if (highlightRow) {
    //   // If the clicked row is not already selected, select it
    //   if (selectedRowId !== rowId) {
    //     event.api.deselectAll();  // Deselect any previously selected rows
    //     event.node.setSelected(true);  // Highlight the clicked row
    //     setSelectedRowId(rowId);  // Set the new selected row ID
    //   }
    // } else {
    //   event.api.deselectAll();  // Deselect all rows if highlightRow is false
    //   setSelectedRowId(null);  // Reset the selected row ID when highlightRow is false
    // }
  };

  // useEffect(() => {
  //   if (highlightRow && gridApiRef.current) {
  //     // Only select the row if it's not already selected
  //     const rowNode = gridApiRef.current.getRowNode(selectedRowId);
  //     if (rowNode && !rowNode.isSelected()) {
  //       rowNode.setSelected(true); // Highlight the row when highlightRow is true
  //     }
  //   } else if (!highlightRow && gridApiRef.current) {
  //     // If highlightRow is false, reset any highlights
  //     const rowNode = gridApiRef.current.getRowNode(selectedRowId);
  //     if (rowNode) {
  //       rowNode.setSelected(false); // Remove the highlight if highlightRow is false
  //     }
  //   }
  // }, [highlightRow, selectedRowId]);

  return (
    <div className="container-fluid">
      <div
        className="row justify-content-end align-items-center"
        style={{ marginTop: "-102px" }}
      >
        <div className="col-auto d-flex gap-2 me-2 mb-2">
          <FaFileExcel
            aria-label="Download Excel"
            data-bs-toggle="tooltip"
            data-bs-placement="auto"
            title="Click To Download Excel"
            onClick={fileExport}
            style={{
              cursor: "pointer",
              color: "#4CAF50",
              transition: "color 0.3s ease",
              width: "40px",
              height: "40px",
              marginRight: "10px",
              marginTop: "5px",
            }}
            onMouseOver={(e) => (e.target.style.color = "#45a049")}
            onMouseOut={(e) => (e.target.style.color = "#4CAF50")}
          />
          <FaFilePdf
            aria-label="Download PDF"
            data-bs-toggle="tooltip"
            data-bs-placement="auto"
            title="Click To Download PDF"
            onClick={onExportPdf}
            style={{
              cursor: "pointer",
              color: "#f44336",
              transition: "color 0.3s ease",
              width: "40px",
              height: "40px",
              marginTop: "5px",
            }}
            onMouseOver={(e) => (e.target.style.color = "#d32f2f")}
            onMouseOut={(e) => (e.target.style.color = "#f44336")}
          />
        </div>
      </div>

      <div className="ag-theme-balham" style={{ height: 379, width: "100%" }}>
        <AgGridReact
          key={gridKey} // Grid will reinitialize when this key changes
          tabIndex={1}
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          enableSorting={true}
          enableFilter={true}
          enableColResize={true}
          defaultColDef={{
            enableMenu: true, // Enable the context menu for all columns
            showColumnMenu: true,
          }}
          verticalScroll={true}
          // onGridSizeChanged={onGridSizeChanged} // for resizing grid on display size change {creates issue when resizing display auto matically changes the width}
          gridOptions={gridOptions}// enterprise feature not in use yet
          onGridReady={onGridReady}
          // onRowClicked={onRowClick}
          // rowSelection="single"
        />
      </div>
    </div>
  );
};

export default AgGridTable;

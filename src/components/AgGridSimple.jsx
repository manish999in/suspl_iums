import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const AgGridSimple = () => {
  const gridOptions = {
    columnDefs: [
      {
        headerName: 'Image', // Column header
        field: 'image', // Data field that holds image URL
        cellRendererFramework: 'imageCellRenderer', // Correct way to reference a custom cell renderer
        width: 150, // Set width for image column
      },
      {
        headerName: 'Name',
        field: 'name',
        width: 150,
      },
      {
        headerName: 'Age',
        field: 'age',
        width: 100,
      },
    ],
    defaultColDef: {
      resizable: true,
      sortable: true,
    },
  };

  // Sample row data with valid image URLs
  const rowData = [
    {
      image: 'https://images.unsplash.com/photo-1738830986230-57029d6ef4f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2fHx8ZW58MHx8fHx8', // Test with a known valid image
      name: 'John Doe',
      age: 30,
    },
    {
      image: 'https://via.placeholder.com/150', // Placeholder for testing
      name: 'Jane Smith',
      age: 25,
    },
  ];

  // Custom cell renderer to display images
  const ImageCellRenderer = (props) => {
    console.log('Image URL:', props.value); // Debug: Log the image URL
    return (
      <div style={{ textAlign: 'center' }}>
        <img
          src={props.value}
          alt="Image"
          style={{ width: '100%', height: 'auto', borderRadius: '5px' }}
          crossOrigin="anonymous"
        />
      </div>
    );
  };

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
      <AgGridReact
        gridOptions={gridOptions}
        rowData={rowData}
        frameworkComponents={{
          imageCellRenderer: ImageCellRenderer, // Register the custom renderer correctly
        }}
      />
    </div>
  );
};

export default AgGridSimple;

import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DynamicChartComponent = () => {
  // Initial data, can be updated or fetched dynamically
  const [chartData, setChartData] = useState([
    { label: "Net Salary", y: 579228 },
    { label: "Deduction", y: 57000 },
    { label: "Earning", y: 636228 },
  ]);

  // Function to simulate dynamic data update (like an API call or user input)
  const updateData = () => {
    setChartData([
      { label: "Net Salary", y: 600000 },
      { label: "Deduction", y: 65000 },
      { label: "Earning", y: 700000 },
    ]);
  };

  // Chart.js data structure, dynamically set from state
  const data = {
    labels: chartData.map(item => item.label),  // X-axis labels
    datasets: [
      {
        label: 'Amount',
        data: chartData.map(item => item.y),  // Y-axis values
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Bar color
        borderColor: 'rgba(75, 192, 192, 1)', // Border color
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Dynamic Financial Data',
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  useEffect(() => {
    // You can also simulate an API call or data change here
    // For example, update the chart data after 5 seconds
    const timer = setTimeout(updateData, 5000);
    return () => clearTimeout(timer); // Clean up the timer on component unmount
  }, []);

  return (
    <div>
      <h2>Financial Overview</h2>
      <Bar data={data} options={options} />
      <button onClick={updateData}>Update Data</button> {/* Button to trigger dynamic data update */}
    </div>
  );
};

export default DynamicChartComponent;

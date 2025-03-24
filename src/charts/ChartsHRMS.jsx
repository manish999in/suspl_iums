import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChartsHRMS = ({ dataPoints, title }) => {

   

  // Prepare the chart data structure based on the dataPoints prop
  const data = {
    labels: dataPoints.map(item => item.label), // X-axis labels
    datasets: [
      {
        label: "Payroll Breakdown Month",
        data: dataPoints.map(item => item.y), // Y-axis values
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
        text: title, // Use the title prop for the chart title
      },
      tooltip: {
        enabled: true,
      },
      legend: {
        position: 'bottom',
        labels: {
            color: '#333',
            font: {
                size: 16,
                weight: '500',
            },
            padding: 20,
        },
    },
    },
  };

  return (
    <div>
     <div style={styles.card}>
      <div style={styles.header}>
          <h6 style={styles.title}>Payroll Distribution</h6>
      </div>
      <div style={styles.chartContainer}>
          <Bar data={data} options={options} style={styles.Bar}/>
      </div>
      </div>
     </div>
  );
};

const styles = {
  card: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '25px',
      margin: 'auto',
      textAlign: 'center',
  },
  header: {
      marginBottom: '25px',
  },
  title: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333',
      textTransform: 'uppercase',
      letterSpacing: '1px',
  },
  chartContainer: {
      position: 'relative',
  },
};

 
export default ChartsHRMS;

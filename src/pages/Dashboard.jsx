import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "../styles/Dashboard.css";
import QuickLinks from "../components/QuickLinks";
import Location from "../components/Location";
import ChartsHRMS from "../charts/ChartsHRMS";
import DashboardChartsNew from "../charts/DashboardChartsNew";
import { retrieveFromLocalStorage, retrieveFromCookies, storeInLocalStorage } from "../utils/CryptoUtils";
import AgGridTable from "../components/AgGridTable";
import AgGridSimple from "../components/AgGridSimple";

const Dashboard = () => {
  const [quickLinks, setQuickLinks] = useState(false); // State to control the display of QuickLinks
  const [chartType, setChartType] = useState('');  // To control PieCharts display
  const [chartType2, setChartType2] = useState("hrms");  // To control HRMS-related charts
  const [loading, setLoading] = useState(true); // State to track loading status

  const data2 = [
    { label: "Net Salary", y: 579228 },
    { label: "Deduction", y: 57000 },
    { label: "Earning", y: 636228 },
  ];

  // UseEffect to handle side effect logic like cookie checking
  useEffect(() => {
    const tmrefr = retrieveFromLocalStorage("tmrefr");

    if (tmrefr == "n") {
      // alert("n");
      localStorage.setItem("tmrefr", "y");
      window.location.reload();
    }

    // Retrieve uData from cookies
    const uDataCookie = retrieveFromCookies("uData");
    const uData = uDataCookie ? JSON.parse(uDataCookie) : {}; // Parse uData from cookie, or default to an empty object

    // Check userStatus and set quickLinks accordingly
    if (uData.userStatus === "U") {
      setQuickLinks(true); // Set quickLinks to true if the userStatus is "U"
    }

    // Set loading to false after the data has been processed
    setLoading(false);
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  // If the page is still loading, show the loading spinner/message
  if (loading) {
    return <div>Loading...</div>; // You can replace this with a spinner or other loading indication
  }

  return (
    <>
      <div className="rightArea">
        <div className="dashboard-container">
          {/* Conditionally render QuickLinks if quickLinks state is true */}
          <Location setChartType={setChartType} setChartType2={setChartType2} />
          {quickLinks && <QuickLinks />}


          {/* Render DashboardChartsNew */}
          {!chartType2 && (
            <div className="col-md-4">
              <DashboardChartsNew />
            </div>
          )}

          {chartType2 && (
            <div className="row mt-3">
              <div className="col-md-7">
                <div className="card shadow border-0">
                  <ChartsHRMS dataPoints={data2} />
                </div>
              </div>
              <div className="col-md-5">
                <DashboardChartsNew />
              </div>
            </div>
          )}

          {/* <DashboardCard /> */}
        </div>
{/*         
        <AgGridSimple/> */}
      </div>
    </>
  );
};

export default Dashboard;

// import React, { useState } from "react";
// import { Line, Pie, Bar } from "react-chartjs-2";
// import "chart.js/auto";
// import "bootstrap/dist/css/bootstrap.min.css";

// const Dashboard = () => {
//   const [activeTab, setActiveTab] = useState("notifications");
//   const lineChartData = {
//     labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
//     datasets: [
//       {
//         label: "Revenue Collected (in Rs.)",
//         data: [5000, 10000, 7000, 15000, 12000, 20000],
//         backgroundColor: "rgba(75,192,192,0.2)",
//         borderColor: "#4BC0C0",
//         borderWidth: 2,
//       },
//     ],
//   };

//   const pieChartData = {
//     labels: ["Income", "Expenses"],
//     datasets: [
//       {
//         data: [70, 30],
//         backgroundColor: ["#6a0dad", "#ffcc00"],
//       },
//     ],
//   };

//   const barChartData = {
//     labels: ["Memberships", "Personal Training", "Product Sales"],
//     datasets: [
//       {
//         label: "Revenue Breakdown",
//         data: [50000, 20000, 15000],
//         backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"],
//       },
//     ],
//   };
//   const lineChartOptions = {
//     plugins: {
//       legend: {
//         labels: {
//           color: "#ffffff", // Change legend text color
//         },
//       },
//     },
//     scales: {
//       x: {
//         ticks: {
//           color: "#ffffff", // Change X-axis text color
//         },
//       },
//       y: {
//         ticks: {
//           color: "#ffffff", // Change Y-axis text color
//         },
//       },
//     },
//   };
//   const pieChartOptions = {
//     plugins: {
//       legend: {
//         labels: {
//           color: "#ffffff", // Change legend text color
//         },
//       },
//     },
//   };
//   const barChartOptions = {
//     plugins: {
//       legend: {
//         labels: {
//           color: "#ffffff", // Change legend text color
//         },
//       },
//     },
//     scales: {
//       x: {
//         ticks: {
//           color: "#ffffff", // Change X-axis text color
//         },
//       },
//       y: {
//         ticks: {
//           color: "#ffffff", // Change Y-axis text color
//         },
//       },
//     },
//   };
      

//   return (
//     <div className="container-fluid bg-dark text-white min-vh-100 p-4">
//       <header className="d-flex justify-content-between align-items-center p-3 bg-secondary rounded">
//         <h1 className="h4">Fitflow Demo</h1>
//         <span>Ashish Shrestha</span>
//       </header>
//       <div className="row mt-4">
//         <div className="col-md-3">
//           <div className="card bg-secondary text-center text-white p-3">
//             <p className="h5">7</p>
//             <p>Total Members</p>
//           </div>
//         </div>
//         <div className="col-md-3">
//           <div className="card bg-secondary text-center text-white p-3">
//             <p className="h5">0</p>
//             <p>New Members</p>
//           </div>
//         </div>
//         <div className="col-md-3">
//           <div className="card bg-secondary text-center text-white p-3">
//             <p className="h5">5</p>
//             <p>Active Members</p>
//           </div>
//         </div>
//         <div className="col-md-3">
//           <div className="card bg-secondary text-center text-white p-3">
//             <p className="h5">100.00%</p>
//             <p>Gross Profit</p>
//           </div>
//         </div>
//       </div>
//       <div className="card bg-secondary text-white p-4 mt-4">
//         <h2 className="h6">Today's Attendance</h2>
//         <div className="text-center text-muted">No data to show</div>
//       </div>
//       <div className="row mt-4">
//         <div className="col-md-8">
//           <div className="card bg-secondary text-white p-4">
//             <h2 className="h6">Revenue Collected</h2>
//             <Line data={lineChartData} options={lineChartOptions} />

//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card bg-secondary text-white p-4">
//             <h2 className="h6">Income vs Expenses</h2>
//             <Pie data={pieChartData} options={pieChartOptions} />
//           </div>
//         </div>
//       </div>
//       <div className="card bg-secondary text-white p-4 mt-4">
//         <h2 className="h6">Absentees</h2>
//         <ul className="list-group">
//           <li className="list-group-item bg-dark text-white d-flex justify-content-between">
//             <span>Ashish Shrestha</span>
//             <span>12 days</span>
//           </li>
//           <li className="list-group-item bg-dark text-white d-flex justify-content-between">
//             <span>new test user</span>
//             <span>8 days</span>
//           </li>
//           <li className="list-group-item bg-dark text-white d-flex justify-content-between">
//             <span>sohin</span>
//             <span>11 days</span>
//           </li>
//         </ul>
//       </div>
//       <div className="container-fluid bg-dark text-white min-vh-100">
//         <ul className="nav nav-tabs mt-4">
//           <li className="nav-item">
//             <button className={`nav-link ${activeTab === "notifications" ? "active" : ""}`} onClick={() => setActiveTab("notifications")}>Notifications & Reminders</button>
//           </li>
//           <li className="nav-item">
//             <button className={`nav-link ${activeTab === "insights" ? "active" : ""}`} onClick={() => setActiveTab("insights")}>Member & Trainer Insights</button>
//           </li>
//           <li className="nav-item">
//             <button className={`nav-link ${activeTab === "engagement" ? "active" : ""}`} onClick={() => setActiveTab("engagement")}>Performance & Engagement</button>
//           </li>
//           <li className="nav-item">
//             <button className={`nav-link ${activeTab === "finance" ? "active" : ""}`} onClick={() => setActiveTab("finance")}>Financial Overview</button>
//           </li>
//         </ul>
//         <div className="tab-content mt-4">
//           {activeTab === "notifications" && (
//             <div className="card bg-secondary text-white p-4">
//               <h2 className="h6">Notifications & Reminders</h2>
//               <p>New Member Signups</p>
//               <p>Trainer Availability</p>
//             </div>
//           )}
//           {activeTab === "insights" && (
//             <div className="card bg-secondary text-white p-4">
//               <h2 className="h6">Member & Trainer Insights</h2>
//               <p>Total Trainers: 10</p>
//               <p>Total Staff: 15</p>
//             </div>
//           )}
//           {activeTab === "engagement" && (
//             <div className="card bg-secondary text-white p-4">
//               <h2 className="h6">Performance & Engagement</h2>
//               <p>Popular Membership Plan: Annual Subscription</p>
//             </div>
//           )}
//           {activeTab === "finance" && (
//             <div className="card bg-secondary text-white p-4">
//               <h2 className="h6">Financial Overview</h2>
//               <p>Pending Payments: 5 Members</p>
//               <Bar data={barChartData} options={barChartOptions} />
//               </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React from 'react';
import "../styles/Loading.css"; // Import the loading styles

const Loading = () => {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <h2>Loading...</h2>
    </div>
  );
};

export default Loading;

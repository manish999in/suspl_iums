// import React from 'react';

// const ProgressBar = ({ progress, isValid }) => {
//   const barColor = isValid ? '#4CAF50' : '#FF5733'; // Green if valid, Red if invalid

//   return (
//     <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
//       <div
//         style={{
//           width: `${progress}%`,
//           height: '20px',
//           backgroundColor: barColor,
//           transition: 'width 0.5s ease-in-out',
//         }}
//       ></div>
//     </div>
//   );
// };

// export default ProgressBar;

import React from 'react';
import "../styles/ProgressBar.css";

const ProgressBar = ({ progress, isValid }) => {
  const barColor = isValid ? '#4CAF50' : '#FF5733'; // Green if valid, Red if invalid

  return (
    <div className="progress-bar-container">
      <div
        className="progress-bar"
        style={{
          width: `${progress}%`,
          backgroundColor: barColor,
        }}
      >
        {/* Animated greyish transparent effect */}
        <div
          className={`progress-overlay ${isValid ? 'no-animation' : ''}`}
        ></div>
      </div>

      {/* Percentage text */}
      <div className="progress-percentage">
        {progress.toFixed(2)}%
      </div>
    </div>
  );
};

export default ProgressBar;

// // src/hooks/useSingleTab.js
// import { useEffect } from 'react';

// const useSingleTab = () => {
//   useEffect(() => {
//     const tabKey = 'isAppOpen';

//     // Check if the app is already open in another tab
//     if (localStorage.getItem(tabKey)) {
//       alert("The app is already open in another tab.");
//       window.close(); // Close the current tab
//     } else {
//       localStorage.setItem(tabKey, 'true');

//       // Clean up on tab close
//       const cleanup = () => {
//         localStorage.removeItem(tabKey);
//       };

//       window.addEventListener('beforeunload', cleanup);

//       // Listen for other tabs
//       const handleStorageChange = (event) => {
//         if (event.key === tabKey) {
//           alert("The app is already open in another tab.");
//       window.close(); // Close the current tab
//         }
//       };

//       window.addEventListener('storage', handleStorageChange);

//       return () => {
//         cleanup();
//         window.removeEventListener('beforeunload', cleanup);
//         window.removeEventListener('storage', handleStorageChange);
//       };
//     }
//   }, []);
// };

// export default useSingleTab;


// src/hooks/useSingleTab.js
import { useEffect } from 'react';

const useSingleTab = () => {
  useEffect(() => {
    const tabKey = 'isAppOpen';
    const errorPage = '/error.html'; // Adjust this path based on your project structure

    // Check if the app is already open in another tab
    if (localStorage.getItem(tabKey)) {
      alert("The app is already open in another tab.");
      window.location.href = errorPage; // Redirect to error page
    } else {
      localStorage.setItem(tabKey, 'true');

      // Clean up on tab close
      const cleanup = () => {
        localStorage.removeItem(tabKey);
      };

      window.addEventListener('beforeunload', cleanup);

      // Listen for other tabs
      const handleStorageChange = (event) => {
        if (event.key === tabKey) {
          // If the storage event is triggered from another tab, do nothing here
          // The current tab should stay open
          return;
        }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        cleanup();
        window.removeEventListener('beforeunload', cleanup);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);
};

export default useSingleTab;

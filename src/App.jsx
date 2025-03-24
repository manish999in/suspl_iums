// src/App.jsx
import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes'; // Import AppRoutes\
import config from './properties/config';



const App = () => {
    

    return (
        <div className="app">
            <AppRoutes /> {/* Use the routes here */}
        </div>
    );
};

export default App;

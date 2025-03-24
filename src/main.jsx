// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';

// Remove loading indicator once React is ready
const root = document.getElementById("root");
const loadingIndicator = document.getElementById("loading-indicator");

if (loadingIndicator) {
  loadingIndicator.remove();
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);


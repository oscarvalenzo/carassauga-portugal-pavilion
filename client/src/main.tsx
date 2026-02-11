import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Force refresh: v2.0.1
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);


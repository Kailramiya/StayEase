import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PropertyProvider } from './context/PropertyContext';
import { BookingProvider } from './context/BookingContext';
import { ThemeProvider } from './context/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <PropertyProvider>
          <BookingProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </BookingProvider>
        </PropertyProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);

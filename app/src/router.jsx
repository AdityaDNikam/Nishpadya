import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import DemosPage from './pages/DemosPage';
import ErrorPage from './pages/ErrorPage';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/demos" element={<DemosPage />} />
        {/* Fallback route handles unmatched paths / error page */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

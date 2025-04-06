// client\src\routes.tsx
import React from 'react';
import {
  //  Navigate, 
   Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TermsPage from './pages/Terms';
import NotFound from './pages/404';


const AppRouter: React.FC = () => {
  return (
    <div>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/terms" element={<TermsPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default AppRouter;
import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-black text-white font-inter overflow-hidden">
      <Sidebar />
      <div className="flex-1 h-screen overflow-hidden relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Layout;

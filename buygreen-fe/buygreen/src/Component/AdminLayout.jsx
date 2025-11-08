import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminFooter from './AdminFooter';

const AdminLayout = () => (
  <div className="flex flex-col min-h-screen">
    <AdminNavbar />
    <div className="flex-grow pt-16">
      <Outlet />
    </div>
    <AdminFooter />
  </div>
);

export default AdminLayout;


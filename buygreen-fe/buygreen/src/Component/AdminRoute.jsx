import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    //Get the customer object from localStorage
    const storedCustomer = localStorage.getItem('customer');
        let customer = null;

        if(storedCustomer) {
            try {
                customer = JSON.parse(storedCustomer);
            } catch (e) {
                console.error("Failed to parse customer from localStorage", e);
                localStorage.clear(); // Clear bad data
            }
        }

        //Check if a customer is logged in AND their role is 'admin'
        const isAdmin = customer && customer.role === 'admin';

        //if they are admin, show the child component (Outlet)
        //Otherwise, redirect them to login page (admin access is restricted)
        if (!customer) {
            return <Navigate to="/login" replace />;
        }
        
        if (!isAdmin) {
            // Clear customer data if they're not admin
            localStorage.removeItem('customer');
            localStorage.removeItem('token');
            return <Navigate to="/login" replace />;
        }
        
        return <Outlet />;
}
 export default AdminRoute;
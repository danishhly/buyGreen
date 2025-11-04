import React from 'react';
import {Navigate, Outlet } from 'react-router-dom';

const CustomerRoute = () => {
    // get the customer object from loalstorage
    const storedCustomer = localStorage.getItem('customer');
    let customer = null;

    if(storedCustomer) {
        try {
            customer = JSON.parse(storedCustomer);
        } catch (e) {
            console.error("Failed to parse customer from localStoragee", e);
            localStorage.clear(); // Clear bad data
        }
    }

    //if a customer is logged in, show the child componenet (Outlet);
    //Otherwise, redirect to the login page

    return customer ? <Outlet /> : <Navigate to ="/login" replace />;
};

export default CustomerRoute;
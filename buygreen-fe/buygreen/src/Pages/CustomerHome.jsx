import React from 'react'


const CustomerHome = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      <h1 className="text-3xl font-bold text-green-700">Welcome, {user?.name || "Customer"}!</h1>
      <p className="text-gray-700 mt-2">This is your customer dashboard.</p>
    </div>
  );
};

export default CustomerHome;

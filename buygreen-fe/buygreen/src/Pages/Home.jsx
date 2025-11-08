import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../Component/Logo';

function Home() {
  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-green-100">
      <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <Logo className="h-16 w-auto" />
        </div>
        <h1 className="text-3xl font-bold text-green-700 mb-6">Welcome to buygron.</h1>

        <div className="space-y-4">
          <NavLink
            to="/signup"
            className="block w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
          >
            Sign Up
          </NavLink>

          <NavLink
            to="/login"
            className="block w-full py-2 px-4 bg-gray-200 text-green-700 rounded-md hover:bg-gray-300 transition duration-300"
          >
            Login
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default Home;
import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../Component/Logo';

function Home() {
  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-lg text-center">
        <div className="flex justify-center mb-8">
          <Logo className="text-6xl" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to buygreen.</h1>
        <p className="text-gray-600 mb-8">Sign in to continue shopping</p>

        <div className="space-y-4">
          <NavLink
            to="/signup"
            className="block w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-300 shadow-md hover:shadow-lg"
          >
            Sign Up
          </NavLink>

          <NavLink
            to="/login"
            className="block w-full py-3 px-4 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition duration-300"
          >
            Login
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default Home;
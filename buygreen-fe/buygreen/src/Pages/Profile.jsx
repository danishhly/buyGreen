import React, { useEffect, useState } from 'react';

const Profile = () => {
    const [customer, setCustomer] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('customer');
        if (stored) {
            try {
                setCustomer(JSON.parse(stored));
            } catch {
                setCustomer(null);
            }
        }
    }, []);

    if (!customer) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-2">Profile</h1>
                <p className="text-gray-600">You are not logged in.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Profile</h1>
            <div className="rounded-lg border p-6 shadow-sm bg-white">
                <div className="mb-3"><span className="font-medium">Name:</span> {customer.name}</div>
                <div className="mb-3"><span className="font-medium">Email:</span> {customer.email}</div>
                <div className="mb-1"><span className="font-medium">Role:</span> {customer.role}</div>
            </div>
        </div>
    );
};

export default Profile;



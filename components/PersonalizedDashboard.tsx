'use client';

import { FC } from 'react';

interface UserData {
  id?: string;
  name?: string;
}

interface PersonalizedDashboardProps {
  userData: UserData | null;
}

export const PersonalizedDashboard: FC<PersonalizedDashboardProps> = ({ userData }) => {
  if (!userData) {
    return <div>Loading...</div>;
  }

  const displayName = userData.name ?? 'User';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Welcome {displayName}</h1>
        <p className="text-gray-600 mt-2">Here's your dashboard overview</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Requests</h3>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Usage</h3>
          <p className="text-3xl font-bold">$0.00</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Status</h3>
          <p className="text-green-500 font-semibold">Active</p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

const Team = () => {
  const team = [
    {
      name: 'StayEase Team',
      role: 'Product & Engineering',
      bio: 'We build the platform experience—search, favorites, bookings, and dashboards—focused on clarity and speed.',
    },
    {
      name: 'Support',
      role: 'Customer Support',
      bio: 'We help resolve account issues, booking questions, and reported bugs with quick turnaround.',
    },
    {
      name: 'Operations',
      role: 'Listings & Quality',
      bio: 'We work to improve listing accuracy and encourage better property details for tenants.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl">
          <h1 className="text-3xl font-bold mb-3">Our Team</h1>
          <p className="text-gray-700 mb-8">
            StayEase is built by a small team focused on a reliable rental experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((m) => (
              <div key={m.role} className="bg-white border rounded-xl p-6">
                <div className="text-lg font-semibold text-gray-900">{m.name}</div>
                <div className="text-sm text-gray-600 mt-1">{m.role}</div>
                <p className="text-gray-700 mt-3">{m.bio}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-white border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Want to work with us?</h2>
            <p className="text-gray-700">
              Check the Careers page for open roles and collaboration opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;

import React from 'react';

const About = () => {
  const highlights = [
    {
      title: 'Verified Listings Focus',
      desc: 'We aim to make rental discovery more trustworthy by encouraging accurate details, clear photos, and better listing quality.',
    },
    {
      title: 'Tenant-Friendly Experience',
      desc: 'Search, compare, save favorites, and book stays with a simple flow that works across devices.',
    },
    {
      title: 'Owner Connectivity',
      desc: 'Tenants can contact owners through property-specific inquiry flows to reduce confusion and keep communication relevant.',
    },
  ];

  const values = [
    { title: 'Transparency', desc: 'Clear information and predictable flows.' },
    { title: 'Reliability', desc: 'Stable experience for bookings, payments, and dashboards.' },
    { title: 'Respect', desc: 'We build with trust for tenants and owners.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl">
          <h1 className="text-3xl font-bold mb-3">About StayEase</h1>
          <p className="text-gray-700 mb-8">
            StayEase helps tenants find rental homes and helps owners showcase properties with clarity. Our goal is a smoother, more
            trustworthy rental journey across India.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((h) => (
              <div key={h.title} className="bg-white border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-2">{h.title}</h2>
                <p className="text-gray-700">{h.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-white border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-3">Our Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {values.map((v) => (
                <div key={v.title} className="bg-gray-50 border rounded-lg p-4">
                  <div className="font-semibold text-gray-900">{v.title}</div>
                  <div className="text-gray-700 mt-1">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 bg-white border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Where we operate</h2>
            <p className="text-gray-700">
              StayEase is built in India and supports properties across Indian cities. We continuously improve coverage and listing quality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

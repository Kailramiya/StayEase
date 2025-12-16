import React from 'react';

const Pricing = () => {
  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      desc: 'Browse and discover properties.',
      features: ['Browse listings', 'View property details', 'Contact owners (via property flow)'],
    },
    {
      name: 'Tenant',
      price: 'Free',
      desc: 'Everything you need to book and manage stays.',
      features: ['Favorites', 'Bookings dashboard', 'Profile management'],
    },
    {
      name: 'Partner',
      price: 'Contact us',
      desc: 'For landlords and partners who want help managing listings.',
      features: ['Listing support', 'Property management guidance', 'Priority assistance'],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl">
          <h1 className="text-3xl font-bold mb-4">Pricing</h1>
          <p className="text-gray-700 mb-10">
            StayEase is free for tenants to browse and book. Partners can contact us for collaboration and listing support.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div key={p.name} className="bg-white border rounded-xl p-6">
                <h2 className="text-xl font-semibold">{p.name}</h2>
                <div className="text-2xl font-bold mt-2">{p.price}</div>
                <p className="text-gray-700 mt-2">{p.desc}</p>
                <ul className="list-disc pl-5 text-gray-700 mt-4 space-y-2">
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-white border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Partner inquiries</h2>
            <p className="text-gray-700">
              Email <a className="text-blue-600 hover:underline" href="mailto:officialamankundu@gmail.com">officialamankundu@gmail.com</a> with subject “Pricing / Partnership”.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

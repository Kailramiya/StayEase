import React from 'react';

const Press = () => {
  const items = [
    {
      title: 'StayEase Platform Overview',
      date: '2025',
      desc: 'A quick overview of our mission: helping tenants discover rentals and helping owners reach tenants with clearer listings.',
    },
    {
      title: 'Product Updates',
      date: '2025',
      desc: 'We continuously improve bookings, favorites, and reliability across the platform.',
    },
  ];

  const subject = encodeURIComponent('Press Inquiry - StayEase');
  const body = encodeURIComponent(
    'Hi StayEase Team,\n\nI am reaching out for a press inquiry.\n\nOrganization: \nName: \nQuestion/Request: \nDeadline: \n\nThanks!'
  );

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl">
          <h1 className="text-3xl font-bold mb-3">Press</h1>
          <p className="text-gray-700 mb-8">
            Media resources and press contact for StayEase.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((i) => (
              <div key={i.title} className="bg-white border rounded-xl p-6">
                <div className="text-sm text-gray-600">{i.date}</div>
                <h2 className="text-xl font-semibold mt-1">{i.title}</h2>
                <p className="text-gray-700 mt-3">{i.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-white border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Press contact</h2>
            <p className="text-gray-700 mb-4">
              For interviews or media requests, email us.
            </p>
            <a
              className="inline-flex items-center justify-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              href={`mailto:officialamankundu@gmail.com?subject=${subject}&body=${body}`}
            >
              Email Press Inquiry
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Press;

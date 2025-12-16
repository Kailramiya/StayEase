import React from 'react';

const FAQ = () => {
  const items = [
    {
      q: 'How do I book a property?',
      a: 'Open a property, review details, then proceed to checkout to confirm your booking.'
    },
    {
      q: 'Can I save properties for later?',
      a: 'Yes. Use the heart icon to add properties to your favorites (login required).'
    },
    {
      q: 'Why does it say my session expired?',
      a: 'If your login cookie is missing/expired, the app may ask you to log in again. Logging out and logging back in usually fixes it.'
    },
    {
      q: 'How do I contact the owner?',
      a: 'Open the property details page and use the “Contact Owner” option to send your message.'
    },
    {
      q: 'How are prices calculated?',
      a: 'Pricing can be shown as monthly and may be derived into a daily rate for day-based stays.'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-4">FAQs</h1>
          <p className="text-gray-700 mb-8">
            Common questions about bookings, favorites, and account access.
          </p>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.q} className="bg-white border rounded-xl p-6">
                <h2 className="text-lg font-semibold">{item.q}</h2>
                <p className="text-gray-700 mt-2">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

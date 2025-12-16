import React from 'react';

const Partnerships = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-4">Partnerships</h1>
          <p className="text-gray-700 mb-8">
            We’re open to working with property owners, brokers, and local partners to improve verified listings and tenant experience.
          </p>

          <div className="space-y-6">
            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Who can partner</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Property owners and landlords</li>
                <li>Local property management teams</li>
                <li>Service partners (maintenance, cleaning, verification)</li>
              </ul>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">How to reach us</h2>
              <p className="text-gray-700">
                Email <a className="text-blue-600 hover:underline" href="mailto:officialamankundu@gmail.com">officialamankundu@gmail.com</a> with:
              </p>
              <ul className="list-disc pl-5 text-gray-700 mt-2 space-y-2">
                <li>Your name and city</li>
                <li>Type of partnership you’re proposing</li>
                <li>How many properties/services you manage</li>
              </ul>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Next steps</h2>
              <p className="text-gray-700">
                We’ll respond with basic requirements and onboarding steps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partnerships;

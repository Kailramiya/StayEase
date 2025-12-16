import React from 'react';

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-4">Disclaimer</h1>
          <p className="text-gray-700 mb-8">
            StayEase is a platform to connect tenants with property owners/partners. We aim for accuracy, but information can change.
          </p>

          <div className="space-y-4">
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Listings</h2>
              <p className="text-gray-700">
                Property details (price, availability, amenities) are provided by owners/partners and may be updated. Always verify key details before booking.
              </p>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Third-party services</h2>
              <p className="text-gray-700">
                Payments, maps, and external links may be handled by third parties. Their terms and availability may apply.
              </p>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Limitation</h2>
              <p className="text-gray-700">
                StayEase is provided “as is” without warranties. We are not responsible for indirect damages arising from the use of the platform.
              </p>
            </section>

            <p className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;

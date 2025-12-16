import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
          <p className="text-gray-700 mb-8">
            These terms describe how StayEase can be used. By accessing or using StayEase, you agree to these terms.
          </p>

          <div className="space-y-4">
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">1. Using the Platform</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>You must provide accurate information when creating an account.</li>
                <li>You are responsible for maintaining the confidentiality of your login session.</li>
                <li>You agree not to misuse the platform (spam, abuse, fraud, or unauthorized access attempts).</li>
              </ul>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">2. Listings & Bookings</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Listings are provided by owners/partners; details may change over time.</li>
                <li>Booking confirmation and availability depend on system and owner verification.</li>
                <li>Always review details (price, rules, location) before confirming.</li>
              </ul>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">3. Payments</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Payments are processed through supported payment providers.</li>
                <li>Keep transaction references for support and disputes.</li>
              </ul>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">4. Content & Intellectual Property</h2>
              <p className="text-gray-700">
                StayEase branding and platform content are owned by StayEase or its licensors. You may not copy or
                redistribute content without permission.
              </p>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">5. Termination</h2>
              <p className="text-gray-700">
                We may suspend access if we believe there is misuse or violation of these terms.
              </p>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">6. Contact</h2>
              <p className="text-gray-700">
                Questions about these terms? Email: <a className="text-blue-600 hover:underline" href="mailto:officialamankundu@gmail.com">officialamankundu@gmail.com</a>
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

export default Terms;

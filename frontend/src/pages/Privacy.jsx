import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-700 mb-8">
            This page explains what data we collect and how it may be used to provide the StayEase service.
          </p>

          <div className="space-y-4">
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Account details such as name, email, and phone number.</li>
                <li>Booking-related information you submit during checkout.</li>
                <li>Technical data required to keep you signed in (cookies).</li>
              </ul>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">How We Use Information</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>To create and maintain your account.</li>
                <li>To process bookings and enable platform features (favorites, dashboards).</li>
                <li>To improve product quality, support, and security.</li>
              </ul>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Sharing</h2>
              <p className="text-gray-700">
                We may share limited information when necessary to provide the service (for example, owner contact for a booking inquiry),
                or to comply with legal requirements.
              </p>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Security</h2>
              <p className="text-gray-700">
                We use reasonable security practices to protect data. However, no system is 100% secure.
              </p>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Contact</h2>
              <p className="text-gray-700">
                Privacy questions? Email: <a className="text-blue-600 hover:underline" href="mailto:officialamankundu@gmail.com">officialamankundu@gmail.com</a>
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

export default Privacy;

import React from 'react';

const Refund = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-4">Refund Policy</h1>
          <p className="text-gray-700 mb-8">
            This policy outlines general refund guidelines. Eligibility can depend on booking status and payment provider rules.
          </p>

          <div className="space-y-4">
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">General Guidelines</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Refunds may be considered for duplicate payments or failed bookings with confirmed payment.</li>
                <li>Processing time may vary depending on the payment provider and bank.</li>
                <li>Always keep transaction references for support.</li>
              </ul>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">How to request a refund</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Email <a className="text-blue-600 hover:underline" href="mailto:officialamankundu@gmail.com">officialamankundu@gmail.com</a> with your booking ID and payment reference.</li>
                <li>Explain the reason and attach screenshots if possible.</li>
              </ul>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Non-refundable cases (examples)</h2>
              <p className="text-gray-700">
                Some cases may not be eligible, such as confirmed stays already utilized or policy violations.
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

export default Refund;

import React from 'react';
import { Link } from 'react-router-dom';

const Help = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-4">Help Center</h1>
          <p className="text-gray-700 mb-8">
            Find quick answers about browsing properties, booking, payments, and account access.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Browse listings on the Properties page and open a property to view full details.</li>
                <li>Create an account to save favorites, book properties, and manage your profile.</li>
                <li>Use filters and search to find homes that match your needs.</li>
              </ul>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Bookings</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Select dates/duration on checkout and confirm your booking.</li>
                <li>Track booking status in your dashboard after login.</li>
                <li>If you face a booking issue, share your booking ID in the report page.</li>
              </ul>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Payments</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Payments are processed securely during checkout.</li>
                <li>Keep screenshots/transaction reference for faster support.</li>
                <li>See the Refund Policy for eligible cases.</li>
              </ul>
              <div className="mt-4">
                <Link to="/refund" className="text-blue-600 hover:underline">
                  View Refund Policy
                </Link>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Account & Login</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Use “Forgot Password” from the login page if you can’t sign in.</li>
                <li>Update your name/phone and profile picture from Profile.</li>
                <li>If your session expires, log in again and retry your action.</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 bg-white border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Still need help?</h2>
            <p className="text-gray-700">
              Visit the <Link to="/contact" className="text-blue-600 hover:underline">Contact Us</Link> page or
              check the <Link to="/faq" className="text-blue-600 hover:underline">FAQs</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;

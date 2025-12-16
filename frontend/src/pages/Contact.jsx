import React from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-700 mb-8">
            Reach out for help, feedback, or reporting issues. For property-specific questions, contact the owner from the property page.
          </p>

          <div className="bg-white border rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Support Email</h2>
              <a className="text-blue-600 hover:underline" href="mailto:officialamankundu@gmail.com">
                officialamankundu@gmail.com
              </a>
              <p className="text-sm text-gray-600 mt-1">Include your account email and any relevant IDs (booking/property).</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-1">Phone</h2>
              <a className="text-blue-600 hover:underline" href="tel:+919466460761">+91 94664 60761</a>
              <p className="text-sm text-gray-600 mt-1">Available during normal business hours.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-1">Address</h2>
              <p className="text-gray-700">Kaithal, Haryana, India</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/feedback" className="bg-white border rounded-xl p-5 hover:border-blue-300 transition">
              <h3 className="font-semibold text-lg">Send Feedback</h3>
              <p className="text-gray-700 mt-1">Suggestions to improve StayEase.</p>
            </Link>
            <Link to="/report" className="bg-white border rounded-xl p-5 hover:border-blue-300 transition">
              <h3 className="font-semibold text-lg">Report an Issue</h3>
              <p className="text-gray-700 mt-1">Bugs, payment issues, listing problems.</p>
            </Link>
          </div>

          <div className="mt-8 bg-white border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Contact a Property Owner</h2>
            <p className="text-gray-700">
              Open a listing and use the contact option to message the owner directly.
            </p>
            <div className="mt-3">
              <Link to="/properties" className="text-blue-600 hover:underline">Browse Properties</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

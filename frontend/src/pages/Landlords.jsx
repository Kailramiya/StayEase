import React from 'react';
import { Link } from 'react-router-dom';

const Landlords = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-4">For Landlords</h1>
          <p className="text-gray-700 mb-8">
            List your property, reach verified tenants, and manage inquiries more efficiently.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Why list on StayEase</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Showcase your listing with photos and detailed amenities.</li>
                <li>Increase visibility to tenants searching in your city.</li>
                <li>Reduce back-and-forth with clearer listing info.</li>
              </ul>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Get started</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Create an account and complete your profile.</li>
                <li>Prepare high-quality photos and accurate details.</li>
                <li>Contact us for listing support or partnerships.</li>
              </ul>
              <div className="mt-4 flex gap-4">
                <Link to="/signup" className="text-blue-600 hover:underline">Create Account</Link>
                <Link to="/partnerships" className="text-blue-600 hover:underline">Partnerships</Link>
              </div>
            </div>
          </div>

          <div className="mt-10 bg-white border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Questions?</h2>
            <p className="text-gray-700">
              Email <a className="text-blue-600 hover:underline" href="mailto:officialamankundu@gmail.com">officialamankundu@gmail.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landlords;

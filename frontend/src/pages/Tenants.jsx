import React from 'react';
import { Link } from 'react-router-dom';

const Tenants = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-4">For Tenants</h1>
          <p className="text-gray-700 mb-8">
            Discover verified rental homes, save favorites, and book stays with confidence.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Find the right home</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Browse properties by location and amenities.</li>
                <li>View photos and listing details before contacting.</li>
                <li>Save listings to Favorites for later.</li>
              </ul>
              <div className="mt-4">
                <Link to="/properties" className="text-blue-600 hover:underline">Explore Properties</Link>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Book and manage</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Book stays via checkout and track status in Dashboard.</li>
                <li>Keep payment references for faster support.</li>
                <li>Update profile details anytime.</li>
              </ul>
              <div className="mt-4">
                <Link to="/dashboard" className="text-blue-600 hover:underline">Go to Dashboard</Link>
              </div>
            </div>
          </div>

          <div className="mt-10 bg-white border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Need help?</h2>
            <p className="text-gray-700">
              See <Link to="/help" className="text-blue-600 hover:underline">Help Center</Link> or <Link to="/faq" className="text-blue-600 hover:underline">FAQs</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tenants;

import React from 'react';

const PropertyManagement = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-4">Property Management</h1>
          <p className="text-gray-700 mb-8">
            Manage listings, keep details updated, and ensure a smooth experience for tenants.
          </p>

          <div className="space-y-6">
            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">What we help with</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Listing quality checks (photos, details, amenities)</li>
                <li>Basic verification and platform compliance support</li>
                <li>Improved discoverability through accurate metadata</li>
              </ul>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Best practices for owners</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Keep pricing and availability up to date.</li>
                <li>Upload clear images (rooms, kitchen, bathrooms, exterior).</li>
                <li>Respond to inquiries quickly for better tenant trust.</li>
              </ul>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Get support</h2>
              <p className="text-gray-700">
                Email <a className="text-blue-600 hover:underline" href="mailto:officialamankundu@gmail.com">officialamankundu@gmail.com</a> with your property details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyManagement;

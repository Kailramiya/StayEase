import React from 'react';
import { Link } from 'react-router-dom';

const Sitemap = () => {
  const links = [
    { label: 'Home', path: '/' },
    { label: 'Properties', path: '/properties' },
    { label: 'Favorites', path: '/favorites' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Profile', path: '/profile' },
    { label: 'About', path: '/about' },
    { label: 'Team', path: '/team' },
    { label: 'Careers', path: '/careers' },
    { label: 'Press', path: '/press' },
    { label: 'Blog', path: '/blog' },
    { label: 'Help Center', path: '/help' },
    { label: 'Contact', path: '/contact' },
    { label: 'FAQs', path: '/faq' },
    { label: 'Feedback', path: '/feedback' },
    { label: 'Report Issue', path: '/report' },
    { label: 'Terms', path: '/terms' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'Cookies', path: '/cookies' },
    { label: 'Refund Policy', path: '/refund' },
    { label: 'Disclaimer', path: '/disclaimer' },
    { label: 'For Tenants', path: '/tenants' },
    { label: 'For Landlords', path: '/landlords' },
    { label: 'Property Management', path: '/property-management' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Partnerships', path: '/partnerships' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Sitemap</h1>
          <p className="text-gray-700 mb-6">
            Quick links to all main sections.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {links.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className="bg-white border rounded-lg px-4 py-3 text-gray-800 hover:border-blue-300 hover:text-blue-700 transition"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;

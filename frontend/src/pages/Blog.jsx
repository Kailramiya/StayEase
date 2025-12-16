import React from 'react';

const Blog = () => {
  const posts = [
    {
      title: 'How to choose the right rental home',
      excerpt: 'A simple checklist to compare location, amenities, commute, and overall value before you book.',
      tag: 'Tenants',
    },
    {
      title: 'Top mistakes to avoid when listing a property',
      excerpt: 'Improve trust with clear photos, accurate pricing, and updated availability.',
      tag: 'Landlords',
    },
    {
      title: 'Booking and payment tips for a smoother experience',
      excerpt: 'Keep transaction references and double-check booking details to prevent delays.',
      tag: 'Bookings',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl">
          <h1 className="text-3xl font-bold mb-3">Blog</h1>
          <p className="text-gray-700 mb-8">
            Helpful tips for tenants and landlords. New articles will be published regularly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((p) => (
              <div key={p.title} className="bg-white border rounded-xl p-6">
                <div className="text-xs font-semibold text-gray-600">{p.tag}</div>
                <h2 className="text-xl font-semibold mt-2">{p.title}</h2>
                <p className="text-gray-700 mt-3">{p.excerpt}</p>
                <p className="text-sm text-gray-600 mt-4">Full posts coming soon.</p>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-white border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Suggest a topic</h2>
            <p className="text-gray-700">
              Have a topic you want covered? Send suggestions to{' '}
              <a className="text-blue-600 hover:underline" href="mailto:officialamankundu@gmail.com">
                officialamankundu@gmail.com
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;

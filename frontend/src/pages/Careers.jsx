import React from 'react';

const Careers = () => {
  const roles = [
    {
      title: 'Frontend Developer (React)',
      type: 'Intern / Full-time',
      desc: 'Work on UI, performance, and clean component architecture for the customer experience.',
    },
    {
      title: 'Backend Developer (Node.js)',
      type: 'Intern / Full-time',
      desc: 'Improve APIs, authentication, booking flows, and system reliability.',
    },
    {
      title: 'Support & Operations',
      type: 'Part-time / Full-time',
      desc: 'Help users, improve listing quality, and handle partner coordination.',
    },
  ];

  const subject = encodeURIComponent('StayEase Careers');
  const body = encodeURIComponent(
    'Hi StayEase Team,\n\nI am interested in opportunities at StayEase.\n\nRole: \nName: \nLocation: \nPortfolio/GitHub/LinkedIn: \nExperience: \n\nThanks!'
  );

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl">
          <h1 className="text-3xl font-bold mb-3">Careers</h1>
          <p className="text-gray-700 mb-8">
            We’re building a smoother rental experience. If you like shipping reliable product, you’ll fit in.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r) => (
              <div key={r.title} className="bg-white border rounded-xl p-6">
                <h2 className="text-xl font-semibold">{r.title}</h2>
                <div className="text-sm text-gray-600 mt-1">{r.type}</div>
                <p className="text-gray-700 mt-3">{r.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-white border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">How to apply</h2>
            <p className="text-gray-700 mb-4">
              Email your resume and links (GitHub/LinkedIn/portfolio). Mention the role you’re applying for.
            </p>
            <a
              className="inline-flex items-center justify-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              href={`mailto:officialamankundu@gmail.com?subject=${subject}&body=${body}`}
            >
              Email Your Application
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;

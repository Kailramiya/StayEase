import React from 'react';

const Feedback = () => {
  const subject = encodeURIComponent('StayEase Feedback');
  const body = encodeURIComponent(
    'Hi StayEase टीम/Team,\n\nMy feedback:\n- \n\n(Optional) My account email: \n(Optional) Screenshot/Details: \n'
  );

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Feedback</h1>
          <p className="text-gray-700 mb-6">
            We appreciate your suggestions. Share what’s working well and what we should improve.
          </p>

          <div className="bg-white border rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">How to send feedback</h2>
              <ul className="list-disc pl-5 text-gray-700 mt-2 space-y-2">
                <li>Tell us what you were trying to do.</li>
                <li>Share what you expected vs what happened.</li>
                <li>Include screenshots if possible.</li>
              </ul>
            </div>

            <div className="pt-2">
              <a
                className="inline-flex items-center justify-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                href={`mailto:officialamankundu@gmail.com?subject=${subject}&body=${body}`}
              >
                Email Feedback
              </a>
              <p className="text-sm text-gray-600 mt-2">
                This opens your email app with a pre-filled template.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;

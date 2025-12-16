import React from 'react';

const ReportIssue = () => {
  const subject = encodeURIComponent('StayEase Issue Report');
  const body = encodeURIComponent(
    'Hi StayEase टीम/Team,\n\nI found an issue:\n- What happened: \n- Steps to reproduce: \n- Expected result: \n- Actual result: \n\n(Optional) My account email: \n(Optional) Booking ID / Property ID: \n(Optional) Screenshots: \n'
  );

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Report Issue</h1>
          <p className="text-gray-700 mb-6">
            Report bugs, payment errors, or listing issues. Provide details so we can resolve it faster.
          </p>

          <div className="bg-white border rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">What to include</h2>
              <ul className="list-disc pl-5 text-gray-700 mt-2 space-y-2">
                <li>Steps to reproduce the issue</li>
                <li>Screenshot (if available)</li>
                <li>Booking ID / Property ID (if relevant)</li>
                <li>Your account email (so we can locate your data)</li>
              </ul>
            </div>

            <div className="pt-2">
              <a
                className="inline-flex items-center justify-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                href={`mailto:officialamankundu@gmail.com?subject=${subject}&body=${body}`}
              >
                Email Issue Report
              </a>
              <p className="text-sm text-gray-600 mt-2">
                This opens your email app with a pre-filled template.
              </p>
            </div>

            <div className="pt-2 text-sm text-gray-600">
              If the issue is property-specific (availability, details), you can also contact the owner from the property page.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;

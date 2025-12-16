import React from 'react';

const Cookies = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-gray-700 mb-8">
            Cookies help the platform work reliably (for example, keeping you signed in).
          </p>

          <div className="space-y-4">
            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">What are cookies?</h2>
              <p className="text-gray-700">
                Cookies are small text files stored on your device. They help websites remember information between visits.
              </p>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">How StayEase uses cookies</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Authentication cookies to keep your session active after login.</li>
                <li>Preference cookies for basic site experience.</li>
                <li>Security-related cookies to protect accounts.</li>
              </ul>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Managing cookies</h2>
              <p className="text-gray-700">
                You can delete or block cookies using your browser settings. If cookies are disabled, some features (login, favorites) may not work.
              </p>
            </section>

            <p className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cookies;

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getPropertyById } from '../api/propertyService';
import { contactOwner as contactOwnerApi } from '../api/contactService';

const ContactOwner = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState(user?.name || '');
  const [senderEmail, setSenderEmail] = useState(user?.email || '');
  const [senderPhone, setSenderPhone] = useState(user?.phone || '');
  const [preferredContact, setPreferredContact] = useState('email');
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetch = async () => {
      try {
        const res = await getPropertyById(propertyId);
        const data = res.data || res;
        const prop = data.data || data;
        setProperty(prop);
      } catch (err) {
        console.error('Failed to load property', err);
        setError('Failed to load property');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [propertyId, user, navigate]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!property || !property.owner) return;
    const ownerEmail = property.owner.email;
    if (!ownerEmail) {
      alert('Owner does not have an email listed.');
      return;
    }

    if (!message.trim()) {
      alert('Please enter a message for the owner.');
      return;
    }

    // Build a detailed email body with sender contact details
    const bodyLines = [];
    bodyLines.push(`Hello ${property.owner.name || 'Owner'},`);
    bodyLines.push('');
    bodyLines.push(`I am contacting regarding your property: ${property.title}`);
    bodyLines.push(`Property link: ${window.location.origin}/properties/${property._id}`);
    bodyLines.push('');
    bodyLines.push('Message:');
    bodyLines.push(message);
    bodyLines.push('');
    bodyLines.push('Contact Details:');
    bodyLines.push(`Name: ${senderName || user?.name || '—'}`);
    bodyLines.push(`Email: ${senderEmail || user?.email || '—'}`);
    bodyLines.push(`Phone: ${senderPhone || '—'}`);
    bodyLines.push(`Preferred contact method: ${preferredContact}`);
    bodyLines.push('');
    bodyLines.push('Regards,');
    bodyLines.push(senderName || user?.name || '—');

    const subject = encodeURIComponent(`Inquiry about ${property.title}`);
    const body = encodeURIComponent(bodyLines.join('%0D%0A'));

    // Send via backend mailer (NodeMailer)
    setActionLoading(true);
    try {
      await contactOwnerApi({
        propertyId: property._id,
        name: senderName,
        email: senderEmail,
        phone: senderPhone,
        preferredContact,
        message,
      });
      alert('Message sent to owner. A confirmation email has been sent to you (if email provided).');
      navigate(-1);
    } catch (err) {
      console.error('Failed to send contact via server', err);
      alert(err.response?.data?.message || 'Failed to send message. Please try again later.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="container mx-auto py-12 text-center">Loading...</div>;
  if (error) return <div className="container mx-auto py-12 text-center text-red-600">{error}</div>;
  if (!property) return <div className="container mx-auto py-12 text-center">Property not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <button onClick={() => navigate(-1)} className="mb-4 text-blue-600">← Back</button>
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-3">Contact Owner</h2>
          <p className="text-gray-700 mb-4">Property: <strong>{property.title}</strong></p>

          <div className="mb-4">
            <p className="font-semibold">Owner</p>
            <p className="text-gray-700">{property.owner?.name || 'Owner'}</p>
            {property.owner?.email && (
              <a href={`mailto:${property.owner.email}`} className="text-blue-600 hover:underline">{property.owner.email}</a>
            )}
            {property.owner?.phone && (
              <div className="text-gray-700">{property.owner.phone}</div>
            )}
          </div>

          <form onSubmit={handleSend}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 font-semibold">Your Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full border p-3 rounded"
                  placeholder="Your full name"
                  required
                  disabled={actionLoading}
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Your Email</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full border p-3 rounded"
                  placeholder="you@example.com"
                  required
                  disabled={actionLoading}
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Phone</label>
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full border p-3 rounded"
                  placeholder="+91 9xxxxxxxxx"
                  disabled={actionLoading}
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Preferred contact</label>
                <select
                  value={preferredContact}
                  onChange={(e) => setPreferredContact(e.target.value)}
                  className="w-full border p-3 rounded"
                  disabled={actionLoading}
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="either">Either</option>
                </select>
              </div>
            </div>

            <label className="block mb-2 font-semibold">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="w-full border p-3 rounded mb-4" placeholder="Write a message to the owner..." required disabled={actionLoading} />

            <div className="flex gap-3">
              <button type="submit" disabled={actionLoading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60">
                {actionLoading ? 'Sending...' : 'Send Message'}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="bg-gray-200 px-4 py-2 rounded" disabled={actionLoading}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactOwner;

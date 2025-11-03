const Property = require('../models/Property');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// POST /api/contact
// body: { propertyId, name, email, phone, preferredContact, message }
const contactOwner = async (req, res) => {
  const { propertyId, name, email, phone, preferredContact, message } = req.body;

  if (!propertyId || !message) {
    return res.status(400).json({ message: 'propertyId and message are required' });
  }

  try {
    const property = await Property.findById(propertyId).populate('owner');
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const owner = property.owner;
    if (!owner || !owner.email) {
      return res.status(400).json({ message: 'Owner does not have an email configured' });
    }

    // Build HTML message for owner
    const html = `
      <p>Hello ${owner.name || 'Owner'},</p>
      <p>You have received a new inquiry for your property: <strong>${property.title}</strong>.</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br/>')}</p>
      <hr/>
      <p><strong>Sender details</strong></p>
      <ul>
        <li>Name: ${name || (req.user && req.user.name) || '—'}</li>
        <li>Email: ${email || (req.user && req.user.email) || '—'}</li>
        <li>Phone: ${phone || '—'}</li>
        <li>Preferred contact: ${preferredContact || 'email'}</li>
      </ul>
      <p>Property link: <a href="${process.env.APP_URL || 'http://localhost:5173'}/properties/${property._id}">${process.env.APP_URL || 'http://localhost:5173'}/properties/${property._id}</a></p>
      <p>Regards,<br/>StayEase</p>
    `;

    // Send email to owner
    await sendEmail({
      email: owner.email,
      subject: `New inquiry about your property: ${property.title}`,
      message: html,
    });

    // Optionally send confirmation to sender if email provided
    if (email) {
      const confHtml = `
        <p>Hi ${name || ''},</p>
        <p>Thanks for contacting the owner of <strong>${property.title}</strong>. Your message has been sent. The owner will contact you using the details you provided.</p>
        <p>Regards,<br/>StayEase</p>
      `;
      try {
        await sendEmail({ email, subject: `Your inquiry for ${property.title}`, message: confHtml });
      } catch (confErr) {
        // Log but don't fail the entire request
        console.error('Failed to send confirmation email to sender', confErr);
      }
    }

    return res.json({ message: 'Message sent to owner successfully' });
  } catch (err) {
    console.error('Contact owner error:', err);
    return res.status(500).json({ message: 'Failed to send message' });
  }
};

module.exports = { contactOwner };

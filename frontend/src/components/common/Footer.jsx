import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaHome,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    // Simulate subscription
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Our Team', path: '/team' },
      { label: 'Careers', path: '/careers' },
      { label: 'Press', path: '/press' },
      { label: 'Blog', path: '/blog' }
    ],
    support: [
      { label: 'Help Center', path: '/help' },
      { label: 'Contact Us', path: '/contact' },
      { label: 'FAQs', path: '/faq' },
      { label: 'Feedback', path: '/feedback' },
      { label: 'Report Issue', path: '/report' }
    ],
    legal: [
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Cookie Policy', path: '/cookies' },
      { label: 'Refund Policy', path: '/refund' },
      { label: 'Disclaimer', path: '/disclaimer' }
    ],
    services: [
      { label: 'For Tenants', path: '/tenants' },
      { label: 'For Landlords', path: '/landlords' },
      { label: 'Property Management', path: '/property-management' },
      { label: 'Pricing', path: '/pricing' },
      { label: 'Partnerships', path: '/partnerships' }
    ]
  };

  const socialLinks = [
    { icon: FaFacebookF, url: 'https://facebook.com', label: 'Facebook', color: 'hover:bg-blue-600' },
    { icon: FaTwitter, url: 'https://twitter.com', label: 'Twitter', color: 'hover:bg-sky-500' },
    { icon: FaInstagram, url: 'https://instagram.com', label: 'Instagram', color: 'hover:bg-pink-600' },
    { icon: FaLinkedinIn, url: 'https://linkedin.com', label: 'LinkedIn', color: 'hover:bg-blue-700' },
    { icon: FaYoutube, url: 'https://youtube.com', label: 'YouTube', color: 'hover:bg-red-600' }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 mt-auto">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FaHome className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-white">StayEase</h3>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Your trusted platform for finding the perfect rental home. We connect tenants with verified properties across India.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <FaMapMarkerAlt className="text-blue-500 flex-shrink-0" />
                <span>Kaithal, Haryana, India</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FaPhone className="text-blue-500 flex-shrink-0" />
                <a href="tel:+919466460761" className="hover:text-blue-400 transition">
                  +91 94664 60761
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FaEnvelope className="text-blue-500 flex-shrink-0" />
                <a href="mailto:officialamankundu@gmail.com" className="hover:text-blue-400 transition">
                  officialamankundu@gmail.com
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`bg-gray-700 p-3 rounded-lg transition ${social.color} text-white`}
                  aria-label={social.label}
                >
                  <social.icon className="text-lg" />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-blue-400 transition text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-blue-400 transition text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-blue-400 transition text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-blue-400 transition text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-white font-semibold text-xl mb-3">
              Subscribe to Our Newsletter
            </h4>
            <p className="text-gray-400 mb-6">
              Get the latest property listings and rental tips delivered to your inbox
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 relative has-left-icon">
                <FaEnvelope className="left-icon text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your email"
                  className="input-with-left-icon w-full pl-11 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                  disabled={subscribed}
                />
              </div>
              <button
                type="submit"
                disabled={subscribed}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {subscribed ? (
                  <>
                    <FaCheckCircle /> Subscribed!
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>

            {error && (
              <p className="mt-3 text-red-400 text-sm flex items-center justify-center gap-1">
                <FaExclamationCircle /> {error}
              </p>
            )}
            {subscribed && (
              <p className="mt-3 text-green-400 text-sm flex items-center justify-center gap-1">
                <FaCheckCircle /> Thank you for subscribing!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              &copy; {currentYear} StayEase. All rights reserved.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/terms" className="text-gray-400 hover:text-blue-400 transition">
                Terms
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/privacy" className="text-gray-400 hover:text-blue-400 transition">
                Privacy
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/cookies" className="text-gray-400 hover:text-blue-400 transition">
                Cookies
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/sitemap" className="text-gray-400 hover:text-blue-400 transition">
                Sitemap
              </Link>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Made with</span>
              <span className="text-red-500 animate-pulse">❤️</span>
              <span>in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


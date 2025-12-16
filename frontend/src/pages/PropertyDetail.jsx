import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaBed, 
  FaBath, 
  FaRulerCombined, 
  FaMapMarkerAlt, 
  FaHeart, 
  FaRegHeart, 
  FaCheckCircle,
  FaCouch,
  FaWifi,
  FaParking,
  FaDumbbell,
  FaSwimmingPool,
  FaShieldAlt,
  FaStar,
  FaShare,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { getPropertyById } from '../api/propertyService';
import { addFavorite, removeFavorite, isFavorite } from '../api/favoriteService';
import ReviewList from '../components/review/ReviewList';
import AddReview from '../components/review/AddReview';
import useAuth from '../hooks/useAuth';
const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth?.() || {};
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewsRefresh, setReviewsRefresh] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Fetch property and favorite status
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getPropertyById(id);
        const propertyData = res?.data || res;
        if (!propertyData) {
          setError('Property not found');
          setProperty(null);
          return;
        }
        setProperty(propertyData);
        setSelectedImage(0);

        if (user) {
          try {
            const favData = await isFavorite(id);
            setIsFav(Boolean(favData?.isFavorite));
          } catch (err) {
            console.error('Failed to check favorite status', err);
          }
        }
      } catch (err) {
        console.error('Failed to fetch property', err);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProperty();
  }, [id, user]);

  const handleFavoriteToggle = async () => {
    if (!user) {
      alert('Please login to add favorites');
      navigate('/login');
      return;
    }

    const prev = isFav;
    const newFav = !prev;
    setIsFav(newFav);
    setFavLoading(true);
    try {
      if (prev) {
        await removeFavorite(id);
      } else {
        await addFavorite(id);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
      // rollback on failure
      setIsFav(prev);
    } finally {
      setFavLoading(false);
    }
  };

  const nextImage = () => {
    if (property?.images?.length > 0) {
      setSelectedImage((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property?.images?.length > 0) {
      setSelectedImage((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const getAmenityIcon = (amenity) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <FaWifi />;
    if (lower.includes('parking')) return <FaParking />;
    if (lower.includes('gym')) return <FaDumbbell />;
    if (lower.includes('pool')) return <FaSwimmingPool />;
    if (lower.includes('furniture') || lower.includes('furnished')) return <FaCouch />;
    return <FaCheckCircle />;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard');
      setShowShareMenu(false);
    } catch (err) {
      console.error('Failed to copy', err);
      alert('Could not copy link');
    }
  };

  const handleShare = () => {
    setShowShareMenu((s) => !s);
  };

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/checkout/${id}`);
  };


  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center min-h-screen flex items-center justify-center">
        <div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto p-8 text-center min-h-screen flex items-center justify-center">
        <div>
          <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-4">{error || 'Property not found.'}</p>
          <button
            onClick={() => navigate('/properties')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  const images = property.images || [];
  const hasImages = images.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button & Actions */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back
          </button>
          <div className="relative">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-semibold"
            >
              <FaShare /> Share
            </button>
            {showShareMenu && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-4 w-48 z-10">
                <button
                  onClick={copyToClipboard}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                >
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Image Gallery */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="relative group">
            <img
              src={hasImages ? images[selectedImage].url : 'https://via.placeholder.com/800x500?text=No+Image'}
              alt={property.title}
              className="w-full h-96 object-cover cursor-pointer"
              onClick={() => setImageModalOpen(true)}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x500?text=Image+Not+Found';
              }}
            />
            
            {/* Image Navigation Arrows */}
            {hasImages && images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                >
                  <FaChevronLeft className="text-gray-800" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                >
                  <FaChevronRight className="text-gray-800" />
                </button>
                
                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImage + 1} / {images.length}
                </div>
              </>
            )}
            
            {/* Favorite Button */}
            <button
              onClick={handleFavoriteToggle}
              disabled={favLoading}
              className={`absolute top-4 right-4 p-3 rounded-full bg-white/90 hover:bg-white transition shadow-lg ${
                favLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isFav ? (
                <FaHeart size={24} className="text-red-500" />
              ) : (
                <FaRegHeart size={24} className="text-gray-700" />
              )}
            </button>

            {/* Availability Badge */}
            <div className="absolute top-4 left-4">
              {property.availability === 'available' && (
                <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Available
                </span>
              )}
              {property.availability === 'booked' && (
                <span className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Booked
                </span>
              )}
              {property.availability === 'maintenance' && (
                <span className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Maintenance
                </span>
              )}
            </div>

            {/* Verified Badge */}
            {property.isVerified && (
              <div className="absolute bottom-4 left-4 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                <FaShieldAlt />
                <span>Verified Property</span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {hasImages && images.length > 1 && (
            <div className="p-4 flex gap-4 overflow-x-auto bg-gray-100 scrollbar-thin scrollbar-thumb-gray-400">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`${property.title} - ${idx + 1}`}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-24 h-24 flex-shrink-0 object-cover rounded cursor-pointer transition ${
                    selectedImage === idx ? 'ring-4 ring-blue-500 scale-105' : 'hover:opacity-80'
                  }`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100?text=No+Img';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Location */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600 text-lg mb-3">
                    <FaMapMarkerAlt className="mr-2 text-blue-600" />
                    <span>
                      {property.address?.street && `${property.address.street}, `}
                      {property.address?.city}, {property.address?.state} - {property.address?.pincode}
                    </span>
                  </div>
                  
                  {/* Rating */}
                  {property.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <FaStar />
                        <span className="font-semibold text-gray-800">{property.rating.toFixed(1)}</span>
                      </div>
                      {property.reviewCount > 0 && (
                        <span className="text-gray-600 text-sm">
                          ({property.reviewCount} {property.reviewCount === 1 ? 'review' : 'reviews'})
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    ₹{property.price?.monthly?.toLocaleString() || 'N/A'}
                  </p>
                  <p className="text-gray-600">per month</p>
                </div>
              </div>

              {/* Property Type & Furnished */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                  {property.propertyType}
                </span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                  {property.furnished}
                </span>
                {property.floor && (
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                    Floor: {property.floor}
                  </span>
                )}
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FaBed className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{property.bedrooms || 0}</p>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FaBath className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{property.bathrooms || 0}</p>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FaRulerCombined className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{property.area || 0}</p>
                    <p className="text-sm text-gray-600">Sq Ft</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description || 'No description available.'}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                    >
                      <span className="text-green-600 text-xl">{getAmenityIcon(amenity)}</span>
                      <span className="text-gray-700 font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            {property.rules && property.rules.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Property Rules</h2>
                <ul className="space-y-2">
                  {property.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <FaCheckCircle className="text-blue-600 mt-1 flex-shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Booking & Contact */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-4">Booking Details</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Monthly Rent</span>
                  <span className="font-semibold">₹{property.price?.monthly?.toLocaleString()}</span>
                </div>
                {property.price?.security > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Security Deposit</span>
                    <span className="font-semibold">₹{property.price?.security?.toLocaleString()}</span>
                  </div>
                )}
                {property.price?.maintenance > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Maintenance</span>
                    <span className="font-semibold">₹{property.price?.maintenance?.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-blue-600 text-lg">
                    ₹{((property.price?.monthly || 0) + (property.price?.security || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              {property.availability === 'available' ? (
                <button
                  onClick={handleBookNow}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-semibold shadow-lg flex items-center justify-center gap-2"
                >
                  <FaCalendarAlt />
                  Book Now
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-400 text-white py-3 rounded-lg font-semibold cursor-not-allowed"
                >
                  Not Available
                </button>
              )}

              <p className="text-xs text-gray-500 mt-3 text-center">
                * Security deposit will be refunded
              </p>
            </div>

            {/* Owner Info */}
            {property.owner && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Contact Owner</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">
                        {property.owner.name?.[0]?.toUpperCase() || 'O'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {property.owner.name || 'Property Owner'}
                      </p>
                      <p className="text-sm text-gray-600">Owner</p>
                    </div>
                  </div>
                  
                  {property.owner.email && (
                    <a
                      href={`mailto:${property.owner.email}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <FaEnvelope />
                      {property.owner.email}
                    </a>
                  )}
                  
                  {property.owner.phone && (
                    <a
                      href={`tel:${property.owner.phone}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <FaPhone />
                      {property.owner.phone}
                    </a>
                  )}

                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/login');
                        return;
                      }
                      navigate(`/contact-owner/${property._id}`);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition mt-3"
                  >
                    Contact Owner
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Reviews & Ratings</h2>
          <ReviewList key={reviewsRefresh} propertyId={property._id} />
          {user ? (
            <div className="mt-6">
              <AddReview
                propertyId={property._id}
                onReviewAdded={() => setReviewsRefresh((prev) => !prev)}
              />
            </div>
          ) : (
            <div className="mt-6 text-center bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-700 mb-3">
                Want to share your experience?
              </p>
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                Login to add a review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;

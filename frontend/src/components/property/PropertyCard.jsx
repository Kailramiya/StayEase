import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBed, 
  FaBath, 
  FaRulerCombined, 
  FaStar, 
  FaMapMarkerAlt, 
  FaHeart, 
  FaRegHeart, 
  FaCheckCircle,
  FaCouch,
  FaParking,
  FaWifi,
  FaSnowflake,
  FaHome,
  FaBuilding,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { addFavorite, removeFavorite } from '../../api/favoriteService';
import useAuth from '../../hooks/useAuth';

const PropertyCard = ({ property, isFavorite = false, onFavoriteToggle }) => {
  const { user } = useAuth?.() || {};
  const [favorite, setFavorite] = useState(Boolean(isFavorite));
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Carousel state
  const images = Array.isArray(property.images)
    ? property.images.map((img) => (typeof img === 'string' ? img : img.url)).filter(Boolean)
    : [];
  const defaultImage = images[0] || property.images || '/placeholder.jpg';
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayRef = useRef(null);

  useEffect(() => {
    // reset index when images change
    setIndex(0);
  }, [property._id, images.length]);

  // Keep local favorite state in sync with parent prop and auth changes
  useEffect(() => {
    setFavorite(Boolean(isFavorite));
  }, [isFavorite, property._id]);

  // If user logs out, ensure favorite UI is cleared
  useEffect(() => {
    if (!user) setFavorite(false);
  }, [user]);

  useEffect(() => {
    // autoplay when multiple images available
    if (images.length <= 1) return;

    const startAutoplay = () => {
      clearInterval(autoplayRef.current);
      autoplayRef.current = setInterval(() => {
        setIndex((prev) => (prev + 1) % images.length);
      }, 4000); // change slide every 4s
    };

    if (!isPaused) startAutoplay();

    return () => clearInterval(autoplayRef.current);
  }, [images.length, isPaused]);

  const goPrev = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goNext = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIndex((prev) => (prev + 1) % images.length);
  };

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const handleFavoriteToggle = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!user) {
      alert('Please login to add favorites');
      return;
    }

    // read stored user from cookie (fall back to context user)
    const storedUser = (() => {
      try {
        const cookieVal = document.cookie.match(/(?:^|; )user=([^;]+)/);
        if (!cookieVal) return null;
        return JSON.parse(decodeURIComponent(cookieVal[1]));
      } catch (err) {
        return null;
      }
    })();

    if (!storedUser || !storedUser.token) {
      setLoading(false);
      alert('Your session appears to be expired. Please login again and try adding favorites.');
      return;
    }

    // Optimistic UI update: toggle locally first, then call API. Rollback on error.
    const prev = favorite;
    const newFav = !prev;
    setFavorite(newFav);
    if (onFavoriteToggle) onFavoriteToggle(property._id, newFav);
    setLoading(true);
    try {
      if (prev) {
        // was favorite, now remove
        await removeFavorite(property._id);
      } else {
        await addFavorite(property._id);
      }
    } catch (error) {
      // Rollback
      console.error('Failed to toggle favorite (optimistic):', error);
      setFavorite(prev);
      if (onFavoriteToggle) onFavoriteToggle(property._id, prev);
      const errMsg = error?.response?.data?.message || error?.message || 'Failed to update favorites. Please try again.';
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityConfig = () => {
    const configs = {
      available: {
        bg: 'bg-green-500',
        text: 'Available',
        icon: FaCheckCircle,
        pulse: true
      },
      booked: {
        bg: 'bg-yellow-500',
        text: 'Booked',
        icon: null,
        pulse: false
      },
      maintenance: {
        bg: 'bg-gray-500',
        text: 'Maintenance',
        icon: null,
        pulse: false
      }
    };
    return configs[property.availability] || configs.available;
  };

  const getPropertyTypeIcon = () => {
    const type = property.propertyType?.toLowerCase();
    if (type?.includes('villa') || type?.includes('house')) return FaHome;
    return FaBuilding;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const availability = getAvailabilityConfig();
  const PropertyTypeIcon = getPropertyTypeIcon();

  return (
    <div className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
      <Link to={`/properties/${property._id}`}>
        {/* Image / Carousel Section */}
        <div
          className="relative h-56 overflow-hidden bg-gray-200"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          )}

          <img
            src={images[index] || defaultImage}
            alt={property.title}
            className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              setImageError(true);
              setImageLoading(false);
              e.target.src = 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image';
            }}
          />

          {/* Prev/Next buttons (only if multiple images) */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-white/90 hover:bg-white shadow-md rounded-full transition opacity-90"
                aria-label="Previous image"
              >
                <FaChevronLeft className="text-gray-700" />
              </button>

              <button
                type="button"
                onClick={goNext}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-white/90 hover:bg-white shadow-md rounded-full transition opacity-90"
                aria-label="Next image"
              >
                <FaChevronRight className="text-gray-700" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e?.preventDefault();
                      e?.stopPropagation();
                      setIndex(i);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    aria-label={`Go to image ${i + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition ${i === index ? 'bg-white' : 'bg-white/60'}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Price Badge */}
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg backdrop-blur-sm">
              {formatPrice(property.price?.monthly || 0)} / mo
            </div>
          </div>

          {/* Availability Badge */}
          <div className="absolute top-3 right-14 z-10">
            <div className={`${availability.bg} text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-sm ${availability.pulse ? 'animate-pulse' : ''}`}>
              {availability.icon && <availability.icon size={12} />}
              <span>{availability.text}</span>
            </div>
          </div>

          {/* Verified Badge */}
          {property.isVerified && (
            <div className="absolute bottom-3 left-3 z-10 bg-gradient-to-r from-green-600 to-green-700 text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-lg backdrop-blur-sm">
              <FaCheckCircle size={11} />
              <span>Verified</span>
            </div>
          )}

          {/* Image Count Badge */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 z-10 bg-black/60 text-white px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-sm">
              {index + 1}/{images.length}
            </div>
          )}

          {/* Favorite Button */}
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={handleFavoriteToggle}
            disabled={loading}
            className={`absolute top-3 right-3 z-10 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${favorite ? 'bg-white/95 shadow-lg scale-110' : 'bg-white/80 hover:bg-white hover:shadow-lg hover:scale-110'} ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {favorite ? (
              <FaHeart size={20} className="text-red-500 animate-pulse" />
            ) : (
              <FaRegHeart size={20} className="text-gray-700 group-hover:text-red-500 transition-colors" />
            )}
          </button>
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Property Type & Title */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <PropertyTypeIcon className="text-blue-600 text-sm" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {property.propertyType || 'Apartment'}
              </span>
            </div>
            <h3 className="font-bold text-lg text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
              {property.title}
            </h3>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2 text-gray-600 text-sm mb-4">
            <FaMapMarkerAlt className="text-blue-600 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">
              {property.address?.street && `${property.address.street}, `}
              {property.address?.city}, {property.address?.state}
              {property.address?.pincode && ` - ${property.address.pincode}`}
            </span>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-100">
            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
              <FaBed className="text-gray-600 text-lg mb-1" />
              <span className="text-xs font-semibold text-gray-700">{property.bedrooms || 0}</span>
              <span className="text-xs text-gray-500">Beds</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
              <FaBath className="text-gray-600 text-lg mb-1" />
              <span className="text-xs font-semibold text-gray-700">{property.bathrooms || 0}</span>
              <span className="text-xs text-gray-500">Baths</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
              <FaRulerCombined className="text-gray-600 text-lg mb-1" />
              <span className="text-xs font-semibold text-gray-700">{property.area || 0}</span>
              <span className="text-xs text-gray-500">sqft</span>
            </div>
          </div>

          {/* Amenities Preview */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {property.amenities.includes('WiFi') && (
                <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                  <FaWifi size={10} />
                  <span>WiFi</span>
                </div>
              )}
              {property.amenities.includes('Parking') && (
                <div className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                  <FaParking size={10} />
                  <span>Parking</span>
                </div>
              )}
              {property.amenities.includes('AC') && (
                <div className="flex items-center gap-1 text-xs bg-cyan-50 text-cyan-700 px-2 py-1 rounded-full">
                  <FaSnowflake size={10} />
                  <span>AC</span>
                </div>
              )}
              {property.amenities.length > 3 && (
                <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                  +{property.amenities.length - 3} more
                </div>
              )}
            </div>
          )}

          {/* Bottom Section */}
          <div className="flex items-center justify-between">
            {/* Furnished Status */}
            <div className="flex items-center gap-1.5">
              <FaCouch className="text-gray-500 text-sm" />
              <span className="text-xs font-medium text-gray-700 capitalize">
                {property.furnished || 'Semi-furnished'}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-400 text-sm" />
              <span className="text-sm font-semibold text-gray-800">
                {property.rating ? property.rating.toFixed(1) : '0.0'}
              </span>
              <span className="text-xs text-gray-500">
                ({property.numReviews || 0})
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Hover Effect Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </div>
  );
};

export default PropertyCard;

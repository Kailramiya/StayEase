const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load .env reliably whether the script is run from repo root or /backend
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '..', '..', '.env'),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const User = require('../models/User');
const Property = require('../models/Property');
const Review = require('../models/Review');
const Booking = require('../models/Booking');

const MONGO =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  process.env.MONGO ||
  'mongodb://127.0.0.1:27017/stayease';

const maskMongoUri = (uri) => {
  if (!uri || typeof uri !== 'string') return String(uri);
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^@]+)@/i, '$1***@');
};

async function connect() {
  if (!MONGO || !String(MONGO).trim()) {
    throw new Error('Missing Mongo connection string. Set MONGO_URI in your .env.');
  }
  console.log('cwd:', process.cwd());
  console.log('Mongo URI (masked):', maskMongoUri(MONGO));
  await mongoose.connect(MONGO);
  console.log('✅ Mongo connected');
}

async function getOrCreateOwner() {
  let owner = await User.findOne({ email: 'owner@stayease.in' });
  if (!owner) {
    owner = await User.create({
      name: 'StayEase Demo Owner',
      email: 'owner@stayease.in',
      password: 'Password123!',
      phone: '9999999999',
      role: 'owner',
    });
    console.log('👤 Demo owner created');
  }
  return owner._id;
}

const indianNames = [
  'Aarav Mehta',
  'Ananya Sharma',
  'Rohan Gupta',
  'Ishita Verma',
  'Kabir Singh',
  'Priya Nair',
  'Vikram Iyer',
  'Neha Kapoor',
  'Sanya Mishra',
  'Aditya Rao',
  'Simran Kaur',
  'Rahul Jain',
];

async function getOrCreateDemoUsers(count = 12) {
  const users = [];
  const target = Math.max(1, Number(count) || 1);

  for (let i = 0; i < target; i++) {
    // NOTE: seed.js clears users by /demo\+/. Keep these separate so they persist.
    const email = `indiauser+${i + 1}@stayease.in`;
    let user = await User.findOne({ email });

    if (!user) {
      const fallbackName = indianNames[i] || faker.person.fullName();
      user = await User.create({
        name: fallbackName,
        email,
        password: 'Password123!',
        phone: `9${faker.string.numeric(9)}`,
        role: 'user',
        isVerified: true,
      });
      console.log(`👤 Demo user created: ${email}`);
    }

    users.push(user);
  }

  return users;
}

const indianProperties = [
  // ================= BANGALORE =================
  {
    title: 'Fully Furnished 2BHK in Indiranagar',
    description:
      'Modern 2BHK apartment near metro, cafes and tech parks. Ideal for working professionals.',
    propertyType: 'apartment',
    address: {
      street: '100 Feet Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560038',
      country: 'India',
    },
    location: { type: 'Point', coordinates: [77.6408, 12.9719] },
    price: { monthly: 32000, security: 64000 },
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    furnished: 'fully-furnished',
    amenities: ['Wifi', 'AC', 'Parking', 'Elevator', 'Power Backup'],
    images: [
      { url: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6' },
      { url: 'https://images.unsplash.com/photo-1501183638710-841dd1904471' },
      { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2' },
    ],
    views: 240,
    isVerified: true,
  },
  {
    title: 'Affordable 1BHK near Whitefield IT Park',
    description:
      'Budget-friendly 1BHK suitable for single professionals working in IT corridor.',
    propertyType: 'apartment',
    address: {
      street: 'ITPL Main Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560066',
      country: 'India',
    },
    location: { type: 'Point', coordinates: [77.7500, 12.9698] },
    price: { monthly: 16000, security: 32000 },
    bedrooms: 1,
    bathrooms: 1,
    area: 550,
    furnished: 'semi-furnished',
    amenities: ['Parking', 'Security'],
    images: [
      { url: 'https://images.unsplash.com/photo-1494526585095-c41746248156' },
    ],
    views: 410,
    isVerified: true,
  },

  // ================= DELHI =================
  {
    title: 'Spacious 3BHK in South Delhi',
    description:
      'Premium locality with parks and markets nearby. Family-friendly apartment.',
    propertyType: 'house',
    address: {
      street: 'Greater Kailash',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110048',
      country: 'India',
    },
    location: { type: 'Point', coordinates: [77.2428, 28.5284] },
    price: { monthly: 42000, security: 84000 },
    bedrooms: 3,
    bathrooms: 2,
    area: 1600,
    furnished: 'fully-furnished',
    amenities: ['AC', 'Parking', 'Power Backup', 'Security'],
    images: [
      { url: 'https://images.unsplash.com/photo-1472224371017-08207f84aaae' },
    ],
    views: 180,
    isVerified: true,
  },

  // ================= HYDERABAD =================
  {
    title: '2BHK near Hitech City',
    description:
      'Ideal for tech employees. Close to offices, supermarkets, and gyms.',
    propertyType: 'apartment',
    address: {
      street: 'Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      country: 'India',
    },
    location: { type: 'Point', coordinates: [78.3826, 17.4483] },
    price: { monthly: 25000, security: 50000 },
    bedrooms: 2,
    bathrooms: 2,
    area: 1050,
    furnished: 'semi-furnished',
    amenities: ['Wifi', 'AC', 'Parking'],
    images: [
      { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267' },
    ],
    views: 330,
    isVerified: true,
  },

  // ================= PUNE =================
  {
    title: 'PG for Working Professionals in Hinjewadi',
    description:
      'Clean and well-managed PG with meals included. Ideal for IT professionals.',
    propertyType: 'pg',
    address: {
      street: 'Phase 1',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411057',
      country: 'India',
    },
    location: { type: 'Point', coordinates: [73.6847, 18.5913] },
    price: { monthly: 9000, security: 9000 },
    bedrooms: 1,
    bathrooms: 1,
    area: 300,
    furnished: 'fully-furnished',
    amenities: ['Wifi', 'Meals', 'Security'],
    images: [
      { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c' },
    ],
    views: 520,
    isVerified: true,
  },
];

const indianCities = [
  { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867 },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777 },
  { city: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.209 },
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { city: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lng: 77.391 },
  { city: 'Gurgaon', state: 'Haryana', lat: 28.4595, lng: 77.0266 },
  { city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
  { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
];

const localitiesByCity = {
  Bangalore: ['Indiranagar', 'Whitefield', 'Koramangala', 'HSR Layout', 'Bellandur', 'Marathahalli'],
  Hyderabad: ['Madhapur', 'Gachibowli', 'Kondapur', 'Jubilee Hills', 'Hitech City'],
  Pune: ['Hinjewadi', 'Viman Nagar', 'Kharadi', 'Baner', 'Wakad'],
  Mumbai: ['Andheri', 'Powai', 'Bandra', 'Goregaon', 'Thane'],
  Delhi: ['Saket', 'Greater Kailash', 'Dwarka', 'Rohini', 'Lajpat Nagar'],
  Chennai: ['OMR', 'T Nagar', 'Adyar', 'Velachery', 'Guindy'],
  Noida: ['Sector 62', 'Sector 18', 'Sector 137', 'Sector 76', 'Sector 50'],
  Gurgaon: ['Sector 57', 'DLF Phase 3', 'Sohna Road', 'Golf Course Road', 'Sector 45'],
  Indore: ['Vijay Nagar', 'Palasia', 'Rau', 'Scheme 54', 'Super Corridor'],
  Jaipur: ['Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'C Scheme', 'Jagatpura'],
};

const sampleImages = [
  'https://images.unsplash.com/photo-1501183638710-841dd1904471',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
  'https://images.unsplash.com/photo-1494526585095-c41746248156',
  'https://images.unsplash.com/photo-1472224371017-08207f84aaae',
];

const amenityPool = [
  'Wifi',
  'AC',
  'Kitchen',
  'Power Backup',
  'Parking',
  'Lift',
  'Security',
  'Gym',
  'Balcony',
];

const generatedPropertyTypes = ['apartment', 'studio', 'house', 'villa', 'pg'];
const furnishedOptions = ['fully-furnished', 'semi-furnished', 'unfurnished'];

const stableNumber = (seed, min, max) => {
  const span = Math.max(1, max - min + 1);
  return min + (Math.abs(seed) % span);
};

function buildGeneratedIndianProperties(perCity = 5) {
  const countPerCity = Math.max(1, Number(perCity) || 1);
  const generated = [];

  for (let cityIdx = 0; cityIdx < indianCities.length; cityIdx++) {
    const cityObj = indianCities[cityIdx];
    const city = cityObj.city;
    const localities = localitiesByCity[city] || [city];

    for (let i = 0; i < countPerCity; i++) {
      const seed = cityIdx * 1000 + i * 97;
      const locality = localities[i % localities.length];
      const propertyType = generatedPropertyTypes[(cityIdx + i) % generatedPropertyTypes.length];
      const furnished = furnishedOptions[(cityIdx + i) % furnishedOptions.length];

      const bedrooms =
        propertyType === 'pg' || propertyType === 'studio'
          ? 1
          : stableNumber(seed + 3, 1, 4);
      const bathrooms =
        propertyType === 'pg'
          ? 1
          : stableNumber(seed + 7, 1, Math.min(3, Math.max(1, bedrooms)));
      const area =
        propertyType === 'pg'
          ? stableNumber(seed + 11, 220, 450)
          : stableNumber(seed + 13, 450, 2200);

      const monthly =
        propertyType === 'pg'
          ? stableNumber(seed + 17, 6500, 14000)
          : stableNumber(seed + 19, 12000, 65000);

      const views = stableNumber(seed + 23, 25, 850);
      const rating = Number((3.6 + stableNumber(seed + 29, 0, 12) * 0.1).toFixed(1));

      const latOffset = ((i % 5) - 2) * 0.01;
      const lngOffset = (((cityIdx + i) % 5) - 2) * 0.01;
      const lat = Number((cityObj.lat + latOffset).toFixed(4));
      const lng = Number((cityObj.lng + lngOffset).toFixed(4));

      const title = `StayEase ${propertyType.toUpperCase()} • ${locality} • ${city} #${i + 1}`;

      generated.push({
        title,
        description:
          'Professionally managed monthly rental with reliable amenities, good connectivity, and a practical layout for day-to-day living.',
        propertyType,
        address: {
          street: `${stableNumber(seed + 31, 10, 220)} ${locality} Road`,
          city,
          state: cityObj.state,
          pincode: String(100000 + stableNumber(seed + 37, 1000, 899999)).slice(0, 6),
          country: 'India',
        },
        location: { type: 'Point', coordinates: [lng, lat] },
        price: {
          monthly,
          security: propertyType === 'pg' ? monthly : monthly * stableNumber(seed + 41, 1, 3),
        },
        bedrooms,
        bathrooms,
        area,
        furnished,
        amenities: sampleUnique(amenityPool, stableNumber(seed + 43, 4, 7)).concat(
          propertyType === 'pg' ? ['Meals'] : []
        ),
        images: Array.from({ length: 4 }).map((_, imgIdx) => ({
          url: `${sampleImages[(seed + imgIdx) % sampleImages.length]}?auto=format&fit=crop&w=1200&q=60&sig=${cityIdx}-${i}-${imgIdx}`,
          public_id: '',
        })),
        views,
        isVerified: true,
        rating,
      });
    }
  }

  return generated;
}

async function insertProperties(ownerId, propertyList) {
  const properties = [];

  for (const p of propertyList) {
    let property = await Property.findOne({
      title: p.title,
      'address.city': p.address.city,
    });

    if (!property) {
      property = await Property.create({
        ...p,
        owner: ownerId,
        availability: 'available',
      });

      console.log(`🏠 Added: ${p.title}`);
    } else {
      console.log(`⚠️ Skipped (exists): ${p.title}`);
    }

    properties.push(property);
  }

  return properties;
}

const randInt = (min, max) => {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
};

const sampleUnique = (arr, count) => {
  const copy = [...arr];
  const result = [];
  const target = Math.min(count, copy.length);
  for (let i = 0; i < target; i++) {
    const idx = randInt(0, copy.length - 1);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
};

const reviewTemplates = [
  'Great place. Clean, quiet, and exactly as shown in the photos.',
  'Smooth check-in and a very comfortable stay. Would recommend.',
  'Good value for money and a convenient location for commuting.',
  'Well maintained property with helpful owner. Enjoyed the stay.',
  'Nice locality and amenities. Overall a solid experience.',
];

async function addReviewsAndBookings(properties, users) {
  for (const property of properties) {
    console.log(`\n🔧 Seeding reviews/bookings for: ${property.title} (${property.address?.city || '—'})`);

    // REVIEWS
    const desiredReviews = randInt(2, Math.min(6, users.length));
    const reviewers = sampleUnique(users, desiredReviews);

    for (const reviewer of reviewers) {
      const already = await Review.findOne({ user: reviewer._id, property: property._id });
      if (already) continue;

      const rating = randInt(3, 5);
      const comment = reviewTemplates[randInt(0, reviewTemplates.length - 1)];

      await Review.create({
        user: reviewer._id,
        property: property._id,
        rating,
        comment,
      });
    }

    // Recompute rating + numReviews from DB for correctness
    const reviews = await Review.find({ property: property._id }).select('rating');
    const numReviews = reviews.length;
    const avgRating =
      numReviews === 0
        ? property.rating
        : Number(
            (
              reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
              numReviews
            ).toFixed(1)
          );

    await Property.updateOne(
      { _id: property._id },
      { $set: { numReviews, rating: avgRating } }
    );

    console.log(`⭐ Reviews: ${numReviews} | Rating: ${avgRating}`);

    // BOOKINGS
    const desiredBookings = randInt(1, Math.min(3, users.length));
    const bookers = sampleUnique(users, desiredBookings);

    for (const booker of bookers) {
      const already = await Booking.findOne({ user: booker._id, property: property._id });
      if (already) continue;

      const startInDays = randInt(1, 21);
      const checkIn = new Date(Date.now() + startInDays * 24 * 60 * 60 * 1000);
      const days = randInt(30, 120);
      const checkOut = new Date(checkIn.getTime() + days * 24 * 60 * 60 * 1000);
      const dailyPrice = Math.ceil((property.price?.monthly || 0) / 30) || 0;
      const totalPrice = dailyPrice * days;

      await Booking.create({
        user: booker._id,
        property: property._id,
        checkIn,
        checkOut,
        days,
        months: Math.ceil(days / 30),
        totalPrice,
        status: 'confirmed',
      });
    }

    const bookingsCount = await Booking.countDocuments({ property: property._id });
    await Property.updateOne({ _id: property._id }, { $set: { bookingsCount } });

    console.log(`📦 Bookings: ${bookingsCount}`);
  }
}

async function run() {
  await connect();
  try {
    const ownerId = await getOrCreateOwner();
    const demoUsers = await getOrCreateDemoUsers(Number(process.env.INDIA_DEMO_USERS || 30));

    // At least 50 properties by default: 10 cities * 5 each
    const perCity = Number(process.env.INDIA_PROPERTIES_PER_CITY || 5);
    const generated = buildGeneratedIndianProperties(perCity);

    // Include the curated set + generated set
    const allProperties = [...indianProperties, ...generated];
    const properties = await insertProperties(ownerId, allProperties);

    await addReviewsAndBookings(properties, demoUsers);
    console.log('✅ Indian demo data added (users, properties, reviews, bookings)');
  } finally {
    await mongoose.connection.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

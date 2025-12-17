// Seed database with realistic Indian demo data aligned with schemas
require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

const Property = require('../models/Property');
const User = require('../models/User');
const Review = require('../models/Review');
const Booking = require('../models/Booking');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stayease';

const NUM_PROPERTIES = Number(process.env.SEED_PROPERTIES || 120);
const NUM_USERS = Number(process.env.SEED_USERS || 30);
const IMAGES_PER_PROPERTY = 5;

/* ------------------ INDIA DATA ------------------ */

const indianCities = [
  { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
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

const sampleImages = [
  'https://images.unsplash.com/photo-1501183638710-841dd1904471',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
  'https://images.unsplash.com/photo-1494526585095-c41746248156',
  'https://images.unsplash.com/photo-1472224371017-08207f84aaae',
];

const propertyTypes = ['apartment', 'house', 'villa', 'studio', 'pg'];
const furnishedOptions = ['fully-furnished', 'semi-furnished', 'unfurnished'];
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

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ------------------ DB ------------------ */

async function connect() {
  await mongoose.connect(MONGO);
  console.log('✅ Mongo connected');
}

async function clearCollections() {
  await Promise.all([
    Property.deleteMany({}),
    User.deleteMany({ email: /demo\+/ }),
    Review.deleteMany({}),
    Booking.deleteMany({}),
  ]);
  console.log('🧹 Old demo data cleared');
}

/* ------------------ FACTORIES ------------------ */

function makeUser(i) {
  return {
    name: faker.person.fullName(),
    email: `demo+${i}@stayease.in`,
    password: 'Password123!',
    phone: `9${faker.string.numeric(9)}`,
    role: 'user',
  };
}

function makeProperty(ownerId) {
  const cityObj = randomFrom(indianCities);

  const lat =
    cityObj.lat +
    faker.number.float({ min: -0.05, max: 0.05, multipleOf: 0.0001 });

  const lng =
    cityObj.lng +
    faker.number.float({ min: -0.05, max: 0.05, multipleOf: 0.0001 });

  const monthly = faker.number.int({ min: 7000, max: 45000 });

  return {
    title: `${faker.company.catchPhrase()} in ${cityObj.city}`,
    description: faker.lorem.paragraphs({ min: 1, max: 2 }),
    propertyType: randomFrom(propertyTypes),
    address: {
      street: faker.location.streetAddress(),
      city: cityObj.city,
      state: cityObj.state,
      pincode: faker.string.numeric(6),
      country: 'India',
    },
    location: {
      type: 'Point',
      coordinates: [lng, lat],
    },
    price: {
      monthly,
      security: monthly * faker.number.int({ min: 1, max: 3 }),
    },
    amenities: faker.helpers.arrayElements(amenityPool, { min: 4, max: 7 }),
    images: Array.from({ length: IMAGES_PER_PROPERTY }).map(() => ({
      url: `${randomFrom(sampleImages)}?auto=format&fit=crop&w=1200&q=60&sig=${faker.string.uuid()}`,
      public_id: '',
    })),
    bedrooms: faker.number.int({ min: 1, max: 4 }),
    bathrooms: faker.number.int({ min: 1, max: 3 }),
    area: faker.number.int({ min: 350, max: 2200 }),
    furnished: randomFrom(furnishedOptions),
    availability: 'available',
    owner: ownerId,
    isVerified: faker.datatype.boolean(),

    // AI signals
    views: faker.number.int({ min: 20, max: 400 }),
    bookingsCount: faker.number.int({ min: 1, max: 40 }),
    rating: Number(
      faker.number.float({ min: 3.6, max: 4.9, multipleOf: 0.1 }).toFixed(1)
    ),
  };
}

function makeReview(userId, propertyId) {
  return {
    user: userId,
    property: propertyId,
    rating: faker.number.int({ min: 3, max: 5 }),
    comment: faker.lorem.sentences({ min: 1, max: 3 }),
  };
}

/* ------------------ SEED ------------------ */

async function seed() {
  await connect();
  await clearCollections();

  // USERS
  const users = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const user = new User(makeUser(i));
    await user.save();
    users.push(user);
  }
  console.log('👤 Users created:', users.length);

  // PROPERTIES
  const properties = [];
  for (let i = 0; i < NUM_PROPERTIES; i++) {
    const owner = randomFrom(users);
    const property = new Property(makeProperty(owner._id));
    await property.save();
    properties.push(property);
    if (i % 15 === 0) console.log('🏠 Seeded properties:', i);
  }
  console.log('🏠 Properties created:', properties.length);

  // REVIEWS
  for (const prop of properties) {
    const numReviews = faker.number.int({ min: 2, max: 6 });
    let sum = 0;
    for (let i = 0; i < numReviews; i++) {
      const reviewer = randomFrom(users);
      const review = new Review(makeReview(reviewer._id, prop._id));
      sum += review.rating;
      await review.save();
    }
    prop.numReviews = numReviews;
    prop.rating = Number((sum / numReviews).toFixed(1));
    await prop.save();
  }
  console.log('⭐ Reviews created');

  // BOOKINGS (FIXED: uses `days`)
  for (let i = 0; i < 45; i++) {
    const property = randomFrom(properties);
    const user = randomFrom(users);

    const checkIn = faker.date.soon({ days: 30 });
    const checkOut = faker.date.soon({ days: faker.number.int({ min: 60, max: 180 }) });

    const days = Math.max(
      1,
      Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    );

    const dailyPrice = Math.ceil(property.price.monthly / 30);
    const totalPrice = days * dailyPrice;

    const booking = new Booking({
      property: property._id,
      user: user._id,
      checkIn,
      checkOut,
      days,
      totalPrice,
      status: 'confirmed',
    });

    await booking.save();
  }
  console.log('📦 Bookings created');

  await mongoose.connection.close();
  console.log('✅ Seeding complete');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

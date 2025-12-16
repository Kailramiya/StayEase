// Seed database with realistic demo data aligned with current schemas
require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const Property = require('../models/Property');
const User = require('../models/User');
const Review = require('../models/Review');
const Booking = require('../models/Booking');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stayease';

const NUM_PROPERTIES = Number(process.env.SEED_PROPERTIES || 100);
const NUM_USERS = Number(process.env.SEED_USERS || 25);
const IMAGES_PER_PROPERTY = 5;

const sampleImages = [
  'https://images.unsplash.com/photo-1501183638710-841dd1904471',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6',
  'https://images.unsplash.com/photo-1472224371017-08207f84aaae',
  'https://images.unsplash.com/photo-1494526585095-c41746248156',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
];

const propertyTypes = ['apartment', 'house', 'villa', 'studio', 'pg', 'hostel'];
const furnishedOptions = ['fully-furnished', 'semi-furnished', 'unfurnished'];
const amenityPool = ['Wifi', 'AC', 'Kitchen', 'Washer', 'TV', 'Parking', 'Gym', 'Pool', 'Elevator', 'Pet Friendly'];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function connect() {
  await mongoose.connect(MONGO);
  console.log('Mongo connected');
}

async function clearCollections() {
  await Promise.all([
    Property.deleteMany({}),
    User.deleteMany({}),
    Review.deleteMany({}),
    Booking.deleteMany({}),
  ]);
  console.log('Collections cleared');
}

function makeUser(i) {
  return {
    name: faker.person.fullName(),
    email: `demo+${i}@example.com`,
    password: 'Password123!',
    phone: faker.string.numeric(10),
    role: 'user',
  };
}

function makePropertyBase(ownerId) {
  const city = faker.location.city();
  const state = faker.location.state();
  const street = faker.location.streetAddress();
  const pincode = faker.string.numeric(6);

  const monthly = faker.number.int({ min: 5000, max: 40000 });
  const security = Math.floor(monthly * faker.number.float({ min: 1.0, max: 2.5 }));

  const lat = Number(faker.location.latitude({ min: 8, max: 37.5, precision: 4 }));
  const lng = Number(faker.location.longitude({ min: 68.7, max: 97.25, precision: 4 }));

  const amenities = faker.helpers.arrayElements(amenityPool, { min: 3, max: 7 });

  const images = Array.from({ length: IMAGES_PER_PROPERTY }).map((_, idx) => ({
    url: `${randomFrom(sampleImages)}?auto=format&fit=crop&w=1200&q=60&sig=${faker.string.uuid()}`,
    public_id: '',
  }));

  return {
    title: `${faker.company.catchPhrase()} in ${city}`,
    description: faker.lorem.paragraphs({ min: 1, max: 2 }),
    propertyType: randomFrom(propertyTypes),
    address: { street, city, state, pincode, country: 'India' },
    location: { type: 'Point', coordinates: [lng, lat] },
    price: { monthly, security },
    amenities,
    images,
    bedrooms: faker.number.int({ min: 1, max: 4 }),
    bathrooms: faker.number.int({ min: 1, max: 3 }),
    area: faker.number.int({ min: 350, max: 2200 }),
    furnished: randomFrom(furnishedOptions),
    availability: 'available',
    owner: ownerId,
    isVerified: faker.datatype.boolean(),
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

function diffInMonths(a, b) {
  const ms = Math.abs(b - a);
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24 * 30)));
}

async function seed() {
  await connect();
  await clearCollections();

  // Create demo users
  const users = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const u = new User(makeUser(i));
    await u.save();
    users.push(u);
  }
  console.log('Users created:', users.length);

  // Create properties
  const properties = [];
  for (let i = 0; i < NUM_PROPERTIES; i++) {
    const owner = randomFrom(users);
    const p = new Property(makePropertyBase(owner._id));
    await p.save();
    properties.push(p);
    if (i % 10 === 0) console.log('Seeded properties:', i);
  }
  console.log('Properties created:', properties.length);

  // Create reviews per property (1-5), then backfill rating/numReviews
  for (const prop of properties) {
    const numReviews = faker.number.int({ min: 1, max: 5 });
    let sum = 0;
    for (let r = 0; r < numReviews; r++) {
      const reviewer = randomFrom(users);
      const reviewDoc = new Review(makeReview(reviewer._id, prop._id));
      sum += reviewDoc.rating;
      await reviewDoc.save();
    }
    const avg = Number((sum / numReviews).toFixed(1));
    prop.rating = avg;
    prop.numReviews = numReviews;
    await prop.save();
  }
  console.log('Reviews created and ratings backfilled');

  // Create some bookings
  for (let i = 0; i < 40; i++) {
    const property = randomFrom(properties);
    const user = randomFrom(users);
    const start = faker.date.soon({ days: 45 });
    const end = faker.date.soon({ days: faker.number.int({ min: 60, max: 240 }) });
    const months = diffInMonths(start, end);
    const totalPrice = months * property.price.monthly;
    const booking = new Booking({
      property: property._id,
      user: user._id,
      checkIn: start,
      checkOut: end,
      months,
      totalPrice,
      status: 'confirmed',
    });
    await booking.save();
  }
  console.log('Bookings created');

  await mongoose.connection.close();
  console.log('Seeding complete');
}

seed().catch((err) => { console.error(err); process.exit(1); });

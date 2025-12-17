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
  // Mask credentials in URIs like: mongodb+srv://user:pass@host/db
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^@]+)@/i, '$1***@');
};

console.log('cwd:', process.cwd());
console.log('Mongo URI (masked):', maskMongoUri(MONGO));

async function connect() {
  if (!MONGO || !String(MONGO).trim()) {
    throw new Error('Missing Mongo connection string. Set MONGO_URI in your .env.');
  }
  await mongoose.connect(MONGO);
  console.log('✅ Mongo connected');
}

async function clearForeignProperties() {
  // Find non-Indian properties
  const foreignProperties = await Property.find({
    'address.country': { $ne: 'India' },
  }).select('_id title address.city');

  if (foreignProperties.length === 0) {
    console.log('✅ No foreign properties found');
    return;
  }

  const propertyIds = foreignProperties.map((p) => p._id);

  console.log(`🧹 Found ${propertyIds.length} foreign properties`);
  foreignProperties.forEach((p) =>
    console.log(`❌ ${p.title} (${p.address.city})`)
  );

  // Delete related data first (important)
  const reviewsDeleted = await Review.deleteMany({
    property: { $in: propertyIds },
  });

  const bookingsDeleted = await Booking.deleteMany({
    property: { $in: propertyIds },
  });

  const propertiesDeleted = await Property.deleteMany({
    _id: { $in: propertyIds },
  });

  console.log(`🗑️ Reviews deleted: ${reviewsDeleted.deletedCount}`);
  console.log(`🗑️ Bookings deleted: ${bookingsDeleted.deletedCount}`);
  console.log(`🗑️ Properties deleted: ${propertiesDeleted.deletedCount}`);
}

async function run() {
  await connect();
  try {
    await clearForeignProperties();
    console.log('✅ Foreign data cleanup complete');
  } finally {
    await mongoose.connection.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

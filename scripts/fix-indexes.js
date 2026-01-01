// Run this script to fix duplicate MongoDB indexes
// Usage: node scripts/fix-indexes.js

require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndexes() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI not found in .env file');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // List all indexes
    console.log('\nCurrent indexes:');
    const indexes = await usersCollection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)}: ${index.name}`);
    });

    // Drop duplicate googleId index if it exists
    try {
      await usersCollection.dropIndex('googleId_1');
      console.log('\n✅ Dropped duplicate googleId_1 index');
    } catch (error) {
      console.log('\n⚠️ googleId_1 index might not exist or already dropped');
    }

    // Recreate indexes correctly
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ googleId: 1 }, { unique: true });
    console.log('✅ Recreated indexes correctly');

    // List indexes after fix
    console.log('\nIndexes after fix:');
    const newIndexes = await usersCollection.indexes();
    newIndexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)}: ${index.name}`);
    });

    console.log('\n✅ Index fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
}

fixIndexes();

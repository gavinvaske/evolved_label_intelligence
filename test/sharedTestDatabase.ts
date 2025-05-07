import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import fs from 'fs';

let mongod: MongoMemoryReplSet | null = null;
const TEST_DB_URI_FILE = './test-db-uri.txt';

const MONGOOSE_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  directConnection: true, // Important for replica sets
  retryWrites: false,
  serverSelectionTimeoutMS: 5000
};

export const getTestDbUri = () => {
  return fs.existsSync(TEST_DB_URI_FILE) ? fs.readFileSync(TEST_DB_URI_FILE, 'utf8') : null;
}

/* The API populates this file with the test database URI when it starts up. So if it exists, the test database is running... probably */
export const isTestDbRunning = () => {
  return mongod?.getUri() !== null;
}

export async function connectToTestDatabase(retryCount = 0) {
  let dbUri = getTestDbUri();
  if (!isDbInTestMode()) throw new Error('You may be connected to the wrong database. This is to prevent accidental deletion of production data: ' + mongod?.getUri());

  if (!dbUri) {
    console.log('Creating new test database instance...');
    mongod = await MongoMemoryReplSet.create({
        replSet: { count: 1 }, // Single-node replica set
        instanceOpts: [{ storageEngine: 'wiredTiger' }]
    });
    await mongod.waitUntilRunning();

    // Store the URI in a file for other processes to use
    dbUri = mongod.getUri();
    fs.writeFileSync(TEST_DB_URI_FILE, dbUri);
  }

  console.log('Connecting to test database...');
  try {
    await mongoose.connect(dbUri, MONGOOSE_OPTIONS);
  } catch (error) {
    removeTestDbUriFile();  // Remove the URI file if the connection fails
    
    // If this is the first attempt, try one more time with a fresh database
    if (retryCount === 0) {
      console.log('Connection failed, attempting to recreate database...');
      return connectToTestDatabase(1);
    }
    
    // If we've already retried once, throw the error
    throw error;
  }
}

export async function closeTestDatabase() {
  if (!isDbInTestMode()) throw new Error('You may be connected to the wrong database. This is to prevent accidental deletion of production data: ' + mongod?.getUri());
  
  console.log('Closing test database...');
  await mongoose.disconnect();

  if (mongod) await mongod.stop();
  // Clean up the URI file
  removeTestDbUriFile();
  
  console.log('Test database closed');
}

export async function clearTestDatabase() {
  if (!isDbInTestMode()) throw new Error('You may be connected to the wrong database. This is to prevent accidental deletion of production data: ' + mongod?.getUri());

  const collections = mongoose.connection.collections;
  console.log('Clearing test database...');
  for (const key in collections) {
      const collection = collections[key];
      if (collection) {
          await collection.deleteMany({});
      }
  }
  console.log('Test database cleared');
}

function removeTestDbUriFile() {
  if (fs.existsSync(TEST_DB_URI_FILE)) {
    fs.unlinkSync(TEST_DB_URI_FILE);
  }
}

const isDbInTestMode = () => {
  const dbIsLocalOrNotConnected = mongod?.getUri() ? mongod.getUri().includes('127.0.0.1') : true;
  return process.env.NODE_ENV === 'test' && dbIsLocalOrNotConnected;
}

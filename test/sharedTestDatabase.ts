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

export async function connectToTestDatabase() {
  let dbUri = getTestDbUri();
  throwErrorIfDbIsNotInTestMode();  // Short circuit if we're not in test mode

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
    console.log('Connected to test database');
  } catch (error) {
    removeTestDbUriFile();  // Remove the URI file if the connection fails
    throw error;
  }
}

export async function closeTestDatabase() {
  throwErrorIfDbIsNotInTestMode();  // Short circuit if we're not in test mode
  
  console.log('Closing test database...');
  await mongoose.disconnect();

  if (mongod) await mongod.stop();
  // Clean up the URI file
  removeTestDbUriFile();
  
  console.log('Test database closed');
}

export async function clearTestDatabase() {
  throwErrorIfDbIsNotInTestMode();  // Short circuit if we're not in test mode

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

export function removeTestDbUriFile() {
  if (fs.existsSync(TEST_DB_URI_FILE)) {
    fs.unlinkSync(TEST_DB_URI_FILE);
  }
}

/* 
  If for any reason, the database is not in test mode, throw an error. 
  This is to prevent accidental deletion of production data or issues around that.
*/
const throwErrorIfDbIsNotInTestMode = () => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const dbIsLocal = mongoose.connection.host == '127.0.0.1';
  const isInTestMode = process.env.NODE_ENV === 'test' && (isDbConnected ? dbIsLocal : true);
  if (!isInTestMode) {
    throw new Error('You may be connected to the wrong database. This is to prevent accidental deletion of production data: ' + mongoose.connection);
  }
}

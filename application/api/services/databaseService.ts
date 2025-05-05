import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { connectToTestDatabase, closeTestDatabase, clearTestDatabase } from '../../../test/sharedTestDatabase';
mongoose.set('strictQuery', true);
/* 
  [IMPORTANT]
    Runs get methods when querying documents 
    (hint: like converting pennies to dollars on queried docs): 
  [EXAMPLE]
    { type: foo, get: convertPenniesToDollars() } methods 
*/
mongoose.set('toJSON', { getters: true });
mongoose.Schema.Types.String.set('trim', true);

let mongod;
const TEST_ENVIRONMENT = 'test';

export const connectToMongoDatabase = async () => {
    if (process.env.NODE_ENV === TEST_ENVIRONMENT) {
        console.log('Connecting to test database from the API...');
        await connectToTestDatabase();
    } else {
        console.log('Connecting to production database from the API...');
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_book';
        await mongoose.connect(mongoUri);
    }
};

export const connectToTestMongoDatabase = async () => {
    if (process.env.NODE_ENV !== TEST_ENVIRONMENT) {
        throw Error('the test database can only be connected too from test environments');
    }

    mongod = await MongoMemoryReplSet.create({
        replSet: { count: 1 }, // Single-node replica set
        instanceOpts: [{ storageEngine: 'wiredTiger' }]
    });
    await mongod.waitUntilRunning();
    await mongoose.connect(mongod.getUri());
}

export const closeDatabase = async () => {
    if (process.env.NODE_ENV === TEST_ENVIRONMENT) {
        await closeTestDatabase();
    } else {
        await mongoose.disconnect();
    }
};

export const clearDatabase = async () => {
    if (process.env.NODE_ENV === TEST_ENVIRONMENT) {
        await clearTestDatabase();
    } else {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            if (collection) {
                await collection.deleteMany({});
            }
        }
    }
};
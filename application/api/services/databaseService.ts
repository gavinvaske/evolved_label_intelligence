import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
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

interface MongoMemoryConfig {
    instance: {
        dbName: string;
        replSet: {
            name: string;
            count: number;
            storageEngine: string;
        };
    };
}

const getMongoMemoryServerConfig = (): MongoMemoryConfig => ({
    instance: {
        dbName: 'test',
        replSet: {
            name: 'rs0',
            count: 1,
            storageEngine: 'wiredTiger'
        }
    }
});

export const connectToMongoDatabase = async (databaseUrl: string) => {
    if (!databaseUrl) {
        throw new Error('Database URL is not defined');
    }

    // If we're in a test environment and the URL is the default one, use in-memory database
    if (process.env.NODE_ENV === 'test' && databaseUrl === process.env.MONGO_DB_URL) {
        mongod = await MongoMemoryReplSet.create({
            replSet: { count: 1 }, // Single-node replica set
            instanceOpts: [{ storageEngine: 'wiredTiger' }]
        });
        await mongod.waitUntilRunning();
        await mongoose.connect(mongod.getUri());
    } else {
        await mongoose.connect(databaseUrl);
    }
}

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
    if (process.env.NODE_ENV === 'test' && mongod) {
        await mongoose.disconnect();
        await mongod.stop();
    }
}

export const clearDatabase = async () => {
    if (process.env.NODE_ENV === 'test') {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            collection && await collection.deleteMany({});
        }
    }
}
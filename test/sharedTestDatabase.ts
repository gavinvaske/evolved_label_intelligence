import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryReplSet | null = null;
let isConnected = false;

// Store the URI in a file so both processes can read it
const DB_URI_FILE = './test-db-uri.txt';

// Common connection options
const MONGOOSE_OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    directConnection: true, // Important for replica sets
    retryWrites: false,
    serverSelectionTimeoutMS: 5000
};

export async function getTestDatabaseUri(): Promise<string> {
    // If we already have a URI in the file, use that
    try {
        const fs = require('fs');
        if (fs.existsSync(DB_URI_FILE)) {
            const uri = fs.readFileSync(DB_URI_FILE, 'utf8');
            console.log('Using existing database URI from file:', uri);
            return uri;
        }
    } catch (error) {
        console.error('Error reading DB URI file:', error);
    }

    // Otherwise create a new instance
    if (!mongod) {
        console.log('Creating new test database instance...');
        mongod = await MongoMemoryReplSet.create({
            replSet: { count: 1 }, // Single-node replica set
            instanceOpts: [{ storageEngine: 'wiredTiger' }]
        });
        await mongod.waitUntilRunning();
        
        // Store the URI in a file for other processes to use
        const uri = mongod.getUri();
        try {
            const fs = require('fs');
            fs.writeFileSync(DB_URI_FILE, uri);
            console.log('Stored database URI in file:', uri);
        } catch (error) {
            console.error('Error writing DB URI file:', error);
        }
        return uri;
    }
    return mongod.getUri();
}

export async function connectToTestDatabase(): Promise<void> {
    if (isConnected) return;
    
    const uri = await getTestDatabaseUri();
    console.log('Connecting to test database with URI:', uri);
    await mongoose.connect(uri, MONGOOSE_OPTIONS);
    isConnected = true;

    // Verify the connection
    const collections = mongoose.connection.collections;
    console.log('Connected to database. Collections:', Object.keys(collections));
}

export async function closeTestDatabase(): Promise<void> {
    if (mongod) {
        await mongoose.disconnect();
        await mongod.stop();
        mongod = null;
        isConnected = false;
        try {
            const fs = require('fs');
            if (fs.existsSync(DB_URI_FILE)) {
                fs.unlinkSync(DB_URI_FILE);
            }
        } catch (error) {
            console.error('Error removing DB URI file:', error);
        }
    }
}

export async function clearTestDatabase(): Promise<void> {
    if (!isConnected) return;
    
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        if (collection) {
            await collection.deleteMany({});
        }
    }
} 
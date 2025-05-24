import { connectToMongoDatabase, clearDatabase } from '../application/api/services/databaseService';
import { mockData } from '../test-utils/testDataGenerator';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';

// Import all models
import '../application/api/models/die';
import '../application/api/models/material';
import '../application/api/models/finish';
import '../application/api/models/customer';
import '../application/api/models/baseProduct';
import '../application/api/models/vendor';
import '../application/api/models/materialCategory';
import '../application/api/models/materialLengthAdjustment';
import '../application/api/models/materialOrder';
// import '../application/api/models/shippingLocation';
import '../application/api/models/deliveryMethod';
import '../application/api/models/linerType';
import '../application/api/models/creditTerm';
import '../application/api/models/adhesiveCategory';

dotenv.config();

// Validate environment
if (process.env.NODE_ENV !== 'development') {
    console.error('Error: This script can only be run in development environment');
    console.error('Current NODE_ENV:', process.env.NODE_ENV);
    console.error('Please run with: npm run db:reset');
    process.exit(1);
}

// Collections to preserve (not clear)
const PRESERVED_COLLECTIONS = ['users'];

// Collections to seed with data and their corresponding model names
const COLLECTIONS_TO_SEED = [
    { collection: 'dies', model: 'Die' },
    { collection: 'materials', model: 'Material' },
    { collection: 'finishes', model: 'Finish' },
    { collection: 'customers', model: 'Customer' },
    { collection: 'baseproducts', model: 'BaseProduct' },
    { collection: 'vendors', model: 'Vendor' },
    { collection: 'materialcategories', model: 'MaterialCategory' },
    { collection: 'materiallengthadjustments', model: 'MaterialLengthAdjustment' },
    { collection: 'materialorders', model: 'MaterialOrder' },
    { collection: 'deliverymethods', model: 'DeliveryMethod' },
    { collection: 'linertypes', model: 'LinerType' },
    { collection: 'creditterms', model: 'CreditTerm' },
    { collection: 'adhesivecategories', model: 'AdhesiveCategory' }
];

function promptForConfirmation(): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log('\n⚠️  WARNING: This will reset your development database! ⚠️');
        console.log('This action cannot be undone.');
        console.log('The following collections will be cleared and reseeded:');
        console.log(COLLECTIONS_TO_SEED.map(c => `- ${c.collection}`).join('\n'));
        console.log('\nThe following collections will be preserved:');
        console.log(PRESERVED_COLLECTIONS.map(c => `- ${c}`).join('\n'));
        
        rl.question('\nType "yes" to continue: ', (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'yes');
        });
    });
}

async function resetAndSeedDatabase() {
    try {
        // Get user confirmation
        const confirmed = await promptForConfirmation();
        if (!confirmed) {
            console.log('Operation cancelled by user');
            process.exit(0);
        }

        // Connect to the development database
        const databaseUrl = process.env.MONGO_DB_URL;
        if (!databaseUrl) {
            throw new Error('MONGO_DB_URL environment variable is not set');
        }

        console.log('\nConnecting to database...');
        await connectToMongoDatabase(databaseUrl);

        // Clear all collections except preserved ones
        console.log('Clearing collections...');
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            if (!PRESERVED_COLLECTIONS.includes(key)) {
                await collections[key].deleteMany({});
                console.log(`Cleared collection: ${key}`);
            }
        }

        // Seed the database
        console.log('Seeding database...');
        for (const { collection, model } of COLLECTIONS_TO_SEED) {
            const mongooseModel = mongoose.model(model);
            const mockDataGenerator = mockData[model];

            if (!mockDataGenerator) {
                console.warn(`No mock data generator found for ${model}`);
                continue;
            }

            // Generate 5-10 random documents for each collection
            const numDocuments = Math.floor(Math.random() * 6) + 5;
            const documents = Array(numDocuments).fill(null).map(() => mockDataGenerator());
            
            await mongooseModel.insertMany(documents);
            console.log(`Seeded ${numDocuments} documents in ${collection}`);
        }

        console.log('\nDatabase reset and seeding completed successfully!');
    } catch (error) {
        console.error('Error resetting and seeding database:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

// Run the script
resetAndSeedDatabase(); 
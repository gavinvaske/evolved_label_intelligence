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

// Define seeding order and relationships
const SEEDING_ORDER = [
    // First level - no dependencies
    {
        collection: 'vendors',
        model: 'Vendor',
        dependencies: []
    },
    {
        collection: 'materialcategories',
        model: 'MaterialCategory',
        dependencies: []
    },
    {
        collection: 'adhesivecategories',
        model: 'AdhesiveCategory',
        dependencies: []
    },
    {
        collection: 'linertypes',
        model: 'LinerType',
        dependencies: []
    },
    {
        collection: 'creditterms',
        model: 'CreditTerm',
        dependencies: []
    },
    {
        collection: 'deliverymethods',
        model: 'DeliveryMethod',
        dependencies: []
    },
    // Second level - depends on first level
    {
        collection: 'materials',
        model: 'Material',
        dependencies: ['Vendor', 'MaterialCategory', 'AdhesiveCategory', 'LinerType']
    },
    {
        collection: 'finishes',
        model: 'Finish',
        dependencies: ['Vendor']
    },
    {
        collection: 'customers',
        model: 'Customer',
        dependencies: []
    },
    {
        collection: 'dies',
        model: 'Die',
        dependencies: ['Vendor']
    },
    // Third level - depends on second level
    {
        collection: 'baseproducts',
        model: 'BaseProduct',
        dependencies: ['Customer', 'Die', 'Material', 'Finish']
    },
    {
        collection: 'materiallengthadjustments',
        model: 'MaterialLengthAdjustment',
        dependencies: ['Material']
    },
    {
        collection: 'materialorders',
        model: 'MaterialOrder',
        dependencies: ['Material', 'Vendor']
    }
];

// Store created documents for reference
const createdDocuments: { [key: string]: mongoose.Types.ObjectId[] } = {};

function promptForConfirmation(): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log('\n⚠️  WARNING: This will reset your development database! ⚠️');
        console.log('This action cannot be undone.');
        console.log('The following collections will be cleared and reseeded:');
        console.log(SEEDING_ORDER.map(c => `- ${c.collection}`).join('\n'));
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

        // Seed the database in order
        console.log('Seeding database...');
        for (const { collection, model, dependencies } of SEEDING_ORDER) {
            const mongooseModel = mongoose.model(model);
            const mockDataGenerator = mockData[model];

            if (!mockDataGenerator) {
                console.warn(`No mock data generator found for ${model}`);
                continue;
            }

            // Generate 5-10 random documents for each collection
            const numDocuments = Math.floor(Math.random() * 6) + 5;
            const documents = Array(numDocuments).fill(null).map(() => {
                const doc = mockDataGenerator();
                
                // Replace random ObjectIds with actual created document IDs
                for (const dep of dependencies) {
                    const depIds = createdDocuments[dep];
                    if (depIds && depIds.length > 0) {
                        // Find all fields that reference this dependency
                        for (const key in doc) {
                            if (doc[key] instanceof mongoose.Types.ObjectId && 
                                key.toLowerCase().includes(dep.toLowerCase())) {
                                // Pick a random ID from the dependency
                                doc[key] = depIds[Math.floor(Math.random() * depIds.length)];
                            }
                        }
                    }
                }

                // Handle BaseProduct's productNumber
                if (model === 'BaseProduct') {
                    // Remove productNumber as it will be generated by the pre-save hook
                    delete doc.productNumber;
                }
                
                return doc;
            });
            
            try {
                // Insert documents one at a time to handle pre-save hooks
                for (const doc of documents) {
                    const newDoc = new mongooseModel(doc);
                    await newDoc.save();
                    if (!createdDocuments[model]) {
                        createdDocuments[model] = [];
                    }
                    createdDocuments[model].push(newDoc._id);
                }
                console.log(`Seeded ${documents.length} documents in ${collection}`);
            } catch (error) {
                console.error(`Error seeding ${collection}:`, error);
                throw error;
            }
        }

        console.log('\nDatabase reset and seeding completed successfully!');
    } catch (error) {
        console.error('Error resetting and seeding database:', error);
        process.exit(1);
    } finally {
        // Wait a moment to ensure all operations are complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Close the connection
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    }
}

// Run the script
resetAndSeedDatabase(); 
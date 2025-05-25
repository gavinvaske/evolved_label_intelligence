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

// Define predefined data for specific models
const PREDEFINED_DATA = {
    Vendor: [
        {
            name: 'Avery Dennison',
            phoneNumber: '1-800-462-8379',
            email: 'sales@averydennison.com',
            website: 'https://www.averydennison.com',
            primaryContactName: 'Dennis Reynolds',
            primaryContactPhoneNumber: '1-800-462-8379',
            primaryContactEmail: 'dennis.reynolds@averydennison.com',
        },
        {
            name: 'UPM Raflatac',
            phoneNumber: '1-800-558-1234',
            email: 'sales@upmraflatac.com',
            website: 'https://www.upmraflatac.com',
            primaryContactName: 'Liam McPoyle',
            primaryContactPhoneNumber: '1-800-558-1234',
            primaryContactEmail: 'liam.mcpoyle@upmraflatac.com',
        },
        {
            name: 'Bemis',
            phoneNumber: '1-800-558-1234',
            email: 'sales@bemis.com',
            website: 'https://www.bemis.com',
            primaryContactName: 'Deandra Reynolds',
            primaryContactEmail: 'deandra.reynolds@bemis.com',
        },
        {
          name: 'Mactac',
          primaryContactName: 'Gavin Mactac',
          primaryContactEmail: 'gavin.mactac@mactac.com',
        },
        {
          name: 'Rexam',
          phoneNumber: '1-800-558-1234',
          email: 'sales@rexam.com',
          website: 'https://www.rexam.com',
          primaryContactName: 'Todd Anderson',
          primaryContactPhoneNumber: '1-800-558-1234',
          primaryContactEmail: 'todd.anderson@rexam.com',
        },
        {
          name: '3M',
          primaryContactName: 'Charlie Kelly',
          primaryContactEmail: 'charlie.kelly@3m.com',
        },
        {
          name: 'Technicote',
          primaryContactName: 'Phil Town',
          primaryContactEmail: 'phil.town@technicote.com',
        }
    ],
    Material: [
        {
            name: 'White Polyester',
            materialId: 'WP-100',
            thickness: 2,
            weight: 2,
            width: 12,
            faceColor: '#FFFFFF',
            adhesive: 'Permanent',
            description: 'High-quality white polyester material with permanent adhesive',
            whenToUse: 'Ideal for outdoor applications and harsh environments',
            alternativeStock: 'White Vinyl'
        },
        {
            name: 'Clear Polyester',
            materialId: 'CP-200',
            thickness: 2,
            weight: 2,
            width: 12,
            faceColor: 'transparent',
            adhesive: 'Permanent',
            description: 'Premium clear polyester material with permanent adhesive',
            whenToUse: 'Perfect for window applications and transparent labeling',
            alternativeStock: 'Clear Vinyl'
        },
        {name: 'White BOPP', materialId: 'BP-300', adhesive: 'Permanent', description: 'High-quality white BOPP material with permanent adhesive', whenToUse: 'Ideal for outdoor applications and harsh environments', alternativeStock: 'White Vinyl'},
        {name: 'Clear BOPP', materialId: 'BP-400', adhesive: 'Permanent', description: 'Premium clear BOPP material with permanent adhesive', whenToUse: 'Perfect for window applications and transparent labeling', alternativeStock: 'Clear Vinyl'},
        {name: 'White PVC', materialId: 'PV-500', adhesive: 'Permanent', description: 'High-quality white PVC material with permanent adhesive', whenToUse: 'Ideal for outdoor applications and harsh environments', alternativeStock: 'White Vinyl'},
        {name: 'Clear PVC', materialId: 'PV-600', adhesive: 'Permanent', description: 'Premium clear PVC material with permanent adhesive', whenToUse: 'Perfect for window applications and transparent labeling', alternativeStock: 'Clear Vinyl'},
        {name: 'White PET', materialId: 'PT-700', adhesive: 'Permanent', description: 'High-quality white PET material with permanent adhesive', whenToUse: 'Ideal for outdoor applications and harsh environments', alternativeStock: 'White Vinyl'},
        {name: 'Clear PET', materialId: 'PT-800', adhesive: 'Permanent', description: 'Premium clear PET material with permanent adhesive', whenToUse: 'Perfect for window applications and transparent labeling', alternativeStock: 'Clear Vinyl'},
        {name: 'Vinyl', materialId: 'VY-900', adhesive: 'Permanent', description: 'High-quality vinyl material with permanent adhesive', whenToUse: 'Ideal for outdoor applications and harsh environments', alternativeStock: 'White Vinyl'},
        {name: 'Paper', materialId: 'PR-1000', adhesive: 'Permanent', description: 'High-quality paper material with permanent adhesive', whenToUse: 'Ideal for outdoor applications and harsh environments', alternativeStock: 'White Vinyl'},
        {name: 'BOPP', materialId: 'BP-1100', adhesive: 'Permanent', description: 'High-quality BOPP material with permanent adhesive', whenToUse: 'Ideal for outdoor applications and harsh environments', alternativeStock: 'White Vinyl'},
        {name: 'PVC', materialId: 'PV-1200', adhesive: 'Permanent', description: 'High-quality PVC material with permanent adhesive', whenToUse: 'Ideal for outdoor applications and harsh environments', alternativeStock: 'White Vinyl'},
        {name: 'PET', materialId: 'PT-1300', adhesive: 'Permanent', description: 'High-quality PET material with permanent adhesive', whenToUse: 'Ideal for outdoor applications and harsh environments', alternativeStock: 'White Vinyl'},
        {name: 'Glassine', materialId: 'GL-1400', adhesive: 'Permanent', description: 'High-quality glassine material with permanent adhesive', whenToUse: 'Ideal for outdoor applications and harsh environments', alternativeStock: 'White Vinyl'},
        {name: 'Kraft', materialId: 'KR-1500', adhesive: 'Permanent', description: 'High-quality kraft material with permanent adhesive', whenToUse: 'Ideal for outdoor applications and harsh environments', alternativeStock: 'White Vinyl'},
        {name: 'Semi-Gloss Paper', materialId: 'SG-1600', adhesive: 'Permanent', description: 'High-quality semi-gloss paper material with permanent adhesive', whenToUse: 'Ideal for outdoor applications and harsh environments', alternativeStock: 'White Vinyl'},
        {name: 'Matte Litho', materialId: 'ML-1700', adhesive: 'Permanent', description: 'High-quality matte litho material with permanent adhesive', whenToUse: 'Ideal for outdoor applications and harsh environments', alternativeStock: 'White Vinyl'},
        {name: 'Gloss Litho', materialId: 'GL-1800', adhesive: 'Permanent', description: 'High-quality gloss litho material with permanent adhesive', whenToUse: 'Ideal for outdoor applications and harsh environments', alternativeStock: 'White Vinyl'},
        {name: 'Gloss UV', materialId: 'UV-1900', adhesive: 'Permanent', description: 'High-quality gloss UV material with permanent adhesive', whenToUse: 'Ideal for outdoor applications and harsh environments', alternativeStock: 'White Vinyl'},
        {name: 'Matte UV', materialId: 'UV-2000', adhesive: 'Permanent', description: 'High-quality matte UV material with permanent adhesive', whenToUse: 'Ideal for outdoor applications and harsh environments', alternativeStock: 'White Vinyl'},
        {name: 'Silver Matte PE', materialId: 'SP-2100', adhesive: 'Permanent', description: 'High-quality silver matte PE material with permanent adhesive', whenToUse: 'Ideal for outdoor applications and harsh environments', alternativeStock: 'White Vinyl'},
        {name: 'PE (Polyethylene)', materialId: 'PE-2200', adhesive: 'Permanent', description: 'High-quality PE material with permanent adhesive', whenToUse: 'Ideal for outdoor applications and harsh environments', alternativeStock: 'White Vinyl'},
    ],
    MaterialCategory: [
        { name: 'Polyester' },
        { name: 'Vinyl' },
        { name: 'Paper' },
        { name: 'Thermal' },
        { name: 'Film' },
        { name: 'Specialty Stocks' }
    ],
    AdhesiveCategory: [
        { name: 'Permanent' },
        { name: 'Removable' },
        { name: 'Repositionable' },
        { name: 'Freezer/Cold Temp Adhesive'},
        { name: 'Hot Melt Adhesive'},
        { name: 'High Tack Adhesive'},
        { name: 'Medical-Grade Adhesive'},
    ],
    LinerType: [
        { name: 'Glassine' },
        { name: 'Kraft' },
        { name: 'Polyester' },
        { name: 'PET Liner' },
        { name: 'PVC Liner' },
        { name: 'BOPP Liner' },
        { name: 'Gloss Liner' },
        { name: 'Matte Liner' },
        { name: 'Gloss UV Liner' },
        { name: 'Matte UV Liner' },
    ],
    CreditTerm: [
      { description: 'Net 30' },
      { description: 'Net 60' },
      { description: 'Net 90' },
      { description: 'Due on receipt' },
      { description: 'Prepaid' },
      { description: 'EOM' },
    ],
    DeliveryMethod: [
      { name: 'UPS Ground'},
      { name: 'UPS Next Day Air'},
      { name: 'UPS 2nd Day Air'},
      { name: 'FedEx Ground'},
      { name: 'FedEx Next Day Air'},
      { name: 'FedEx 2nd Day Air'},
    ]
};

// Define ranges for random document generation per model
/* If PREDEFINED_DATA is not provided for a model, then the number of random documents generated will be between the min and max */
const RANDOM_DOCUMENT_RANGES = {
    Vendor: { min: 2, max: 4 },
    Material: { min: 5, max: 10 },
    Finish: { min: 3, max: 6 },
    Customer: { min: 20, max: 60 },
    BaseProduct: { min: 2, max: 5 },
    MaterialCategory: { min: 2, max: 4 },
    AdhesiveCategory: { min: 2, max: 4 },
    LinerType: { min: 2, max: 4 },
    CreditTerm: { min: 2, max: 4 },
    DeliveryMethod: { min: 2, max: 4 },
    Die: { min: 5, max: 12 },
    MaterialLengthAdjustment: { min: 50, max: 100 },
    MaterialOrder: { min: 50, max: 100 }
};

// Define seeding order and relationships
const SEEDING_ORDER = [
    // First level - no dependencies
    {
        collection: 'vendors',
        model: 'Vendor',
        dependencies: [],
        predefinedData: PREDEFINED_DATA.Vendor
    },
    {
        collection: 'materialcategories',
        model: 'MaterialCategory',
        dependencies: [],
        predefinedData: PREDEFINED_DATA.MaterialCategory
    },
    {
        collection: 'adhesivecategories',
        model: 'AdhesiveCategory',
        dependencies: [],
        predefinedData: PREDEFINED_DATA.AdhesiveCategory
    },
    {
        collection: 'linertypes',
        model: 'LinerType',
        dependencies: [],
        predefinedData: PREDEFINED_DATA.LinerType
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
        dependencies: ['Vendor', 'MaterialCategory', 'AdhesiveCategory', 'LinerType'],
        predefinedData: PREDEFINED_DATA.Material
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
        for (const { collection, model, dependencies, predefinedData } of SEEDING_ORDER) {
            const mongooseModel = mongoose.model(model);
            const mockDataGenerator = mockData[model];

            if (!mockDataGenerator) {
                console.warn(`No mock data generator found for ${model}`);
                continue;
            }

            // First, create predefined documents if they exist
            if (predefinedData && predefinedData.length > 0) {
                for (const predefinedDoc of predefinedData) {
                    // Generate base document with all required fields
                    const baseDoc = mockDataGenerator();
                    // Merge predefined data with generated data
                    const doc = { ...baseDoc, ...predefinedDoc };
                    
                    // Handle dependencies for predefined documents
                    for (const dep of dependencies) {
                        const depIds = createdDocuments[dep];
                        if (depIds && depIds.length > 0) {
                            for (const key in doc) {
                                if (doc[key] instanceof mongoose.Types.ObjectId && 
                                    key.toLowerCase().includes(dep.toLowerCase())) {
                                    doc[key] = depIds[Math.floor(Math.random() * depIds.length)];
                                }
                            }
                        }
                    }

                    const newDoc = new mongooseModel(doc);
                    await newDoc.save();
                    if (!createdDocuments[model]) {
                        createdDocuments[model] = [];
                    }
                    createdDocuments[model].push(newDoc._id);
                }
                console.log(`Created ${predefinedData.length} predefined documents in ${collection}`);
            } else {
                // Get the random document range for this model, or use default if not specified
                const range = RANDOM_DOCUMENT_RANGES[model] || { min: 2, max: 4 };
                const numRandomDocuments = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                const documents = Array(numRandomDocuments).fill(null).map(() => {
                    const doc = mockDataGenerator();
                    
                    // Replace random ObjectIds with actual created document IDs
                    for (const dep of dependencies) {
                        const depIds = createdDocuments[dep];
                        if (depIds && depIds.length > 0) {
                            for (const key in doc) {
                                if (doc[key] instanceof mongoose.Types.ObjectId && 
                                    key.toLowerCase().includes(dep.toLowerCase())) {
                                    doc[key] = depIds[Math.floor(Math.random() * depIds.length)];
                                }
                            }
                        }
                    }

                    // Handle BaseProduct's productNumber
                    if (model === 'BaseProduct') {
                        delete doc.productNumber;
                    }
                    
                    return doc;
                });
                
                try {
                    // Insert random documents
                    for (const doc of documents) {
                        const newDoc = new mongooseModel(doc);
                        await newDoc.save();
                        if (!createdDocuments[model]) {
                            createdDocuments[model] = [];
                        }
                        createdDocuments[model].push(newDoc._id);
                    }
                    console.log(`Created ${documents.length} random documents in ${collection}`);
                } catch (error) {
                    console.error(`Error seeding ${collection}:`, error);
                    throw error;
                }
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
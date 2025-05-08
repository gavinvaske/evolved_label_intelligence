import { PackingSlipModel } from '../../application/api/models/packingSlip';
import Chance from 'chance';
import * as databaseService from '../../application/api/services/databaseService';
import * as testDataGenerator from '../../test-utils/testDataGenerator.ts';
import mongoose from 'mongoose';

const chance = Chance();

describe('File: packingSlip.js', () => {
    let packingSlipAttributes;

    beforeEach(() => {
        packingSlipAttributes = {};
    });

    it('should pass validation when all required attributes are present', async () => {
        const packingSlip = new PackingSlipModel(packingSlipAttributes);

        const error = await packingSlip.validate();

        expect(error).toBeUndefined();
    });

    it('should have the correct indexes', async () => {
        const indexMetaData = PackingSlipModel.schema.indexes();
        const expectedIndexes = ['packingSlipNumber'];

        console.log('indexMetaData: ', indexMetaData);

        const isEveryExpectedIndexActuallyAnIndex = expectedIndexes.every((expectedIndex) => {
            return indexMetaData.some((metaData) => {
                const index = Object.keys(metaData[0])[0];
                if (index === expectedIndex) return true;
            });
        });

        expect(isEveryExpectedIndexActuallyAnIndex).toBe(true);
    });

    describe('attribute: packingSlipNumber', () => {
        it('should be a string', () => {
            const packingSlipNumber = chance.d100();
            packingSlipAttributes.packingSlipNumber = packingSlipNumber;
            
            const packingSlip = new PackingSlipModel(packingSlipAttributes);

            expect(packingSlip.packingSlipNumber).toEqual(expect.any(Number));
        });
    });

    describe('attribute: nameOfSender', () => {
        it('should be a string', () => {
            const nameOfSender = chance.name();
            packingSlipAttributes.nameOfSender = nameOfSender;
            
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            expect(packingSlip.nameOfSender).toEqual(expect.any(String));
            expect(packingSlip.nameOfSender).toEqual(nameOfSender);
        });

        it('should have the correct default value', () => {
            delete packingSlipAttributes.nameOfSender;
            const expectedDefaultValue = 'The Label Advantage';
            
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            expect(packingSlip.nameOfSender).toEqual(expectedDefaultValue);
        });

        it('should be settable to an empty string', () => {
            const emptyName = '';
            packingSlipAttributes.nameOfSender = emptyName;
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            const error = packingSlip.validateSync();
            
            expect(error).toBeUndefined();
            expect(packingSlip.nameOfSender).toEqual(emptyName);
        });
    });

    describe('attribute: senderAddress', () => {
        it('should not be required', () => {
            delete packingSlipAttributes.senderAddress;
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            const error = packingSlip.validateSync();

            expect(error).toBeUndefined();
        });

        it('should have the correct default address', () => {
            delete packingSlipAttributes.senderAddress;
            const expectedDefaultAddress = {
                name: 'The Label Advantage',
                street: '1785 GUTHRIE AVENUE',
                city: 'DES MOINES',
                state: 'IOWA',
            };
            const packingSlip = new PackingSlipModel(packingSlipAttributes);

            for (const [key, value] of Object.entries(expectedDefaultAddress)) {
                expect(packingSlip.senderAddress[key]).toEqual(value.toUpperCase());
            }
        });

        it('should be setable', () => {
            const senderAddress = testDataGenerator.mockData.Address();
            packingSlipAttributes.senderAddress = senderAddress;
            
            const packingSlip = new PackingSlipModel(packingSlipAttributes);

            for (const [key, value] of Object.entries(senderAddress)) {
                if (key === 'name') {
                    expect(packingSlip.senderAddress[key]).toEqual(value.toUpperCase());
                } else {
                    expect(packingSlip.senderAddress[key]).toEqual(value && value.toUpperCase());
                }
            }
        });
    });

    describe('attribute: senderPhoneNumber', () => {
        it('should fail validation if the phone number is invalid', () => {
            const invalidPhoneNumber = chance.word();
            packingSlipAttributes.senderPhoneNumber = invalidPhoneNumber;
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            const error = packingSlip.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be a string', () => {
            const senderPhoneNumber = chance.phone();
            packingSlipAttributes.senderPhoneNumber = senderPhoneNumber;
            
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            expect(packingSlip.senderPhoneNumber).toEqual(expect.any(String));
        });

        it('should be settable to an empty string', () => {
            const emptyPhoneNumber = '';
            packingSlipAttributes.senderPhoneNumber = emptyPhoneNumber;
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            const error = packingSlip.validateSync();
            
            expect(error).toBeUndefined();
            expect(packingSlip.senderPhoneNumber).toEqual(emptyPhoneNumber);
        });
    });

    describe('attribute: nameOfReceiver', () => {
        it('should be a string', () => {
            const nameOfReceiver = chance.name();
            packingSlipAttributes.nameOfReceiver = nameOfReceiver;
            
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            expect(packingSlip.nameOfReceiver).toEqual(expect.any(String));
            expect(packingSlip.nameOfReceiver).toEqual(nameOfReceiver);
        });
    });

    describe('attribute: receiverAddress', () => {
        it('should not be required', () => {
            delete packingSlipAttributes.receiverAddress;
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            const error = packingSlip.validateSync();

            expect(error).toBeUndefined();
        });

        it('should be setable', () => {
            const address = testDataGenerator.mockData.Address();
            packingSlipAttributes.receiverAddress = address;
            
            const packingSlip = new PackingSlipModel(packingSlipAttributes);

            for (const [key, value] of Object.entries(address)) {
                if (key === 'name') {
                    expect(packingSlip.receiverAddress[key]).toEqual(value.toUpperCase());
                } else {
                    expect(packingSlip.receiverAddress[key]).toEqual(value && value.toUpperCase());
                }
            }
        });
    });

    describe('attribute: deliveryMethod', () => {
        it('should not be required', () => {
            delete packingSlipAttributes.deliveryMethod;
            const packingSlip = new PackingSlipModel(packingSlipAttributes);

            const error = packingSlip.validateSync();

            expect(error).toBeUndefined();
        });

        it('should be a mongoose object id', () => {
            packingSlipAttributes.deliveryMethod = new mongoose.Types.ObjectId();
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            expect(packingSlip.deliveryMethod).toEqual(expect.any(mongoose.Types.ObjectId));
        });
    });

    describe('attribute: shippingCarrier', () => {
        it('should be a string', () => {
            const shippingCarrier = chance.string();
            packingSlipAttributes.shippingCarrier = shippingCarrier;
            
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            expect(packingSlip.shippingCarrier).toEqual(expect.any(String));
        });

        it('should be auto uppercased', () => {
            const shippingCarrier = chance.string().toLowerCase();
            packingSlipAttributes.shippingCarrier = shippingCarrier;

            const packingSlip = new PackingSlipModel(packingSlipAttributes);

            expect(packingSlip.shippingCarrier).toEqual(shippingCarrier.toUpperCase());
        });

        it('should trim whitespace', () => {
            const shippingCarrier = chance.string().toUpperCase();
            packingSlipAttributes.shippingCarrier = `  ${shippingCarrier}  `;

            const packingSlip = new PackingSlipModel(packingSlipAttributes);

            expect(packingSlip.shippingCarrier).toEqual(shippingCarrier);
        });
    });

    describe('attribute: numberOfBoxes', () => {
        it('should be a number', () => {
            const numberOfBoxes = chance.d100();
            packingSlipAttributes.numberOfBoxes = numberOfBoxes;
            
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            expect(packingSlip.numberOfBoxes).toEqual(expect.any(Number));
            expect(packingSlip.numberOfBoxes).toEqual(numberOfBoxes);
        });

        it('should fail validation if attribute is not an integer', () => {
            const invalidNumberOfBoxes = 10.5;
            packingSlipAttributes.numberOfBoxes = invalidNumberOfBoxes;
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            const error = packingSlip.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should not be a negative value', () => {
            const negativeNumberOfBoxes = -1;
            packingSlipAttributes.numberOfBoxes = negativeNumberOfBoxes;
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            const error = packingSlip.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: weight', () => {
        it('should be a number', () => {
            const weight = chance.d100();
            packingSlipAttributes.weight = weight;
            
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            expect(packingSlip.weight).toEqual(expect.any(Number));
            expect(packingSlip.weight).toEqual(weight);
        });

        it('should fail validation if attribute is negative', () => {
            const negativeWeight = -1;
            packingSlipAttributes.weight = negativeWeight;
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            const error = packingSlip.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: freightCost', () => {
        it('should be a number', () => {
            const freightCost = chance.d100();
            packingSlipAttributes.freightCost = freightCost;
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            expect(packingSlip.freightCost).toEqual(expect.any(Number));
            expect(packingSlip.freightCost).toEqual(freightCost);
        });

        it('should fail validation if attribute is negative', () => {
            const negativeFreightCost = -1;
            packingSlipAttributes.freightCost = negativeFreightCost;
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            const error = packingSlip.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should only store up to 2 decimal places', () => {
            const unroundedCost = 123.99999999;
            const roundedCost = 124;
            packingSlipAttributes.freightCost = unroundedCost;
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            expect(packingSlip.freightCost).toEqual(roundedCost);
        });
    });

    describe('attribute: trackingNumber', () => {
        it('should be a string', () => {
            const trackingNumber = chance.string();
            packingSlipAttributes.trackingNumber = trackingNumber;
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            expect(packingSlip.trackingNumber).toEqual(expect.any(String));
            expect(packingSlip.trackingNumber).toEqual(trackingNumber);
        });
    });

    describe('attribute: packagingSlipDateTime', () => {
        it('should default to now in UTC', () => {
            delete packingSlipAttributes.packingSlipDateTime;
            const packingSlip = new PackingSlipModel(packingSlipAttributes);

            console.log('packingSlipDateTime: ', packingSlip.packingSlipDateTime);
            
            const millisecondsPerSecond = 1000;
            const maxExpectedTime = Date.UTC() + millisecondsPerSecond;
            const minExpectedTime = Date.UTC() - millisecondsPerSecond;
            expect(packingSlip.packingSlipDateTime).toBeDefined();
            expect(
                packingSlip.packingSlipDateTime.getTime() > minExpectedTime &&
                packingSlip.packingSlipDateTime.getTime() < maxExpectedTime
            ).toBeTrue;
        });

        it('should be overridable', () => {
            const packingSlipDateTime = new Date();
            packingSlipAttributes.packingSlipDateTime = packingSlipDateTime;
            
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            expect(packingSlip.packingSlipDateTime).toEqual(packingSlipDateTime);
        });
    });

    describe('attribute: freightAccountNumber', () => {
        it('should be a string', () => {
            const freightAccountNumber = chance.d100();
            packingSlipAttributes.freightAccountNumber = freightAccountNumber;
            const packingSlip = new PackingSlipModel(packingSlipAttributes);

            expect(packingSlip.freightAccountNumber).toEqual(expect.any(String));
            expect(packingSlip.freightAccountNumber).toEqual(`${freightAccountNumber}`);
        });
    });

    describe('database interactions', () => {
        beforeAll(async () => {
            await databaseService.connectToTestMongoDatabase();
        });

        afterEach(async () => {
            await databaseService.clearDatabase();
        });

        afterAll(async () => {
            await databaseService.closeDatabase();
        });

        it('should generate packing slip numbers on-save. The first number should be 7000, and each new one adds 1', async () => {
            delete packingSlipAttributes.packingSlipNumber;
            const startingPackingSlipNumber = 7000;
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            const savedPackingSlip = await packingSlip.save();

            expect(savedPackingSlip.packingSlipNumber).toBeDefined();
            expect(savedPackingSlip.packingSlipNumber).toEqual(startingPackingSlipNumber);

            const packingSlip2 = new PackingSlipModel(packingSlipAttributes);
            const savedPackingSlip2 = await packingSlip2.save();

            expect(savedPackingSlip2.packingSlipNumber).toBeDefined();
            expect(savedPackingSlip2.packingSlipNumber).toEqual(startingPackingSlipNumber + 1);

            const packingSlip3 = new PackingSlipModel(packingSlipAttributes);
            const savedPackingSlip3 = await packingSlip3.save();

            expect(savedPackingSlip3.packingSlipNumber).toBeDefined();
            expect(savedPackingSlip3.packingSlipNumber).toEqual(startingPackingSlipNumber + 2);
        });
        
        it('should have timestamps', async () => {
            const packingSlip = new PackingSlipModel(packingSlipAttributes);
            
            const savedPackingSlip = await packingSlip.save();

            expect(savedPackingSlip.createdAt).toBeDefined();
            expect(savedPackingSlip.updatedAt).toBeDefined();
        });
    });
});
import mongoose from 'mongoose';
import Chance from 'chance';
import { CustomerModel } from '../../application/api/models/customer.ts';
import * as databaseService from '../../application/api/services/databaseService';
import * as testDataGenerator from '../../test-utils/testDataGenerator.ts';

const chance = Chance();

function getAddress() {
    return {
        name: chance.string(),
        street: chance.address(),
        city: chance.city(),
        state: chance.state(),
        zipCode: chance.zip()
    };
}

function getContact() {
    return testDataGenerator.mockData.Contact();
}

describe('File: customer', () => {
    let customerAttributes;

    beforeEach(() => {
        customerAttributes = testDataGenerator.mockData.Customer();
    });

    it('should validate if all attributes are defined successfully', () => {
        const customer = new CustomerModel(customerAttributes);

        const error = customer.validateSync();

        expect(error).toBe(undefined);
    });

    it('should have the correct indexes', async () => {
        const indexMetaData = CustomerModel.schema.indexes();
        const expectedIndexes = ['customerId'];

        console.log('indexMetaData: ', indexMetaData);

        const isEveryExpectedIndexActuallyAnIndex = expectedIndexes.every((expectedIndex) => {
            return indexMetaData.some((metaData) => {
                const index = Object.keys(metaData[0])[0];
                if (index === expectedIndex) return true;
            });
        });

        expect(isEveryExpectedIndexActuallyAnIndex).toBe(true);
    });

    describe('attribute: name', () => {
        it('should fail validation if attribute is undefined', () => {
            delete customerAttributes.name;
            const customer = new CustomerModel(customerAttributes);

            const error = customer.validateSync();

            expect(error).toBeDefined();
        });

        it('should be of type String', () => {
            const customer = new CustomerModel(customerAttributes);

            expect(customer.name).toEqual(expect.any(String));
        });

        it('should trim the string', () => {
            const nameWithoutSpaces = chance.string();
            customerAttributes.name = '  ' + nameWithoutSpaces + ' ';

            const customer = new CustomerModel(customerAttributes);

            expect(customer.name).toEqual(nameWithoutSpaces);
        });
    });

    describe('attribute: notes', () => {
        it('should NOT fail validation if attribute is undefined', () => {
            delete customerAttributes.notes;
            const customer = new CustomerModel(customerAttributes);

            const error = customer.validateSync();

            expect(error).not.toBeDefined();
        });

        it('should be of type String', () => {
            const customer = new CustomerModel(customerAttributes);

            expect(customer.notes).toEqual(expect.any(String));
        });

        it('should trim the string', () => {
            const notesWithoutSpaces = chance.string();
            customerAttributes.notes = '  ' + notesWithoutSpaces + ' ';

            const customer = new CustomerModel(customerAttributes);

            expect(customer.notes).toEqual(notesWithoutSpaces);
        });
    });

    describe('attribute: businessLocations', () => {
        it('should NOT fail validation if attribute is undefined', () => {
            delete customerAttributes.businessLocations;
            const customer = new CustomerModel(customerAttributes);

            const error = customer.validateSync();

            expect(error).not.toBeDefined();
        });

        it('should be an array with a single mongoose object', () => {
            customerAttributes.businessLocations = [getAddress()];

            const { businessLocations } = new CustomerModel(customerAttributes);

            expect(businessLocations.length).toEqual(1);
            expect(businessLocations[0]._id).toBeDefined();
        });

        it('should be an array with a multiple mongoose object', () => {
            const addresses = [getAddress(), getAddress()];
            customerAttributes.businessLocations = addresses;

            const { businessLocations } = new CustomerModel(customerAttributes);

            expect(businessLocations.length).toEqual(addresses.length);

            expect(businessLocations[0]._id).toBeDefined();
            expect(businessLocations[1]._id).toBeDefined();
        });

        it('should default to an empty array', () => {
            delete customerAttributes.businessLocations;

            const { businessLocations } = new CustomerModel(customerAttributes);

            expect(businessLocations).toEqual([]);
        });
    });

    describe('attribute: shippingLocations', () => {
        it('should NOT fail validation if attribute is undefined', () => {
            delete customerAttributes.shippingLocations;
            const customer = new CustomerModel(customerAttributes);

            const error = customer.validateSync();

            expect(error).not.toBeDefined();
        });

        it('should be an array with a single mongoose object', () => {
            customerAttributes.shippingLocations = [getAddress()];

            const { shippingLocations } = new CustomerModel(customerAttributes);

            expect(shippingLocations.length).toEqual(1);
            expect(shippingLocations[0]._id).toBeDefined();
        });

        it('should be an array with a multiple mongoose object', () => {
            const addresses = [getAddress(), getAddress()];
            customerAttributes.shippingLocations = addresses;

            const { shippingLocations } = new CustomerModel(customerAttributes);

            expect(shippingLocations.length).toEqual(addresses.length);

            expect(shippingLocations[0]._id).toBeDefined();
            expect(shippingLocations[1]._id).toBeDefined();
        });

        it('should default to an empty array', () => {
            delete customerAttributes.shippingLocations;

            const { shippingLocations } = new CustomerModel(customerAttributes);

            expect(shippingLocations).toEqual([]);
        });

        it('should have a freightAccountNumber attribute and auto-capitalize it', () => {
            const lowerCaseFreightAccountNumber = chance.string().toLowerCase();
            const address = {
                ...getAddress(),
                freightAccountNumber: lowerCaseFreightAccountNumber
            };
            const addresses = [address];
            customerAttributes.shippingLocations = addresses;
            const customer = new CustomerModel(customerAttributes);

            const error = customer.validateSync();

            expect(error).toBeUndefined();
            expect(customer.shippingLocations.length).toEqual(addresses.length);
            expect(customer.shippingLocations[0].freightAccountNumber).toEqual(lowerCaseFreightAccountNumber.toUpperCase());
        });

        it('should have a deliveryMethod attribute', () => {
            const deliveryMethod = new mongoose.Types.ObjectId();
            const address = {
                ...getAddress(),
                deliveryMethod
            };
            const addresses = [address];
            customerAttributes.shippingLocations = addresses;
            const customer = new CustomerModel(customerAttributes);

            const error = customer.validateSync();

            expect(error).toBeUndefined();
            expect(customer.shippingLocations.length).toEqual(addresses.length);
            expect(customer.shippingLocations[0].deliveryMethod).toEqual(deliveryMethod);
            expect(customer.shippingLocations[0].deliveryMethod).toEqual(expect.any(mongoose.Types.ObjectId));
        });
    });

    describe('attribute: billingLocations', () => {
        it('should NOT fail validation if attribute is undefined', () => {
            delete customerAttributes.billingLocations;
            const customer = new CustomerModel(customerAttributes);

            const error = customer.validateSync();

            expect(error).not.toBeDefined();
        });

        it('should be an array with a single mongoose object', () => {
            customerAttributes.billingLocations = [getAddress()];

            const { billingLocations } = new CustomerModel(customerAttributes);

            expect(billingLocations.length).toEqual(1);
            expect(billingLocations[0]._id).toBeDefined();
        });

        it('should be an array with a multiple mongoose object', () => {
            const addresses = [getAddress(), getAddress()];
            customerAttributes.billingLocations = addresses;

            const { billingLocations } = new CustomerModel(customerAttributes);

            expect(billingLocations.length).toEqual(addresses.length);

            expect(billingLocations[0]._id).toBeDefined();
            expect(billingLocations[1]._id).toBeDefined();
        });

        it('should default to an empty array', () => {
            delete customerAttributes.billingLocations;

            const { billingLocations } = new CustomerModel(customerAttributes);

            expect(billingLocations).toEqual([]);
        });
    });

    describe('attribute: contacts', () => {
        it('should fail validation if attribute is empty', () => {
            customerAttributes.contacts = [];
            const customer = new CustomerModel(customerAttributes);

            const error = customer.validateSync();

            expect(error).toBeDefined();
        });

        it('should be an array with a single mongoose object', () => {
            customerAttributes.contacts = [getContact()];

            const { contacts } = new CustomerModel(customerAttributes);

            expect(contacts.length).toEqual(1);
            expect(contacts[0]._id).toBeDefined();
        });

        it('should be an array with a multiple mongoose object', () => { // TPDP
            customerAttributes.contacts = [getContact(), getContact()];

            const { contacts } = new CustomerModel(customerAttributes);

            expect(contacts.length).toEqual(contacts.length);

            expect(contacts[0]._id).toBeDefined();
            expect(contacts[1]._id).toBeDefined();
        });
    });

    describe('attribute: overun', () => {
        it('should fail validation if attribute is undefined', () => {
            delete customerAttributes.overun;
            const customer = new CustomerModel(customerAttributes);

            const error = customer.validateSync();

            expect(error).toBeDefined();
        });

        it('should be of type Number', () => {
            customerAttributes.overun = chance.d100();
            const customer = new CustomerModel(customerAttributes);

            expect(customer.overun).toEqual(expect.any(Number));
        });
    });

    describe('attribute: creditTerms', () => {
        it('should NOT fail validation if attribute is undefined', () => {
            delete customerAttributes.creditTerms;
            const customer = new CustomerModel(customerAttributes);

            const error = customer.validateSync();

            expect(error).not.toBeDefined();
        });

        it('should handle storing an array of mongoose object IDs', () => {
            const creditTerms = [
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId()
            ];
            customerAttributes.creditTerms = creditTerms;

            const customer = new CustomerModel(customerAttributes);

            expect(customer.creditTerms.length).toEqual(creditTerms.length);
            expect(customer.creditTerms[0]).toEqual(creditTerms[0]);
            expect(customer.creditTerms[1]).toEqual(creditTerms[1]);
        });
    });

    describe('attribute: customerId', () => {
        it('should fail validation if attribute is undefined', () => {
            delete customerAttributes.customerId;
            const customer = new CustomerModel(customerAttributes);

            const error = customer.validateSync();

            expect(error).toBeDefined();
        });

        it('should be of type String', () => {
            const customer = new CustomerModel(customerAttributes);

            expect(customer.customerId).toEqual(expect.any(String));
        });

        it('should convert to upper case', () => {
            const lowerCaseCustomerId = chance.string().toLowerCase();
            customerAttributes.customerId = lowerCaseCustomerId;

            const customer = new CustomerModel(customerAttributes);

            expect(customer.customerId).toEqual(lowerCaseCustomerId.toUpperCase());
        });
    });

    describe('verify database interactions', () => {
        beforeEach(async () => {
            await mongoose.syncIndexes(); // Fixes: https://github.com/gavinvaske/the_recipe_book/issues/370
        });

        beforeAll(async () => {
            await databaseService.connectToTestMongoDatabase();
        });

        afterEach(async () => {
            await databaseService.clearDatabase();
        });

        afterAll(async () => {
            await databaseService.closeDatabase();
        });

        it('should soft delete items', async () => {
            const customer = new CustomerModel(customerAttributes);
            const id = customer._id;

            await customer.save();
            await CustomerModel.deleteById(id);

            const softDeletedCustomer = await CustomerModel.findOneDeleted({_id: id}).exec();

            expect(softDeletedCustomer).toBeDefined();
            expect(softDeletedCustomer.deleted).toBe(true);
        });

        describe('verify timestamps on created object', () => {
            it('should have a "createdAt" attribute once object is saved', async () => {
                const customer = new CustomerModel(customerAttributes);
                let savedCustomer = await customer.save({ validateBeforeSave: false });

                expect(savedCustomer.createdAt).toBeDefined();
                expect(savedCustomer.updatedAt).toBeDefined();
            });
            
            it('should have timestamps on "shippingLocation" attribute', async () => {
                const addresses = [getAddress()];
                customerAttributes.shippingLocations = addresses;
                const customer = new CustomerModel(customerAttributes);
                let savedCustomer = await customer.save({ validateBeforeSave: false });

                expect(savedCustomer.shippingLocations[0].createdAt).toBeDefined();
                expect(savedCustomer.shippingLocations[0].updatedAt).toBeDefined();
            });

            it('should have timestamps on "businessLocations" attribute', async () => {
                const addresses = [getAddress()];
                customerAttributes.businessLocations = addresses;
                const customer = new CustomerModel(customerAttributes);
                let savedCustomer = await customer.save({ validateBeforeSave: false });

                expect(savedCustomer.businessLocations[0].createdAt).toBeDefined();
                expect(savedCustomer.businessLocations[0].updatedAt).toBeDefined();
            });

            it('should have timestamps on "billingLocations" attribute', async () => {
                const addresses = [getAddress()];
                customerAttributes.billingLocations = addresses;
                const customer = new CustomerModel(customerAttributes);
                let savedCustomer = await customer.save({ validateBeforeSave: false });

                expect(savedCustomer.billingLocations[0].createdAt).toBeDefined();
                expect(savedCustomer.billingLocations[0].updatedAt).toBeDefined();
            });
          
            it('should have timestamps on "contacts" attribute', async () => {
                const contacts = [getContact()];
                customerAttributes.contacts = contacts;
                const customer = new CustomerModel(customerAttributes);
                let savedCustomer = await customer.save({ validateBeforeSave: false });

                expect(savedCustomer.contacts[0].createdAt).toBeDefined();
                expect(savedCustomer.contacts[0].updatedAt).toBeDefined();
            });
        });

        describe('attribute: customerId', () => {
            it('should be unique', async () => {
                const customerId = '123456789';
                customerAttributes.customerId = customerId;
                const customer1 = new CustomerModel(customerAttributes);

                customerAttributes.customerId = customerId.toLowerCase();
                const customer2 = new CustomerModel(customerAttributes);

                await customer1.save().then(async () => {
                    await expect(customer2.save()).rejects.toThrow(Error);
                });
            });
        });
    });
});
import Chance from 'chance';
import { BaseProductModel } from '../../application/api/models/baseProduct.ts';
import mongoose from 'mongoose';
import * as databaseService from '../../application/api/services/databaseService';
import { CustomerModel } from '../../application/api/models/customer.ts';
import { MaterialModel } from '../../application/api/models/material.ts';
import { unwindDirections } from '../../application/api/enums/unwindDirectionsEnum';
import { finishTypes } from '../../application/api/enums/finishTypesEnum';
import { DieModel } from '../../application/api/models/die.ts';
import * as testDataGenerator from '../../test-utils/testDataGenerator.ts';

jest.mock('../../application/api/services/materialInventoryService.ts');

const chance = Chance();

describe('Product Model', () => {
    let productAttributes;

    beforeEach(() => {
        productAttributes = testDataGenerator.mockData.BaseProduct();
    });

    it('should validate when attributes are defined correctly', () => {
        const product = new BaseProductModel(productAttributes);

        const error = product.validateSync();

        expect(error).not.toBeDefined();
    });

    it('should throw an error if an unknown attribute is defined', () => {
        const unknownAttribute = chance.string();
       
        productAttributes[unknownAttribute] = chance.string();

        expect(() => new BaseProductModel(productAttributes)).toThrow();
    });

    it('should not have a validation error if non-required objectId attributes are set to empty string', () => {
        productAttributes.secondaryMaterial = '';
        productAttributes.finish = '';
        const product = new BaseProductModel(productAttributes);

        const error = product.validateSync();

        expect(error).not.toBeDefined();
    });

    describe('attribute: customer', () => {
        it('should be required', () => {
            delete productAttributes.customer;
            const product = new BaseProductModel(productAttributes);

            const error = product.validateSync();

            expect(error).toBeDefined();
        });

        it('should be a valid mongoose ObjectId', () => {
            const product = new BaseProductModel(productAttributes);

            expect(product.customer).toBeInstanceOf(mongoose.Types.ObjectId);
        });

        it('should fail if attribute is not a valid mongoose ObjectId', () => {
            productAttributes.customer = chance.word();
            const product = new BaseProductModel(productAttributes);

            const error = product.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: productDescription', () => {
        it('should be required', () => {
            delete productAttributes.productDescription;
            const product = new BaseProductModel(productAttributes);

            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be a string', () => {
            const product = new BaseProductModel(productAttributes);
            
            expect(product.productDescription).toEqual(expect.any(String));
        });

        it('should trim whitespace', () => {
            const productDescription = chance.string();
            productAttributes.productDescription = ` ${productDescription}   `;

            const product = new BaseProductModel(productAttributes);

            expect(product.productDescription).toEqual(productDescription);
        });
    });

    describe('attribute: die', () => {
        it('should be required', () => {
            delete productAttributes.die;
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be a valid mongoose ObjectId', () => {
            const product = new BaseProductModel(productAttributes);

            expect(product.die).toBeInstanceOf(mongoose.Types.ObjectId);
        });

        it('should fail if attribute is not a valid mongoose ObjectId', () => {
            productAttributes.die = chance.word();
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: unwindDirection', () => {
        it('should be required', () => {
            delete productAttributes.unwindDirection;
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should fail if attribute is not a valid unwindDirection value', () => {
            productAttributes.unwindDirection = chance.word();
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be a number', () => {
            productAttributes.unwindDirection = chance.pickone(unwindDirections);
            
            const product = new BaseProductModel(productAttributes);
            
            expect(product.unwindDirection).toEqual(expect.any(Number));
        });
    });
    
    describe('attribute: ovOrEpm', () => {
        let ovOrEpmOptions;

        beforeEach(() => {
            ovOrEpmOptions = ['NO', 'OV', 'EPM'];
        });

        it('should be required', () => {
            delete productAttributes.ovOrEpm;
            const product = new BaseProductModel(productAttributes);

            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should fail if attribute is not a valid ovOrEpm value', () => {
            const invalidOvOrEpmOption = chance.string();
            productAttributes.ovOrEpm = invalidOvOrEpmOption;
            const product = new BaseProductModel(productAttributes);

            const error = product.validateSync();

            expect(error).toBeDefined();
        });

        it('should pass validation if attribute is a valid ovOrEpm value', () => {
            const validOvOrEpmOption = chance.pickone(ovOrEpmOptions);
            productAttributes.ovOrEpm = validOvOrEpmOption;
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).not.toBeDefined();
        });

        it('should convert attribute to uppercase', () => {
            const lowerCaseOvOrEpmOption = chance.pickone(ovOrEpmOptions).toLowerCase();
            productAttributes.ovOrEpm = lowerCaseOvOrEpmOption;
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).not.toBeDefined();
            expect(product.ovOrEpm).toEqual(lowerCaseOvOrEpmOption.toUpperCase());
        });
    });

    describe('attribute: artNotes', () => {
        it('should not be required', () => {
            delete productAttributes.artNotes;
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).not.toBeDefined();
        });

        it('should trim whitespace', () => {
            const artNotes = chance.string();
            productAttributes.artNotes = ` ${artNotes}   `;
            
            const product = new BaseProductModel(productAttributes);
            
            expect(product.artNotes).toEqual(artNotes);
        });
    });

    describe('attribute: primaryMaterial', () => {
        it('should be required', () => {
            delete productAttributes.primaryMaterial;
            const product = new BaseProductModel(productAttributes);

            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be a valid mongoose ObjectId', () => {
            const product = new BaseProductModel(productAttributes);
            
            expect(product.primaryMaterial).toBeInstanceOf(mongoose.Types.ObjectId);
        });

        it('should fail if attribute is not a valid mongoose ObjectId', () => {
            productAttributes.primaryMaterial = chance.word();
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: secondaryMaterial', () => {
        it('should not be required', () => {
            delete productAttributes.secondaryMaterial;
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).not.toBeDefined();
        });

        it('should be a valid mongoose ObjectId', () => {
            productAttributes.secondaryMaterial = new mongoose.Types.ObjectId();
            
            const product = new BaseProductModel(productAttributes);
            
            expect(product.secondaryMaterial).toBeInstanceOf(mongoose.Types.ObjectId);
        });

        it('should fail if attribute is not a valid mongoose ObjectId', () => {
            productAttributes.secondaryMaterial = chance.word();
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: finish', () => {
        it('should NOT be required', () => {
            delete productAttributes.finish;
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).not.toBeDefined();
        });

        it('should be a valid mongoose ObjectId', () => {
            const product = new BaseProductModel(productAttributes);
            
            expect(product.finish).toBeInstanceOf(mongoose.Types.ObjectId);
        });

        it('should fail if attribute is not a valid mongoose ObjectId', () => {
            productAttributes.finish = chance.word();
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: pressNotes', () => {
        it('should not be required', () => {
            delete productAttributes.pressNotes;
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).not.toBeDefined();
        });

        it('should trim whitespace', () => {
            const pressNotes = chance.string();
            productAttributes.pressNotes = ` ${pressNotes}   `;
            
            const product = new BaseProductModel(productAttributes);
            
            expect(product.pressNotes).toEqual(pressNotes);
        });
    });

    describe('attribute: finishType', () => {
        it('should be required', () => {
            delete productAttributes.finishType;
            const product = new BaseProductModel(productAttributes);

            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should fail if attribute is not a valid finishType value', () => {
            productAttributes.finishType = chance.word();
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should pass validation if attribute is a valid finishType value AND convert to uppercase', () => {
            const validFinishType = chance.pickone(finishTypes).toLowerCase();
            productAttributes.finishType = validFinishType;
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();

            expect(error).not.toBeDefined();
            expect(product.finishType).toBe(validFinishType.toUpperCase());
        });
    });

    describe('attribute: coreDiameter', () => {
        it('should be required', () => {
            delete productAttributes.coreDiameter;
            const product = new BaseProductModel(productAttributes);

            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should pass validation if attribute is a valid number', () => {
            productAttributes.coreDiameter = chance.integer({ min: 0 });
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).not.toBeDefined();
        });

        it('should fail validation if attribute is negative', () => {
            productAttributes.coreDiameter = chance.integer({ max: -1 });
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: labelsPerRoll', () => {
        it('should be required', () => {
            delete productAttributes.labelsPerRoll;
            const product = new BaseProductModel(productAttributes);

            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should fail validation if attribute is negative', () => {
            productAttributes.labelsPerRoll = chance.integer({ max: -1 });
            const product = new BaseProductModel(productAttributes);

            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should fail validation if attribute is not a whole number', () => {
            productAttributes.labelsPerRoll = chance.floating({ min: 0.01 });
            const product = new BaseProductModel(productAttributes);

            const error = product.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: dieCuttingNotes', () => {
        it('should not be required', () => {
            delete productAttributes.dieCuttingNotes;
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).not.toBeDefined();
        });

        it('should trim whitespace', () => {
            const dieCuttingNotes = chance.string();
            productAttributes.dieCuttingNotes = ` ${dieCuttingNotes}   `;
            
            const product = new BaseProductModel(productAttributes);
            
            expect(product.dieCuttingNotes).toEqual(dieCuttingNotes);
        });
    });
    
    describe('attribute: customer', () => {
        it('should be required', () => {
            delete productAttributes.customer;
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be a valid mongoose ObjectId', () => {
            const product = new BaseProductModel(productAttributes);
            
            expect(product.customer).toBeInstanceOf(mongoose.Types.ObjectId);
        });

        it('should fail validation if attribute is not a valid mongoose ObjectId', () => {
            productAttributes.customer = chance.word();
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: author', () => {
        it('should be required', () => {
            delete productAttributes.author;
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be a valid mongoose ObjectId', () => {
            const product = new BaseProductModel(productAttributes);

            expect(product.author).toBeInstanceOf(mongoose.Types.ObjectId);
        });

        it('should fail validation if attribute is not a valid mongoose ObjectId', () => {
            productAttributes.author = chance.word();
            const product = new BaseProductModel(productAttributes);
            
            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: spotPlate', () => {
        it('should be required', () => {
            delete productAttributes.spotPlate;
            const product = new BaseProductModel(productAttributes);

            const error = product.validateSync();

            expect(error).toBeDefined();
        });

        it('should use defined value instead of default value', () => {
            const definedValue = true;
            productAttributes.spotPlate = definedValue;

            const product = new BaseProductModel(productAttributes);
            
            expect(product.spotPlate).toEqual(definedValue);
        });
    });

    describe('attribute: numberOfColors', () => {
        it('should be required', () => {
            delete productAttributes.numberOfColors;
            const product = new BaseProductModel(productAttributes);

            const error = product.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be a number', () => {
            const product = new BaseProductModel(productAttributes);

            expect(product.numberOfColors).toEqual(expect.any(Number));
        });

        it('should be a whole number', () => {
            const nonWholeNumber = chance.floating({ min: 1 });
            productAttributes.numberOfColors = nonWholeNumber;
            const product = new BaseProductModel(productAttributes);

            const error = product.validateSync();

            expect(error).toBeDefined();
        });

        it('should be a non-negative number', () => {
            const negativeNumber = chance.d100() * -1;
            productAttributes.numberOfColors = negativeNumber;
            const product = new BaseProductModel(productAttributes);

            const error = product.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('verify database interactions', () => {
        let savedCustomer,
            savedDie,
            savedPrimaryMaterial,
            dieAttributes;

        beforeAll(async () => {
            await databaseService.connectToTestMongoDatabase();
        });

        beforeEach(async () => {
            const customerAttributes = testDataGenerator.mockData.Customer();
            const customer = new CustomerModel(customerAttributes);
            savedCustomer = await customer.save();
            productAttributes.customer = savedCustomer._id;

            dieAttributes = testDataGenerator.mockData.Die();
            const die = new DieModel(dieAttributes);

            const materialAttributes = testDataGenerator.mockData.Material();
            const primaryMaterial = new MaterialModel(materialAttributes);

            savedDie = await die.save();
            savedPrimaryMaterial = await primaryMaterial.save();

            productAttributes.die = savedDie._id;
            productAttributes.primaryMaterial = savedPrimaryMaterial._id;
        });

        afterEach(async () => {
            await databaseService.clearDatabase();
        });

        afterAll(async () => {
            await databaseService.closeDatabase();
        });

        it('should have a timestamps once object is saved', async () => {
            const product = new BaseProductModel(productAttributes);

            let savedProduct = await product.save();

            expect(savedProduct.createdAt).toBeDefined();
            expect(savedProduct.updatedAt).toBeDefined();
        });

        it('should soft delete items', async () => {
            const product = new BaseProductModel(productAttributes);
            const productId = product._id;

            await product.save();
            await BaseProductModel.deleteById(productId);

            const softDeletedProduct = await BaseProductModel.findOneDeleted({_id: productId}).exec();

            expect(softDeletedProduct).toBeDefined();
            expect(softDeletedProduct.deleted).toBe(true);
        });

        describe('attribute: productNumber', () => {
            it('should generate the attribute in the correct format', async () => {
                const expectedProductNumber1 = `${savedCustomer.customerId}-001`;
                const expectedProductNumber2 = `${savedCustomer.customerId}-002`;
                const expectedProductNumber3 = `${savedCustomer.customerId}-003`;

                const product1 = new BaseProductModel(productAttributes);
                const product2 = new BaseProductModel(productAttributes);
                const product3 = new BaseProductModel(productAttributes);

                let savedProduct1 = await product1.save();
                let savedProduct2 = await product2.save();
                let savedProduct3 = await product3.save();

                expect(savedProduct1.productNumber).toBe(expectedProductNumber1);
                expect(savedProduct2.productNumber).toBe(expectedProductNumber2);
                expect(savedProduct3.productNumber).toBe(expectedProductNumber3);
            });
        });

        describe('attribute: overun', () => {
            it('should default product.secondaryMaterial to customer.overun when product is initially created', async () => {
                const expectedOverun = savedCustomer.overun;
                const product = new BaseProductModel(productAttributes);
                let savedProduct = await product.save();
                
                expect(savedProduct.overun).toBeDefined();
                expect(savedProduct.overun).toEqual(expectedOverun);
            });

            it('should NOT use the value from customer.overun if product.overun is EXPLICITLY set to equal 0', async () => {
                const product = new BaseProductModel(productAttributes);
                let savedProduct = await product.save();

                savedProduct.overun = 0; // EXPLICITLY set to 0
                savedProduct = await savedProduct.save();
                
                expect(savedProduct.overun).toEqual(0);
            });
        });
    });
});
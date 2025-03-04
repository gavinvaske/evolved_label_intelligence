import Chance from 'chance';
import { MaterialModel } from '../../application/api/models/material.ts';
import mongoose from 'mongoose';
import * as databaseService from '../../application/api/services/databaseService';
import * as testDataGenerator from '../testDataGenerator';
import { populateMaterialInventories as populateMaterialInventoriesMock } from '../../application/api/services/materialInventoryService.ts';
import { when } from 'jest-when';

jest.mock('../../application/api/services/materialInventoryService.ts', () => {
    return {
        populateMaterialInventories: jest.fn()
    };
});

const chance = Chance();

function verifyWeightPerMsiAttribute(materialAttributes, attributeName) {
    let material, error;

    // (1) should be a number
    const expectedWeightPerMsi = 0.01;
    materialAttributes[attributeName] = expectedWeightPerMsi;
    material = new MaterialModel(materialAttributes);

    expect(material[attributeName]).toEqual(expectedWeightPerMsi);

    // (2) should not be less than 0
    materialAttributes[attributeName] = -0.01;
    material = new MaterialModel(materialAttributes);
    error = material.validateSync();
    expect(error).toBeDefined();

    // (3) should round to 4th decimal place
    const decimalToRound = 0.0023555555;
    const expectedRoundedDecimal = 0.0024;
    materialAttributes[attributeName] = decimalToRound;
    material = new MaterialModel(materialAttributes);

    expect(material[attributeName]).toEqual(expectedRoundedDecimal);
}

describe('File: material.js', () => {
    let materialAttributes;

    beforeEach(() => {
        materialAttributes = testDataGenerator.mockData.Material();
    });

    it('should throw error if unknown attribute(s) are defined', () => {
        const unknownAttribute = chance.string();
        materialAttributes[unknownAttribute] = chance.integer();

        expect(() => new MaterialModel(materialAttributes)).toThrow();
    });

    it('should have the correct indexes', async () => {
        const indexMetaData = MaterialModel.schema.indexes();
        const expectedIndexes = ['materialId', 'productNumber'];

        console.log('indexMetaData: ', indexMetaData);

        const isEveryExpectedIndexActuallyAnIndex = expectedIndexes.every((expectedIndex) => {
            return indexMetaData.some((metaData) => {
                const index = Object.keys(metaData[0])[0];
                if (index === expectedIndex) return true;
            });
        });

        expect(isEveryExpectedIndexActuallyAnIndex).toBe(true);
    });

    it('should validate when required attributes are defined', () => {
        const finish = new MaterialModel(materialAttributes);

        const error = finish.validateSync();

        expect(error).toBe(undefined);
    });

    describe('attribute: name', () => {
        it('should be a string', () => {
            materialAttributes.name = chance.integer();
            const material = new MaterialModel(materialAttributes);

            expect(material.name).toEqual(expect.any(String));
        });

        it('should trim whitespace around "name"', () => {
            const name = chance.string();
            materialAttributes.name = ' ' + name + ' ';

            const material = new MaterialModel(materialAttributes);

            expect(material.name).toBe(name.toUpperCase());
        });

        it('should uppercase the attribute', () => {
            const lowerCaseName = chance.string().toLowerCase();
            materialAttributes.name = lowerCaseName;

            const material = new MaterialModel(materialAttributes);

            expect(material.name).toBe(lowerCaseName.toUpperCase());
        });
    });

    describe('attribute: materialId', () => {
        it('should be a string', () => {
            const material = new MaterialModel(materialAttributes);

            expect(material.materialId).toEqual(expect.any(String));
        });

        it('should be required', () => {
            delete materialAttributes.materialId;
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).not.toBe(undefined);
        });

        it('should trim whitespace', () => {
            const materialIdWithoutWhitespace = chance.string().toUpperCase();
            materialAttributes.materialId = '  ' + materialIdWithoutWhitespace + '  ';

            const material = new MaterialModel(materialAttributes);

            expect(material.materialId).toEqual(materialIdWithoutWhitespace);
        });

        it('should uppercase the attribute', () => {
            const lowerCaseMaterialId = chance.string().toLowerCase();
            materialAttributes.materialId = lowerCaseMaterialId;
            
            const material = new MaterialModel(materialAttributes);

            expect(material.materialId).toEqual(lowerCaseMaterialId.toUpperCase());
        });
    });

    describe('attribute: vendor', () => {
        it('should fail validation if attribute is undefined', () => {
            delete materialAttributes.vendor;
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should fail validation if the datatype is not a mongoose object ID', () => {
            const invalidVendor = chance.word();
            materialAttributes.vendor = invalidVendor;
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should pass validation if value is a mongoose object id', () => {
            materialAttributes.vendor = new mongoose.Types.ObjectId();
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeUndefined();
        });
    });

    describe('attribute: materialCategory', () => {
        it('should have attribute', () => {
            materialAttributes.materialCategory = new mongoose.Types.ObjectId();

            const material = new MaterialModel(materialAttributes);

            expect(material.materialCategory).toBeDefined();
        });

        it('should fail validation if attribute is the wrong type', () => {
            materialAttributes.materialCategory = chance.word();
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should handle storing valid mongoose object Ids', () => {
            materialAttributes.materialCategory = new mongoose.Types.ObjectId();
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeUndefined();
            expect(mongoose.Types.ObjectId.isValid(material.materialCategory)).toBe(true);
        });

        it('should fail validation if attribute is undefined', () => {
            delete materialAttributes.materialCategory;
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: thickness', () => {
        it('should fail validation if attribute is undefined', () => {
            delete materialAttributes.thickness;
            const material = new MaterialModel(materialAttributes);
            
            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should fail if attribute is negative', () => {
            materialAttributes.thickness = chance.integer({ max: -1 });
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should be a Number', () => {
            const material = new MaterialModel(materialAttributes);

            expect(material.thickness).toEqual(expect.any(Number));
        });
    });

    describe('attribute: weight', () => {
        it('should fail validation if attribute is undefined', () => {
            delete materialAttributes.weight;
            const material = new MaterialModel(materialAttributes);
            
            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should fail if attribute is negative', () => {
            materialAttributes.weight = chance.integer({ max: -1 });
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should be a Number', () => {
            const material = new MaterialModel(materialAttributes);

            expect(material.weight).toEqual(expect.any(Number));
        });
    });

    describe('attribute: costPerMsi', () => {
        it('should fail validation if attribute is undefined', () => {
            delete materialAttributes.costPerMsi;
            const material = new MaterialModel(materialAttributes);
            
            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should fail if attribute is negative', () => {
            materialAttributes.costPerMsi = chance.integer({ max: -1 });
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should be a Number', () => {
            const material = new MaterialModel(materialAttributes);

            expect(material.costPerMsi).toEqual(expect.any(Number));
        });

        it('should round floating point values to 4th decimal places', () => {
            const priceWithWayTooManyDecimals = '0.255588888';
            materialAttributes.costPerMsi = priceWithWayTooManyDecimals;
            const expectedPrice = 0.2556;

            const material = new MaterialModel(materialAttributes);

            expect(material.costPerMsi).toEqual(expectedPrice);
        });

        it('should fail validation if price is a non-number', () => {
            const invalidPrice = chance.word();
            materialAttributes.costPerMsi = invalidPrice;
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should fail validation if price is empty', () => {
            const invalidPrice = '';
            materialAttributes.costPerMsi = invalidPrice;
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: freightCostPerMsi', () => {
        it('should be a Number', () => {
            const material = new MaterialModel(materialAttributes);

            expect(material.freightCostPerMsi).toEqual(expect.any(Number));
        });

        it('should fail validation if attribute is undefined', () => {
            delete materialAttributes.freightCostPerMsi;
            const material = new MaterialModel(materialAttributes);
            
            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should fail if attribute is negative', () => {
            materialAttributes.freightCostPerMsi = chance.integer({ max: -1 });
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should round floating point values to 4th decimal place', () => {
            const priceWithWayTooManyDecimals = '100.1234567890';
            materialAttributes.freightCostPerMsi = priceWithWayTooManyDecimals;
            const expectedPrice = 100.1235;

            const material = new MaterialModel(materialAttributes);

            expect(material.freightCostPerMsi).toEqual(expectedPrice);
        });

        it('should fail validation if price is a non-number', () => {
            const invalidPrice = chance.word();
            materialAttributes.freightCostPerMsi = invalidPrice;
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should fail validation if price is empty', () => {
            const invalidPrice = '';
            materialAttributes.freightCostPerMsi = invalidPrice;
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: width', () => {
        it('should be a Number', () => {
            const material = new MaterialModel(materialAttributes);

            expect(material.width).toEqual(expect.any(Number));
        });

        it('should fail validation if attribute is undefined', () => {
            delete materialAttributes.width;
            const material = new MaterialModel(materialAttributes);
            
            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should fail if attribute is negative', () => {
            materialAttributes.width = chance.integer({ max: -1 });
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: materialCost', () => {
        it('should be a String', () => {
            const material = new MaterialModel(materialAttributes);

            expect(material.faceColor).toEqual(expect.any(String));
        });

        it('should fail validation if attribute is undefined', () => {
            delete materialAttributes.faceColor;
            const material = new MaterialModel(materialAttributes);
            
            const error = material.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: adhesive', () => {
        it('should be a String', () => {
            const material = new MaterialModel(materialAttributes);

            expect(material.adhesive).toEqual(expect.any(String));
        });

        it('should fail validation if attribute is undefined', () => {
            delete materialAttributes.adhesive;
            const material = new MaterialModel(materialAttributes);
            
            const error = material.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: adhesiveCategory', () => {
        it('should be a mongoose object ID', () => {
            const material = new MaterialModel(materialAttributes);

            expect(mongoose.Types.ObjectId.isValid(material.adhesiveCategory)).toBe(true);
        });

        it('should fail validation if attribute is undefined', () => {
            delete materialAttributes.adhesiveCategory;
            const material = new MaterialModel(materialAttributes);
            
            const error = material.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: quotePricePerMsi', () => {
        it('should be a Number', () => {
            const material = new MaterialModel(materialAttributes);

            expect(material.quotePricePerMsi).toEqual(expect.any(Number));
        });

        it('should fail validation if attribute is undefined', () => {
            delete materialAttributes.quotePricePerMsi;
            const material = new MaterialModel(materialAttributes);
            
            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should fail if attribute is negative', () => {
            materialAttributes.quotePricePerMsi = chance.integer({ max: -1 });
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should round floating points to 4th decimal places', () => {
            const priceWithWayTooManyDecimals = '888.22224444';
            materialAttributes.quotePricePerMsi = priceWithWayTooManyDecimals;
            const expectedPrice = 888.2222;

            const material = new MaterialModel(materialAttributes);

            expect(material.quotePricePerMsi).toEqual(expectedPrice);
        });
    });

    describe('attribute: description', () => {
        it('should be a Number', () => {
            const material = new MaterialModel(materialAttributes);

            expect(material.description).toEqual(expect.any(String));
        });

        it('should fail validation if attribute is undefined', () => {
            delete materialAttributes.description;
            const material = new MaterialModel(materialAttributes);
            
            const error = material.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: whenToUse', () => {
        it('should be a Number', () => {
            const material = new MaterialModel(materialAttributes);

            expect(material.whenToUse).toEqual(expect.any(String));
        });

        it('should fail validation if attribute is undefined', () => {
            delete materialAttributes.whenToUse;
            const material = new MaterialModel(materialAttributes);
            
            const error = material.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: alternativeStock', () => {
        it('should be a Number', () => {
            const material = new MaterialModel(materialAttributes);

            expect(material.alternativeStock).toEqual(expect.any(String));
        });

        it('should NOT FAIL validation if attribute is undefined', () => {
            delete materialAttributes.alternativeStock;
            const material = new MaterialModel(materialAttributes);
            
            const error = material.validateSync();

            expect(error).toBeUndefined();
        });
    });

    describe('attribute: length', () => {
        it('should fail validation if attribute is undefined', () => {
            delete materialAttributes.length;
            const material = new MaterialModel(materialAttributes);
            
            const error = material.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be a Number', () => {
            const material = new MaterialModel(materialAttributes);
            
            expect(material.length).toEqual(expect.any(Number));
        });

        it('should fail validation if attribute is negative', () => {
            materialAttributes.length = chance.integer({ max: -1 });
            const material = new MaterialModel(materialAttributes);
            
            const error = material.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should fail validation if attribute is not an integer', () => {
            materialAttributes.length = 5.55;
            const material = new MaterialModel(materialAttributes);
            
            const error = material.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: facesheetWeightPerMsi', () => {
        it('should be a weightPerMsi attribute', () => {
            verifyWeightPerMsiAttribute(materialAttributes, 'facesheetWeightPerMsi');
        });

        it('should be required', () => {
            delete materialAttributes.facesheetWeightPerMsi;
            const material = new MaterialModel(materialAttributes);
            
            const error = material.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should round to the fourth decimal place', () => {
            const unroundedValue = 0.11115;
            const expectedValue = 0.1112;
            materialAttributes.facesheetWeightPerMsi = unroundedValue;
            
            const material = new MaterialModel(materialAttributes);
            
            expect(material.facesheetWeightPerMsi).toEqual(expectedValue);
        });
    });

    describe('attribute: adhesiveWeightPerMsi', () => {
        it('should be a weightPerMsi attribute', () => {
            verifyWeightPerMsiAttribute(materialAttributes, 'adhesiveWeightPerMsi');
        });

        it('should be required', () => {
            delete materialAttributes.adhesiveWeightPerMsi;
            const material = new MaterialModel(materialAttributes);
            
            const error = material.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: linerWeightPerMsi', () => {
        it('should be a weightPerMsi attribute', () => {
            verifyWeightPerMsiAttribute(materialAttributes, 'linerWeightPerMsi');
        });

        it('should be required', () => {
            delete materialAttributes.linerWeightPerMsi;
            const material = new MaterialModel(materialAttributes);
            
            const error = material.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: locations', () => {
        it('should default to an empty array', () => {
            delete materialAttributes.locations;
            const material = new MaterialModel(materialAttributes);
        
            expect(material.locations).toEqual([]);
        });

        it('should auto uppercase', () => {
            const lowerCaseLocation = 'a1';
            materialAttributes.locations = [lowerCaseLocation];
            const material = new MaterialModel(materialAttributes);
      
            expect(material.locations).toEqual([lowerCaseLocation.toUpperCase()]);
        });

        it('should fail validation if duplicates exist', () => {
            const location = 'P22';
            materialAttributes.locations = [location, location];
            const material = new MaterialModel(materialAttributes);
            const { errors } = material.validateSync();
      
            expect(errors.locations).toBeDefined();
            expect(errors?.locations?.properties?.message.includes('Each location must be unique (i.e no duplicates allowed).')).toBeTruthy();
        });

        it('should fail validation if one of the locaitons is not in the valid format (test #1)', () => {
            const invalidLocations = ['AA12', 'Z100'];
            const validLocations = ['A1', 'z99'];
            const locations = [chance.pickone(invalidLocations), chance.pickone(validLocations)];
            materialAttributes.locations = locations;

            const material = new MaterialModel(materialAttributes);
            const { errors } = material.validateSync();
          
            expect(errors.locations).toBeDefined();
            expect(errors?.locations?.properties?.message.includes('Each location must start with a letter and end with a number between 1 and 99 (Ex: C13).')).toBeTruthy();
        });

        it('should fail validation if one of the locaitons is not in the valid format (test #2)', () => {
            const invalidLocations = ['12', 'Z01', 'A'];
            const validLocations = ['U10', 'p90'];
            const locations = [chance.pickone(invalidLocations), chance.pickone(validLocations)];
            materialAttributes.locations = locations;

            const material = new MaterialModel(materialAttributes);
            const { errors } = material.validateSync();
          
            expect(errors.locations).toBeDefined();
        });
    });

    describe('attribute: linerType', () => {
        it('should be required', () => {
            delete materialAttributes.linerType;
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should fail validation if the datatype is not a mongoose object ID', () => {
            const invalidLinerType = chance.word();
            materialAttributes.linerType = invalidLinerType;
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should pass validation if value is a mongoose object id', () => {
            materialAttributes.linerType = new mongoose.Types.ObjectId();
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeUndefined();
        });
    });

    describe('attribute: productNumber', () => {
        it('should be required', () => {
            delete materialAttributes.productNumber;
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should be a string', () => {
            const expectedValue = chance.string().toUpperCase();
            materialAttributes.productNumber = `  ${expectedValue}  `;
        
            const material = new MaterialModel(materialAttributes);

            expect(material.productNumber).toEqual(expectedValue);
        });

        it('should be trimmed and uppercased', () => {
            const expectedValue = chance.string().toUpperCase();
            materialAttributes.productNumber = `  ${expectedValue.toLowerCase()}  `;
            const material = new MaterialModel(materialAttributes);

            expect(material.productNumber).toBe(expectedValue);
        });
    });

    describe('attribute: masterRollSize', () => {
        it('should be required', () => {
            delete materialAttributes.masterRollSize;
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should be a Number', () => {
            const material = new MaterialModel(materialAttributes);

            expect(material.masterRollSize).toEqual(expect.any(Number));
        });

        it('should not be a floating point number', () => {
            const floatingPointNumber = 1.123;
            materialAttributes.masterRollSize = floatingPointNumber;
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should be greater than zero', () => {
            const negativeNumberOrZero = [-1, 0];
            materialAttributes.masterRollSize = chance.pickone(negativeNumberOrZero);
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: image', () => {
        it('should be required', () => {
            delete materialAttributes.image;
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        it('should be a string', () => {
            const material = new MaterialModel(materialAttributes);

            expect(material.image).toEqual(expect.any(String));
        });

        it('should be a valid url', () => {
            const invalidUrl = chance.word();
            materialAttributes.image = invalidUrl;
            const material = new MaterialModel(materialAttributes);

            const error = material.validateSync();

            expect(error).toBeDefined();
        });

        describe('attribute: lowStockThreshold', () => {
            it('should be required', () => {
                delete materialAttributes.lowStockThreshold;
                const material = new MaterialModel(materialAttributes);

                const { errors } = material.validateSync();

                expect(errors.lowStockThreshold).toBeDefined();
            });

            it('should be a number', () => {
                const material = new MaterialModel(materialAttributes);

                expect(material.lowStockThreshold).toEqual(expect.any(Number));
            });

            it('should fail validation if the value is not a positive number', () => {
                const material = new MaterialModel(materialAttributes);
                const negativeNumber = -1;
                material.lowStockThreshold = negativeNumber;

                const { errors } = material.validateSync();

                expect(errors.lowStockThreshold).toBeDefined();
            });

            it('should fail validation if the value is a floating point number', () => {
                const material = new MaterialModel(materialAttributes);
                const floatingPointNumber = 1.123;
                material.lowStockThreshold = floatingPointNumber;

                const { errors } = material.validateSync();

                expect(errors.lowStockThreshold).toBeDefined();
            });
        });

        describe('attribute: lowStockBuffer', () => {
            it('should be required', () => {
                delete materialAttributes.lowStockBuffer;
                const material = new MaterialModel(materialAttributes);

                const { errors } = material.validateSync();

                expect(errors.lowStockBuffer).toBeDefined();
            });

            it('should be a number', () => {
                const material = new MaterialModel(materialAttributes);

                expect(material.lowStockBuffer).toEqual(expect.any(Number));
            });

            it('should fail validation if the value is not a positive number', () => {
                const material = new MaterialModel(materialAttributes);
                const negativeNumber = -1;
                material.lowStockBuffer = negativeNumber;

                const { errors } = material.validateSync();

                expect(errors.lowStockBuffer).toBeDefined();
            });

            it('should fail validation if the value is a floating point number', () => {
                const material = new MaterialModel(materialAttributes);
                const floatingPointNumber = 1.123;
                material.lowStockBuffer = floatingPointNumber;

                const { errors } = material.validateSync();

                expect(errors.lowStockBuffer).toBeDefined();
            });
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

        it('should populate inventory after material is saved', async () => {
            const material = new MaterialModel(materialAttributes);
            when(populateMaterialInventoriesMock).calledWith([material._id]).mockResolvedValue({});

            await material.save();

            expect(populateMaterialInventoriesMock).toHaveBeenCalledTimes(1);
        });

        it('should soft delete items', async () => {
            const material = new MaterialModel(materialAttributes);
            const id = material._id;

            await material.save();
            await MaterialModel.deleteById(id);

            const softDeletedMaterial = await MaterialModel.findOneDeleted({_id: id}).exec();

            expect(softDeletedMaterial).toBeDefined();
            expect(softDeletedMaterial.deleted).toBe(true);
        });

        it('should have a "createdAt" attribute once object is saved', async () => {
            const material = new MaterialModel(materialAttributes);
            let savedMaterial = await material.save({ validateBeforeSave: false });

            expect(savedMaterial.createdAt).toBeDefined();
            expect(savedMaterial.updatedAt).toBeDefined();
        });


        it('should throw error if two materials with the same productNumber are saved to the DB', async () => {
            const duplicateProductNumber = chance.string();
            const material = new MaterialModel({
                ...testDataGenerator.mockData.Material(),
                productNumber: duplicateProductNumber
            });
            const materialWithDuplicateProductNumber = new MaterialModel({
                ...testDataGenerator.mockData.Material(),
                productNumber: duplicateProductNumber
            });
            const anothaMaterialWithDuplicateProductNumber = new MaterialModel({
                ...testDataGenerator.mockData.Material(),
                productNumber: duplicateProductNumber
            });
            let errorMessage;

            await material.save();

            try {
                await materialWithDuplicateProductNumber.save();
                await anothaMaterialWithDuplicateProductNumber.save();
            } catch (error) {
                errorMessage = error.message;
            }

            expect(errorMessage).toBeDefined();
        });


        describe('attribute: materialId', () => {
            it('should throw error if two materials with the same productNumber are saved to the DB', async () => {
                const duplicateMaterialId = chance.string();
                const material = new MaterialModel({
                    ...testDataGenerator.mockData.Material(),
                    materialId: duplicateMaterialId
                });
                const materialWithDuplicateMaterialId = new MaterialModel({
                    ...testDataGenerator.mockData.Material(),
                    materialId: duplicateMaterialId
                });
                let errorMessage;

                await material.save();

                try {
                    await materialWithDuplicateMaterialId.save();
                } catch (error) {
                    errorMessage = error.message;
                }

                expect(errorMessage).toBeDefined();
            });
        });
    });
});
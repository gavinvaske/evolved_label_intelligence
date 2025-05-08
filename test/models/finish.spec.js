import Chance from 'chance';
const chance = Chance();
import mongoose from 'mongoose';
import { FinishModel } from '../../application/api/models/finish.ts';
import * as databaseService from '../../application/api/services/databaseService';
import * as testDataGenerator from '../../test-utils/testDataGenerator.ts';

describe('validation', () => {
    let finishAttributes;

    beforeEach(() => {
        finishAttributes = testDataGenerator.mockData.Finish();
    });

    it('should fail validation if unknown attribute is defined', () => {
        const unknownAttribute = chance.string();
        finishAttributes[unknownAttribute] = chance.string();

        expect(() => new FinishModel(finishAttributes)).toThrow();
    });

    describe('successful validation', () => {
        it('should validate when required attributes are defined', () => {
            const finish = new FinishModel(finishAttributes);
    
            const error = finish.validateSync();
    
            expect(error).toBe(undefined);
        });

        describe('attribute: name', () => {
            it('should fail if name is undefined', () => {
                delete finishAttributes.name;
                const finish = new FinishModel(finishAttributes);
                
                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should be a string', () => {
                finishAttributes.name = chance.string();
                
                const finish = new FinishModel(finishAttributes);
                
                expect(finish.name).toEqual(expect.any(String));
            });

            it('should trim whitespace around "name"', () => {
                const name = chance.string();
                finishAttributes.name = ' ' + name + ' ';
    
                const finish = new FinishModel(finishAttributes);
    
                expect(finish.name).toBe(name.toUpperCase());
            });

            it('should automatically uppercase', () => {
                const lowerCaseName = chance.string().toLowerCase();
                finishAttributes.name = lowerCaseName;
                
                const finish = new FinishModel(finishAttributes);
                
                expect(finish.name).toBe(lowerCaseName.toUpperCase());
            });
        });

        describe('attribute: finishId', () => {
            it('should fail if attribute is undefined', () => {
                delete finishAttributes.finishId;
                const finish = new FinishModel(finishAttributes);
                
                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should be a string', () => {
                finishAttributes.finishId = chance.string();
                
                const finish = new FinishModel(finishAttributes);
                
                expect(finish.finishId).toEqual(expect.any(String));
            });
        });

        describe('attribute: vendor', () => {
            it('should fail if attribute is undefined', () => {
                delete finishAttributes.vendor;
                const finish = new FinishModel(finishAttributes);

                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should fail validation if attribute is not a mongoose ObjectId', () => {
                finishAttributes.vendor = chance.word();
                const finish = new FinishModel(finishAttributes);
                
                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should be a mongoose ObjectId', () => {
                finishAttributes.vendor = new mongoose.Types.ObjectId();
                
                const finish = new FinishModel(finishAttributes);
                
                expect(finish.vendor).toEqual(expect.any(mongoose.Types.ObjectId));
            });
        });

        describe('attribute: category', () => {
            it('should fail if attribute is undefined', () => {
                delete finishAttributes.category;
                const finish = new FinishModel(finishAttributes);
                
                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should fail validation if attribute is not a mongoose ObjectId', () => {
                finishAttributes.category = chance.word();
                const finish = new FinishModel(finishAttributes);
                
                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should be a mongoose ObjectId', () => {
                finishAttributes.category = new mongoose.Types.ObjectId();
                
                const finish = new FinishModel(finishAttributes);
                
                expect(finish.category).toEqual(expect.any(mongoose.Types.ObjectId));
            });
        });

        describe('attribute: thickness', () => {
            it('should fail validation if attribute is undefined', () => {
                delete finishAttributes.thickness;
                const finish = new FinishModel(finishAttributes);
                
                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should be a number', () => {
                finishAttributes.thickness = String(chance.integer({ min: 0 }));
                
                const finish = new FinishModel(finishAttributes);
                
                expect(finish.thickness).toEqual(expect.any(Number));
            });

            it('should be greater than or equal to 0', () => {
                finishAttributes.thickness = -1;
                const finish = new FinishModel(finishAttributes);
                
                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });
        });
        describe('attribute: weight', () => {
            it('should fail validation if attribute is undefined', () => {
                delete finishAttributes.weight;
                const finish = new FinishModel(finishAttributes);

                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should be a number', () => {
                finishAttributes.weight = String(chance.integer({ min: 0 }));
                
                const finish = new FinishModel(finishAttributes);
                
                expect(finish.weight).toEqual(expect.any(Number));
            });

            it('should be greater than or equal to 0', () => {
                finishAttributes.weight = -1;
                const finish = new FinishModel(finishAttributes);
                
                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });
        });

        describe('attribute: costPerMsi', () => {
            it('should fail validation if attribute is undefined', () => {
                delete finishAttributes.costPerMsi;
                const finish = new FinishModel(finishAttributes);
                
                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should be a number', () => {
                finishAttributes.costPerMsi = String(chance.floating({ min: 0, fixed: 2 }));
                
                const finish = new FinishModel(finishAttributes);
                
                expect(finish.costPerMsi).toEqual(expect.any(Number));
            });

            it('should be greater than or equal to 0', () => {
                finishAttributes.costPerMsi = -1;
                const finish = new FinishModel(finishAttributes);
                
                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should round to 4th decimal place', () => {
                const unroundedDecimal = 123.12345;
                const roundedDecimal = 123.1235;
                finishAttributes.costPerMsi = unroundedDecimal;

                const finish = new FinishModel(finishAttributes);
                
                expect(finish.costPerMsi).toBe(roundedDecimal);
            });
        });

        describe('attribute: freightCostPerMsi', () => {
            it('should fail validation if attribute is undefined', () => {
                delete finishAttributes.freightCostPerMsi;
                const finish = new FinishModel(finishAttributes);
                
                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should be a number', () => {
                finishAttributes.freightCostPerMsi = String(chance.floating({ min: 0, fixed: 2 }));
                
                const finish = new FinishModel(finishAttributes);
                
                expect(finish.freightCostPerMsi).toEqual(expect.any(Number));
            });

            it('should be greater than or equal to 0', () => {
                finishAttributes.freightCostPerMsi = -1;
                const finish = new FinishModel(finishAttributes);

                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should round to 4th decimal place', () => {
                const unroundedDecimal = 123.12345;
                const roundedDecimal = 123.1235;
                finishAttributes.freightCostPerMsi = unroundedDecimal;

                const finish = new FinishModel(finishAttributes);
                
                expect(finish.freightCostPerMsi).toBe(roundedDecimal);
            });
        });

        describe('attribute: width', () => {
            it('should fail validation if attribute is undefined', () => {
                delete finishAttributes.width;
                const finish = new FinishModel(finishAttributes);
                
                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should be a number', () => {
                finishAttributes.width = String(chance.integer({ min: 0 }));
                
                const finish = new FinishModel(finishAttributes);
                
                expect(finish.width).toEqual(expect.any(Number));
            });

            it('should be greater than or equal to 0', () => {
                finishAttributes.width = -1;
                const finish = new FinishModel(finishAttributes);
                
                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });
        });

        describe('attribute: quotePricePerMsi', () => {
            it('should fail validation if attribute is undefined', () => {
                delete finishAttributes.quotePricePerMsi;
                const finish = new FinishModel(finishAttributes);
                
                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should be a number', () => {
                finishAttributes.quotePricePerMsi = String(chance.floating({ min: 0, fixed: 2 }));
                
                const finish = new FinishModel(finishAttributes);
                
                expect(finish.quotePricePerMsi).toEqual(expect.any(Number));
            });

            it('should be greater than or equal to 0.00', () => {
                finishAttributes.quotePricePerMsi = -1;
                const finish = new FinishModel(finishAttributes);
                
                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should round to 4th decimal place', () => {
                const unroundedValue = 12.00005;
                const roundedValue = 12.0001;
                finishAttributes.quotePricePerMsi = unroundedValue;
                
                const finish = new FinishModel(finishAttributes);
                
                expect(finish.quotePricePerMsi).toBe(roundedValue);
            });
        });

        describe('attribute: description', () => {
            it('should fail validation if attribute is undefined', () => {
                delete finishAttributes.description;
                const finish = new FinishModel(finishAttributes);

                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should be a string', () => {
                finishAttributes.description = chance.string();
                
                const finish = new FinishModel(finishAttributes);
                
                expect(finish.description).toEqual(expect.any(String));
            });

            it('should trim whitespace', () => {
                const expectedDescription = chance.string();
                finishAttributes.description = ` ${expectedDescription} `;
                
                const finish = new FinishModel(finishAttributes);
                
                expect(finish.description).toBe(expectedDescription);
            });
        });

        describe('attribute: whenToUse', () => {
            it('should fail validation if attribute is undefined', () => {
                delete finishAttributes.whenToUse;
                const finish = new FinishModel(finishAttributes);
                
                const error = finish.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should be a string', () => {
                finishAttributes.whenToUse = chance.string();
                
                const finish = new FinishModel(finishAttributes);
                
                expect(finish.whenToUse).toEqual(expect.any(String));
            });

            it('should trim whitespace', () => {
                const expectedWhenToUse = chance.string();
                finishAttributes.whenToUse = ` ${expectedWhenToUse} `;
                
                const finish = new FinishModel(finishAttributes);
                
                expect(finish.whenToUse).toBe(expectedWhenToUse);
            });
        });

        describe('attribute: alternativeFinish', () => {
            it('should not fail validation if attribute is undefined', () => {
                delete finishAttributes.alternativeFinish;
                const finish = new FinishModel(finishAttributes);
                
                const error = finish.validateSync();
                
                expect(error).toBeUndefined();
            });
        });
    });

    describe('verify database interactions', () => {
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
            const finish = new FinishModel(finishAttributes);
            const id = finish._id;

            await finish.save();
            await FinishModel.deleteById(id);

            const softDeletedFinish = await FinishModel.findOneDeleted({_id: id}).exec();

            expect(softDeletedFinish).toBeDefined();
            expect(softDeletedFinish.deleted).toBe(true);
        });

        describe('verify timestamps on created object', () => {
            it('should have a "createdAt" attribute once object is saved', async () => {
                const finish = new FinishModel(finishAttributes);
                let savedFinish = await finish.save({ validateBeforeSave: false });

                expect(savedFinish.createdAt).toBeDefined();
                expect(savedFinish.updatedAt).toBeDefined();
            });
        });
    });
});
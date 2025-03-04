/* eslint-disable no-magic-numbers */
import mongoose from 'mongoose';
import Chance from 'chance';
import { MaterialLengthAdjustmentModel } from '../../application/api/models/materialLengthAdjustment.ts';
import * as databaseService from '../../application/api/services/databaseService';
import { populateMaterialInventories as populateMaterialInventoriesMock } from '../../application/api/services/materialInventoryService.ts';

jest.mock('../../application/api/services/materialInventoryService.ts', () => {
    return {
        populateMaterialInventories: jest.fn()
    };
});

const chance = Chance();

describe('File: materialLengthAdjustment', () => {
    let materialLengthAdjustmentAttributes;

    beforeEach(() => {
        materialLengthAdjustmentAttributes = {
            material: new mongoose.Types.ObjectId(),
            length: chance.integer(),
            notes: chance.string()
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should validate successfully', () => {
        const materialLengthAdjustment = new MaterialLengthAdjustmentModel(materialLengthAdjustmentAttributes);

        const error = materialLengthAdjustment.validateSync();

        expect(error).toBeUndefined();
    });

    it('should throw an error if an unknown attribute is defined', () => {
        const unknownAttribute = chance.string();
        materialLengthAdjustmentAttributes[unknownAttribute] = chance.string();

        expect(() => new MaterialLengthAdjustmentModel(materialLengthAdjustmentAttributes)).toThrow();
    });

    describe('attribute: material', () => {
        it('should be required', () => {
            delete materialLengthAdjustmentAttributes.material;
            const materialLengthAdjustment = new MaterialLengthAdjustmentModel(materialLengthAdjustmentAttributes);

            const error = materialLengthAdjustment.validateSync();

            expect(error).toBeDefined();
        });

        it('should fail if not a valid mongoose object id', () => {
            const invalidValues = [chance.integer(), chance.word()];
            materialLengthAdjustmentAttributes.material = chance.pickone(invalidValues);
            const materialLengthAdjustment = new MaterialLengthAdjustmentModel(materialLengthAdjustmentAttributes);

            const error = materialLengthAdjustment.validateSync();

            expect(error).toBeDefined();
        });
    });

    describe('attribute: length', () => {
        it('should be required', () => {
            delete materialLengthAdjustmentAttributes.length;
            const materialLengthAdjustment = new MaterialLengthAdjustmentModel(materialLengthAdjustmentAttributes);

            const error = materialLengthAdjustment.validateSync();

            expect(error).toBeDefined();
        });

        it('should be a number', () => {
            const materialLengthAdjustment = new MaterialLengthAdjustmentModel(materialLengthAdjustmentAttributes);
      
            expect(materialLengthAdjustment.length).toEqual(expect.any(Number));
        });

        it('should be allowed to be negative', () => {
            materialLengthAdjustmentAttributes.length = chance.integer({max: -1});
            const materialLengthAdjustment = new MaterialLengthAdjustmentModel(materialLengthAdjustmentAttributes);

            const error = materialLengthAdjustment.validateSync();

            expect(error).toBeUndefined();
        });
    });

    describe('attribute: notes', () => {
        it('should not be required', () => {
            delete materialLengthAdjustmentAttributes.notes;
            const materialLengthAdjustment = new MaterialLengthAdjustmentModel(materialLengthAdjustmentAttributes);

            const error = materialLengthAdjustment.validateSync();

            expect(error).toBeUndefined();
        });

        it('should be a string', () => {
            const materialLengthAdjustment = new MaterialLengthAdjustmentModel(materialLengthAdjustmentAttributes);

            expect(materialLengthAdjustment.notes).toEqual(expect.any(String));
        });

        it('should be trimmed', () => {
            const expectedNotes = chance.string();
            materialLengthAdjustmentAttributes.notes = `  ${expectedNotes}   `;
            const materialLengthAdjustment = new MaterialLengthAdjustmentModel(materialLengthAdjustmentAttributes);

            expect(materialLengthAdjustment.notes).toEqual(expectedNotes);
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

        it('should update material.inventory once when saved, once when updated, once when deleted', async () => {
            const materialLengthAdjustment = new MaterialLengthAdjustmentModel(materialLengthAdjustmentAttributes);

            const savedItem = await materialLengthAdjustment.save();
            await MaterialLengthAdjustmentModel.findByIdAndUpdate(savedItem._id, { length: chance.integer() }).exec();
            await MaterialLengthAdjustmentModel.findByIdAndDelete(savedItem._id).exec();

            // eslint-disable-next-line no-magic-numbers
            expect(populateMaterialInventoriesMock).toHaveBeenCalledTimes(3);
        });

        it('should update material.inventory once when saved, once when updated, once when deleted', async () => {
            await MaterialLengthAdjustmentModel.insertMany([materialLengthAdjustmentAttributes]);

            expect(populateMaterialInventoriesMock).toHaveBeenCalledTimes(1);
        });

        it('should update material.inventory each time bulkWrite is called', async () => {
            await MaterialLengthAdjustmentModel.bulkWrite([{ insertOne: { document: materialLengthAdjustmentAttributes }}]);
            await MaterialLengthAdjustmentModel.bulkWrite([{ insertOne: { document: materialLengthAdjustmentAttributes }}]);
            await MaterialLengthAdjustmentModel.bulkWrite([{ insertOne: { document: materialLengthAdjustmentAttributes }}]);

            expect(populateMaterialInventoriesMock).toHaveBeenCalledTimes(3);
        });

        it('should update material.inventory each time deleteMany is called', async () => {
            await MaterialLengthAdjustmentModel.deleteMany({length: materialLengthAdjustmentAttributes.length}).exec();
            await MaterialLengthAdjustmentModel.deleteMany({notes: materialLengthAdjustmentAttributes.notes}).exec();

            expect(populateMaterialInventoriesMock).toHaveBeenCalledTimes(2);
        });

        it('should have timestamps', async () => {
            const materialLengthAdjustment = new MaterialLengthAdjustmentModel(materialLengthAdjustmentAttributes);

            const savedItem = await materialLengthAdjustment.save();

            expect(savedItem.createdAt).toBeDefined();
            expect(savedItem.updatedAt).toBeDefined();
        });

        it('should be soft deletable', async () => {
            const materialLengthAdjustment = new MaterialLengthAdjustmentModel(materialLengthAdjustmentAttributes);
            const id = materialLengthAdjustment._id;

            await materialLengthAdjustment.save();
            await MaterialLengthAdjustmentModel.deleteById(id);

            const softDeletedItem = await MaterialLengthAdjustmentModel.findOneDeleted({_id: id}).exec();

            expect(softDeletedItem).toBeDefined();
            expect(softDeletedItem.deleted).toBe(true);
        });
    });
});
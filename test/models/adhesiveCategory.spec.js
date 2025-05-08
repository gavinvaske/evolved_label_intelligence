import Chance from 'chance';
import { AdhesiveCategoryModel } from '../../application/api/models/adhesiveCategory.ts';
import * as databaseService from '../../application/api/services/databaseService';

const chance = Chance();

describe('validation', () => {
    let adhesiveCategoryAttributes;

    beforeEach(() => {
        adhesiveCategoryAttributes = {
            name: chance.string()
        };
    });

    it('should not fail validation if all attributes are defined correctly', () => {
        const adhesiveCategory = new AdhesiveCategoryModel(adhesiveCategoryAttributes);

        const error = adhesiveCategory.validateSync();

        expect(error).toBeUndefined();
    });

    describe('attribute: name', () => {
        it('should be of type String', () => {
            const adhesiveCategory = new AdhesiveCategoryModel(adhesiveCategoryAttributes);

            expect(adhesiveCategory.name).toEqual(expect.any(String));
        });

        it('should fail validation if attribute is not defined', () => {
            delete adhesiveCategoryAttributes.name;
            const adhesiveCategory = new AdhesiveCategoryModel(adhesiveCategoryAttributes);

            const error = adhesiveCategory.validateSync();

            expect(error).toBeDefined();
        });

        it('should trim attribute', () => {
            const expectedName = chance.string();
            adhesiveCategoryAttributes.name = '   ' + expectedName + '  ';
            const downtimeReason = new AdhesiveCategoryModel(adhesiveCategoryAttributes);

            expect(downtimeReason.name).toEqual(expectedName.toUpperCase());
        });

        it('should upper case attribute', () => {
            const lowerCaseName = chance.string().toLowerCase();
            adhesiveCategoryAttributes.name = lowerCaseName;

            const adhesiveCategory = new AdhesiveCategoryModel(adhesiveCategoryAttributes);

            expect(adhesiveCategory.name).toEqual(lowerCaseName.toUpperCase());
        });

    });

    describe('verify timestamps on created object', () => {
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
            const adhesiveCategory = new AdhesiveCategoryModel(adhesiveCategoryAttributes);
            const id = adhesiveCategory._id;

            await adhesiveCategory.save();
            await AdhesiveCategoryModel.deleteById(id);

            const softDeletedAdhesiveCategory = await AdhesiveCategoryModel.findOneDeleted({_id: id}).exec();

            expect(softDeletedAdhesiveCategory).toBeDefined();
            expect(softDeletedAdhesiveCategory.deleted).toBe(true);
        });

        describe('verify timestamps on created object', () => {
            it('should have a "createdAt" attribute once object is saved', async () => {
                const adhesiveCategory = new AdhesiveCategoryModel(adhesiveCategoryAttributes);
                let savedAdhesiveCategory = await adhesiveCategory.save({ validateBeforeSave: false });

                expect(savedAdhesiveCategory.createdAt).toBeDefined();
                expect(savedAdhesiveCategory.updatedAt).toBeDefined();
            });
        });
    });
});
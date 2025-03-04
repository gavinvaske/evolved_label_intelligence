import { BaseProductModel } from '../../application/api/models/baseProduct.ts';
import * as databaseService from '../../application/api/services/databaseService';
import * as testDataGenerator from '../testDataGenerator';
import { FinishModel } from '../../application/api/models/finish.ts';
import { MaterialModel } from '../../application/api/models/material.ts';
import { CustomerModel } from '../../application/api/models/customer.ts';
import * as baseProductService from '../../application/api/services/baseProductService';

jest.mock('../../application/api/services/materialInventoryService.ts');

describe('File: baseProduct.js', () => {
    let baseProductAttributes, baseProduct, primaryMaterial, secondaryMaterial, finish, customer;

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

        describe('Function: getCombinedMaterialThicknessByBaseProductId()', () => {
            beforeEach(async () => {
                const primaryMaterialAttributes = testDataGenerator.mockData.Material();
                const secondaryMaterialAttributes = testDataGenerator.mockData.Material();
                const finishAttributes = testDataGenerator.mockData.Finish();
                const customerAttributes = testDataGenerator.mockData.Customer();

                primaryMaterial = new MaterialModel(primaryMaterialAttributes);
                secondaryMaterial = new MaterialModel(secondaryMaterialAttributes);
                finish = new FinishModel(finishAttributes);
                customer = new CustomerModel(customerAttributes);
                
                await primaryMaterial.save();
                await secondaryMaterial.save();
                await finish.save();
                await customer.save();

                baseProductAttributes = {
                    finish: finish._id,
                    primaryMaterial: primaryMaterial._id,
                    secondaryMaterial: secondaryMaterial._id,
                    customer: customer._id
                };
                baseProduct = new BaseProductModel(baseProductAttributes);

                await baseProduct.save({ validateBeforeSave: false });
            });

            it('should compute the combined material thickness correctly', async () => {
                const expectectedCombinedMaterialThickness = primaryMaterial.thickness + secondaryMaterial.thickness + finish.thickness;
                
                const actualCombinedMaterialThickness = await baseProductService.getCombinedMaterialThicknessByBaseProductId(baseProduct._id);

                expect(actualCombinedMaterialThickness).not.toBeFalsy();
                expect(actualCombinedMaterialThickness).toBe(expectectedCombinedMaterialThickness);
            });

            it('should compute the material thickness correctly when secondaryMaterial is not defined', async () => {
                baseProductAttributes = {
                    ...baseProductAttributes,
                    secondaryMaterial: undefined
                };
                baseProduct = new BaseProductModel(baseProductAttributes);
                await baseProduct.save({ validateBeforeSave: false });
                const expectectedCombinedMaterialThickness = primaryMaterial.thickness + finish.thickness;
                
                const actualCombinedMaterialThickness = await baseProductService.getCombinedMaterialThicknessByBaseProductId(baseProduct._id);

                expect(actualCombinedMaterialThickness).not.toBeFalsy();
                expect(actualCombinedMaterialThickness).toBe(expectectedCombinedMaterialThickness);
            });

            it('should compute the material thickness correctly when finish is not defined', async () => {
                baseProductAttributes = {
                    ...baseProductAttributes,
                    finish: undefined
                };
                baseProduct = new BaseProductModel(baseProductAttributes);
                await baseProduct.save({ validateBeforeSave: false });
                const expectectedCombinedMaterialThickness = primaryMaterial.thickness + secondaryMaterial.thickness;
                
                const actualCombinedMaterialThickness = await baseProductService.getCombinedMaterialThicknessByBaseProductId(baseProduct._id);

                expect(actualCombinedMaterialThickness).not.toBeFalsy();
                expect(actualCombinedMaterialThickness).toBe(expectectedCombinedMaterialThickness);
            });

            it('should compute the material thickness correctly when primaryMaterial is not defined', async () => {
                baseProductAttributes = {
                    ...baseProductAttributes,
                    primaryMaterial: undefined
                };
                baseProduct = new BaseProductModel(baseProductAttributes);
                await baseProduct.save({ validateBeforeSave: false });
                const expectectedCombinedMaterialThickness = secondaryMaterial.thickness + finish.thickness;
                
                const actualCombinedMaterialThickness = await baseProductService.getCombinedMaterialThicknessByBaseProductId(baseProduct._id);

                expect(actualCombinedMaterialThickness).not.toBeFalsy();
                expect(actualCombinedMaterialThickness).toBe(expectectedCombinedMaterialThickness);
            });

        });
    });
});
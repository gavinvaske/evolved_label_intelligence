/* eslint-disable no-magic-numbers */
import { QuoteModel } from '../../application/api/models/quote.ts';
import * as databaseService from '../../application/api/services/databaseService';
import mongoose from 'mongoose';
import * as constants from '../../application/api/enums/constantsEnum.ts';
import * as testDataGenerator from '../../test-utils/testDataGenerator.ts';
import { unwindDirections } from '../../application/api/enums/unwindDirectionsEnum';
import Chance from 'chance';

const chance = Chance();

const FOUR_DECIMAL_PLACES = 4;
const STARTING_QUOTE_NUMBER = 60000;

function verifyPercentageAttribute(quoteAttributes, attributeName) {
    let quote, error;

    // (1) should be a number
    const expectedPercentage = chance.floating({ min: 0.1, max: 0.9, fixed: FOUR_DECIMAL_PLACES });
    quoteAttributes[attributeName] = expectedPercentage;
    quote = new QuoteModel(quoteAttributes);

    expect(quote[attributeName]).toEqual(expect.any(Number));
    expect(quote[attributeName]).toEqual(expectedPercentage);

    // (2) Should not be less than 0
    const negativeValue = -1;
    quoteAttributes[attributeName] = negativeValue;
    quote = new QuoteModel(quoteAttributes);
    
    error = quote.validateSync();

    expect(error).toBeDefined();

    // (3) Should not be greater than 1
    const greaterThanOneValue = 1.01;
    quoteAttributes[attributeName] = greaterThanOneValue;
    quote = new QuoteModel(quoteAttributes);

    error = quote.validateSync();
    
    expect(error).toBeDefined();

    // (4) should round to 4 decimal places
    const decimalToRound = 0.5555555555555555;
    const expectedDecimalValue = 0.5556;
    quoteAttributes[attributeName] = decimalToRound;
    quote = new QuoteModel(quoteAttributes);
    
    expect(quote[attributeName]).toEqual(expectedDecimalValue);
}

function verifyLengthAttribute(quoteAttributes, attributeName) {
    let quote;

    // (1) should be a number
    const expectedLength = chance.d100();
    quoteAttributes[attributeName] = expectedLength;
    quote = new QuoteModel(quoteAttributes);

    expect(quote[attributeName]).toEqual(expect.any(Number));
    expect(quote[attributeName]).toEqual(expectedLength);

    // (2) should be a positive value
    const negativeValue = -1;
    quoteAttributes[attributeName] = negativeValue;
    quote = new QuoteModel(quoteAttributes);
    
    const error = quote.validateSync();

    expect(error).toBeDefined();
}

function verifyNumberOfFramesAttribute(quoteAttributes, attributeName) {
    let quote;

    // (1) should be a number
    const expectedNumberOfRolls = chance.d100();
    quoteAttributes[attributeName] = expectedNumberOfRolls;
    quote = new QuoteModel(quoteAttributes);

    expect(quote[attributeName]).toEqual(expect.any(Number));
    expect(quote[attributeName]).toEqual(expectedNumberOfRolls);

    // (2) should be a positive value
    const negativeValue = -1;
    quoteAttributes[attributeName] = negativeValue;
    quote = new QuoteModel(quoteAttributes);
    
    const error = quote.validateSync();

    expect(error).toBeDefined();
}

function verifyTimeAttribute(quoteAttributes, attributeName) {
    let quote;

    // (1) should be a number
    const expectedTimeInSeconds = chance.d100();
    quoteAttributes[attributeName] = expectedTimeInSeconds;
    quote = new QuoteModel(quoteAttributes);

    expect(quote[attributeName]).toEqual(expect.any(Number));
    expect(quote[attributeName]).toEqual(expectedTimeInSeconds);

    // (2) should be a positive value
    const negativeValue = -1;
    quoteAttributes[attributeName] = negativeValue;
    quote = new QuoteModel(quoteAttributes);
    
    const error = quote.validateSync();

    expect(error).toBeDefined();
}

function verifyNumberOfRollsAttribute(quoteAttributes, attributeName) {
    let quote;

    // (1) should be a number
    const expectedNumberOfRolls = chance.d100();
    quoteAttributes[attributeName] = expectedNumberOfRolls;
    quote = new QuoteModel(quoteAttributes);

    expect(quote[attributeName]).toEqual(expect.any(Number));
    expect(quote[attributeName]).toEqual(expectedNumberOfRolls);

    // (2) should be a positive value
    const negativeValue = -1;
    quoteAttributes[attributeName] = negativeValue;
    quote = new QuoteModel(quoteAttributes);
    
    let error = quote.validateSync();

    expect(error).toBeDefined();

    // (3) should be an integer
    const floatingPointValue = chance.floating({ min: 0.1, max: 0.9 });
    quoteAttributes[attributeName] = floatingPointValue;
    quote = new QuoteModel(quoteAttributes);

    error = quote.validateSync();

    expect(error).toBeDefined();
}

function verifyCostAttribute(quoteAttributes, attributeName) {
    let quote;

    // (1) should be a number
    const expectedNumberOfRolls = chance.d100();
    quoteAttributes[attributeName] = expectedNumberOfRolls;
    quote = new QuoteModel(quoteAttributes);

    expect(quote[attributeName]).toEqual(expect.any(Number));
    expect(quote[attributeName]).toEqual(expectedNumberOfRolls);

    // (2) should round decimals smaller than 2 decimal places
    const expectedValue = chance.d100();
    const decimalToIgnore = 0.004;
    quoteAttributes[attributeName] = expectedValue + decimalToIgnore;

    quote = new QuoteModel(quoteAttributes);

    expect(quote[attributeName]).toEqual(expectedValue);

    // (3) should be a positive value
    const negativeValue = -1;
    quoteAttributes[attributeName] = negativeValue;
    quote = new QuoteModel(quoteAttributes);
    
    const error = quote.validateSync();
    
    expect(error).toBeDefined();

    // (4) should handle floating point decimals up to 2 decimal places
    const numberOfDecimals = 2;
    const floatingPointWithTwoDecimals = chance.floating({ min: 0, fixed: numberOfDecimals});
    quoteAttributes[attributeName] = floatingPointWithTwoDecimals;
    const penniesPerDollar = 100;
    
    quote = new QuoteModel(quoteAttributes);

    // values is converted to pennies below to prevent floating point rounding errors
    expect(Math.floor(quote[attributeName] * penniesPerDollar))
        .toEqual(Math.floor(floatingPointWithTwoDecimals * penniesPerDollar));
}

function generateProduct() {
    return {
        productId: new mongoose.Types.ObjectId(),
        labelQty: chance.d100()
    };
}

function generateNProducts() {
    const n = chance.d10();
    
    return chance.n(generateProduct, n);
}

function generateRandomPercentage() {
    return chance.floating({ min: 0, max: 1, fixed: FOUR_DECIMAL_PLACES});
}

describe('File: quote.js', () => {
    let quoteAttributes;

    beforeEach(() => {
        quoteAttributes = {
            profitMargin: generateRandomPercentage(),
            quoteNumber: STARTING_QUOTE_NUMBER,
            products: generateNProducts(),
            frameLength: chance.floating({ min: 0.1, max: constants.MAX_FRAME_LENGTH_INCHES, fixed: 2 }),
            totalStockFeet: chance.d100(),
            unwindDirection: chance.pickone(unwindDirections)
        };

        const aNumberLessThanTotalStockFeet = quoteAttributes.totalStockFeet - 1;
        quoteAttributes.initialStockLength = aNumberLessThanTotalStockFeet;
    });

    it('should have the correct indexes', async () => {
        const indexMetaData = QuoteModel.schema.indexes();
        const expectedIndexes = ['quoteNumber'];

        console.log('indexMetaData: ', indexMetaData);

        const isEveryExpectedIndexActuallyAnIndex = expectedIndexes.every((expectedIndex) => {
            return indexMetaData.some((metaData) => {
                const index = Object.keys(metaData[0])[0];
                if (index === expectedIndex) return true;
            });
        });

        expect(isEveryExpectedIndexActuallyAnIndex).toBe(true);
    });

    it('should pass validation if all required attributes are present', () => {
        const quote = new QuoteModel(quoteAttributes);
        
        const error = quote.validateSync();
        
        expect(error).toBeUndefined();
    });

    it('should fail validation if unknown attribute is defined', () => {
        const unknownAttribute = chance.string() + chance.string();
        quoteAttributes[unknownAttribute] = chance.string();

        expect(() => new QuoteModel(quoteAttributes)).toThrow();
    });

    describe('attribute: quoteNumber', () => {
        it('should be required', () => {
            delete quoteAttributes.quoteNumber;
            const quote = new QuoteModel(quoteAttributes);

            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be a number', () => {
            const expectedQuoteNumber = `${STARTING_QUOTE_NUMBER}`;
            quoteAttributes.quoteNumber = expectedQuoteNumber;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.quoteNumber).toEqual(expect.any(Number));
        });
    });

    // * Inputs * //
    describe('attribute: profitMargin', () => {
        it('should be required', () => {
            delete quoteAttributes.profitMargin;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be a percentage attribute', () => {
            verifyPercentageAttribute(quoteAttributes, 'profitMargin');
        });
    });

    describe('attribute: labelsPerRollOverride', () => {
        it('should not be required', () => {
            delete quoteAttributes.labelsPerRollOverride;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be a number', () => {
            const expectedLabelsPerRoll = chance.d100();
            quoteAttributes.labelsPerRollOverride = expectedLabelsPerRoll;
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.labelsPerRollOverride).toEqual(expectedLabelsPerRoll);
        });

        it('should be greater than or equal to 1', () => {
            const minLabelsPerRoll = 1;
            quoteAttributes.labelsPerRollOverride = minLabelsPerRoll - 1;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be less than or equal to 1,000,000', () => {
            const maxLabelsPerRoll = 1000000;
            quoteAttributes.labelsPerRollOverride = maxLabelsPerRoll + 1;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be an integer', () => {
            const floatingPointValue = chance.floating({ min: 0, max: 0.9 });
            quoteAttributes.labelsPerRollOverride = floatingPointValue;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: numberOfDesignsOverride', () => {
        it('should be a number', () => {
            const expectedNumberOfDesigns = chance.d100();
            quoteAttributes.numberOfDesignsOverride = expectedNumberOfDesigns;
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.numberOfDesignsOverride).toEqual(expectedNumberOfDesigns);
        });
        
        it('should be greater than or equal to 1', () => {
            const minNumberOfDesigns = 1;
            quoteAttributes.numberOfDesignsOverride = minNumberOfDesigns - 1;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be an integer', () => {
            const floatingPointValue = chance.floating({ min: 0, max: 0.9 });
            quoteAttributes.numberOfDesignsOverride = floatingPointValue;
            const quote = new QuoteModel(quoteAttributes);

            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: reinsertion', () => {
        it('should be a boolean', () => {
            const expectedReinsertion = chance.bool();
            quoteAttributes.reinsertion = expectedReinsertion;
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.reinsertion).toEqual(expectedReinsertion);
        });

        it('should default to false', () => {
            delete quoteAttributes.reinsertion;
            const defaultReinsertion = false;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
            expect(quote.reinsertion).toEqual(defaultReinsertion);
        });
    });

    describe('attribute: variableData', () => {
        it('should be a boolean', () => {
            const expectedVariableData = chance.bool();
            quoteAttributes.variableData = expectedVariableData;
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.variableData).toEqual(expectedVariableData);
        });

        it('should default to false', () => {
            delete quoteAttributes.variableData;
            const defaultVariableData = false;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
            expect(quote.variableData).toEqual(defaultVariableData);
        });
    });

    describe('attribute: isSheeted', () => {
        it('should be a boolean', () => {
            const expectedIsSheeted = chance.bool();
            quoteAttributes.isSheeted = expectedIsSheeted;
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.isSheeted).toEqual(expectedIsSheeted);
        });

        it('should default to false', () => {
            delete quoteAttributes.isSheeted;
            const defaultIsSheeted = false;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
            expect(quote.isSheeted).toEqual(defaultIsSheeted);
        });
    });

    describe('attribute: labelQty', () => {
        it('should be a number', () => {
            const expectedLabelQty = chance.d100();
            quoteAttributes.labelQty = expectedLabelQty;
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.labelQty).toEqual(expectedLabelQty);
        });

        it('should be greater than or equal to 0', () => {
            const minLabelQty = 0;
            quoteAttributes.labelQty = minLabelQty - 1;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: dieOverride', () => {
        beforeEach(() => {
            const die = testDataGenerator.mockData.Die();
            quoteAttributes.dieOverride = {
                sizeAcross: die.sizeAcross,
                sizeAround: die.sizeAround,
                spaceAround: die.spaceAround,
                numberAcross: die.numberAcross
            };
        });

        it('should pass validation when all required attributes are provided', () => {
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should fail validation if unknown attribute is provided', () => {
            const unknownAttribute = chance.string();
            quoteAttributes.dieOverride[unknownAttribute] = chance.string();
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should not be required', () => {
            delete quoteAttributes.dieOverride;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        describe('attribute: dieOverride.sizeAcross', () => {
            it('should be required', () => {
                delete quoteAttributes.dieOverride.sizeAcross;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).not.toBeUndefined();
            });
    
            it('should be greater than or equal to 0', () => {
                const minSizeAcross = 0;
                quoteAttributes.dieOverride.sizeAcross = minSizeAcross - 1;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).toBeDefined();
            });
    
            it('should allow floating point values with 4 decimal places', () => {
                const floatingPointValueWith5DecimalPlaces = 2.0002;
                quoteAttributes.dieOverride.sizeAcross = floatingPointValueWith5DecimalPlaces;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).toBeUndefined();
            });
    
            it('should allow integers', () => {
                const integerValue = chance.d100();
                quoteAttributes.dieOverride.sizeAcross = integerValue;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).toBeUndefined();
            });
        });
        describe('attribute: dieOverride.sizeAround', () => {
            it('should be required', () => {
                delete quoteAttributes.dieOverride.sizeAround;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).toBeDefined();
            });
    
            it('should not be negative', () => {
                quoteAttributes.dieOverride.sizeAround = -1;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).toBeDefined();
            });
        });

        describe('attribute: dieOverride.spaceAround', () => {
            it('should be required', () => {
                delete quoteAttributes.dieOverride.spaceAround;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).toBeDefined();
            });
    
            it('should be a number', () => {
                const expectedSpaceAround = chance.d100();
                quoteAttributes.dieOverride.spaceAround = expectedSpaceAround;
                
                const { dieOverride } = new QuoteModel(quoteAttributes);
                
                expect(dieOverride.spaceAround).toEqual(expectedSpaceAround);
            });
    
            it('should not be negative', () => {
                quoteAttributes.dieOverride.spaceAround = -1;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).toBeDefined();
            });
        });

        describe('attribute: dieOverride.numberAcross', () => {
            it('should be required', () => {
                delete quoteAttributes.dieOverride.numberAcross;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).toBeDefined();
            });
    
            it('should be a number', () => {
                const expectedNumberAcross = chance.d100();
                quoteAttributes.dieOverride.numberAcross = expectedNumberAcross;
                const { dieOverride } = new QuoteModel(quoteAttributes);
                
                expect(dieOverride.numberAcross).toEqual(expectedNumberAcross);
            });
    
            it('should not be negative', () => {
                quoteAttributes.dieOverride.numberAcross = -1;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).toBeDefined();
            });
        });
    });

    describe('attribute: primaryMaterialOverride', () => {
        beforeEach(() => {
            const material = testDataGenerator.mockData.Material();
            quoteAttributes.primaryMaterialOverride = {
                quotePricePerMsi: material.quotePricePerMsi,
                thickness: material.thickness,
                costPerMsi: material.costPerMsi,
            };
        });

        it('should not be required', () => {
            delete quoteAttributes.primaryMaterialOverride;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should share the same validation rules with secondaryMaterialOverride', () => {
            quoteAttributes.secondaryMaterialOverride = quoteAttributes.primaryMaterialOverride;

            let quote = new QuoteModel(quoteAttributes);
            
            let error = quote.validateSync();
            
            expect(error).toBeUndefined();
            
            // This next part of this test "ensures" that the above code doesn't result in a false positive
            const unknownAttribute = chance.word();
            quoteAttributes.secondaryMaterialOverride[unknownAttribute] = chance.word();
            quote = new QuoteModel(quoteAttributes);

            error = quote.validateSync();

            expect(error).toBeDefined();
        });

        describe('attribute: primaryMaterialOverride.thickness', () => {
            it('should be required', () => {
                delete quoteAttributes.primaryMaterialOverride.thickness;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).not.toBeUndefined();
            });
            
            it('should be a number', () => {
                const quote = new QuoteModel(quoteAttributes);
                const { primaryMaterialOverride } = quote;
                
                expect(primaryMaterialOverride.thickness).toEqual(expect.any(Number));
            });

            it('should not be negative', () => {
                const negativeThickness = -1;
                quoteAttributes.primaryMaterialOverride.thickness = negativeThickness;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).toBeDefined();
            });
        });

        describe('attribute: primaryMaterialOverride.costPerMsi', () => {
            it('should be required', () => {
                delete quoteAttributes.primaryMaterialOverride.costPerMsi;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).not.toBeUndefined();
            });

            it('should be a number', () => {
                const quote = new QuoteModel(quoteAttributes);
                
                const { primaryMaterialOverride } = quote;
                
                expect(primaryMaterialOverride.costPerMsi).toEqual(expect.any(Number));
            });

            it('should not be negative', () => {
                const negativeCostPerMsi = -1;
                quoteAttributes.primaryMaterialOverride.costPerMsi = negativeCostPerMsi;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should round to the 4th decimal place', () => {
                const unroundedValue = 123.12345;
                const roundedValue = 123.1235;
                quoteAttributes.primaryMaterialOverride.costPerMsi = unroundedValue;
                const quote = new QuoteModel(quoteAttributes);

                expect(quote.primaryMaterialOverride.costPerMsi).toEqual(roundedValue);
            });
        });

        describe('attribute: primaryMaterialOverride.quotePricePerMsi', () => {
            it('should be required', () => {
                delete quoteAttributes.primaryMaterialOverride.quotePricePerMsi;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).not.toBeUndefined();
            });

            it('should be a number', () => {
                const quote = new QuoteModel(quoteAttributes);
                const { primaryMaterialOverride } = quote;
                
                expect(primaryMaterialOverride.quotePricePerMsi).toEqual(expect.any(Number));
            });

            it('should not be negative', () => {
                const negativeQuotePricePerMsi = -1;
                quoteAttributes.primaryMaterialOverride.quotePricePerMsi = negativeQuotePricePerMsi;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should round to the 4th decimal place', () => {
                const unroundedValue = 0.12345;
                const roundedValue = 0.1235;
                quoteAttributes.primaryMaterialOverride.quotePricePerMsi = unroundedValue;
                const quote = new QuoteModel(quoteAttributes);

                expect(quote.primaryMaterialOverride.quotePricePerMsi).toEqual(roundedValue);
            });
        });
    });

    describe('attribute: finishOverride', () => {
        beforeEach(() => {
            const finish = testDataGenerator.mockData.Finish();
            quoteAttributes.finishOverride = {
                quotePricePerMsi: finish.quotePricePerMsi,
                thickness: finish.thickness,
                costPerMsi: finish.costPerMsi,
            };
        });

        it('should not be required', () => {
            delete quoteAttributes.finishOverride;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should validate successfully when all required attributes are defined', () => {
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should fail validation if unknown attribute is defined', () => {
            const unknownAttribute = chance.string();
            quoteAttributes.finishOverride[unknownAttribute] = chance.word();
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        describe('attribute: finishOverride.thickness', () => {
            it('should be required', () => {
                delete quoteAttributes.finishOverride.thickness;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).not.toBeUndefined();
            });
            
            it('should be a number', () => {
                const quote = new QuoteModel(quoteAttributes);
                const { finishOverride } = quote;
                
                expect(finishOverride.thickness).toEqual(expect.any(Number));
            });

            it('should not be negative', () => {
                const negativeThickness = -1;
                quoteAttributes.finishOverride.thickness = negativeThickness;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).toBeDefined();
            });
        });

        describe('attribute: finishOverride.costPerMsi', () => {
            it('should be required', () => {
                delete quoteAttributes.finishOverride.costPerMsi;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).not.toBeUndefined();
            });

            it('should be a number', () => {
                const quote = new QuoteModel(quoteAttributes);
                const { finishOverride } = quote;
                
                expect(finishOverride.costPerMsi).toEqual(expect.any(Number));
            });

            it('should not be negative', () => {
                const negativeCostPerMsi = -1;
                quoteAttributes.finishOverride.costPerMsi = negativeCostPerMsi;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should round to the 4th decimal place', () => {
                const unroundedValue = 123.12345;
                const roundedValue = 123.1235;
                quoteAttributes.finishOverride.costPerMsi = unroundedValue;
                const quote = new QuoteModel(quoteAttributes);
                
                expect(quote.finishOverride.costPerMsi).toEqual(roundedValue);
            });
        });

        describe('attribute: finishOverride.quotePricePerMsi', () => {
            it('should be required', () => {
                delete quoteAttributes.finishOverride.quotePricePerMsi;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).not.toBeUndefined();
            });

            it('should be a number', () => {
                const quote = new QuoteModel(quoteAttributes);
                const { finishOverride } = quote;
                
                expect(finishOverride.quotePricePerMsi).toEqual(expect.any(Number));
            });

            it('should not be negative', () => {
                const negativeQuotePricePerMsi = -1;
                quoteAttributes.finishOverride.quotePricePerMsi = negativeQuotePricePerMsi;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should round to the 4th decimal place', () => {
                const unroundedValue = 0.11115;
                const roundedValue = 0.1112;
                quoteAttributes.finishOverride.quotePricePerMsi = unroundedValue;
                const quote = new QuoteModel(quoteAttributes);

                expect(quote.finishOverride.quotePricePerMsi).toEqual(roundedValue);
            });
        });
    });

    describe('attribute: coreDiameterOverride', () => {
        it('should default to 3.25', () => {
            delete quoteAttributes.coreDiameterOverride;
            const expectedDefaultValue = 3.25;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.coreDiameterOverride).toEqual(expectedDefaultValue);
        });

        it('should be a number', () => {
            const expectedCoreDiameter = chance.d100();
            quoteAttributes.coreDiameterOverride = expectedCoreDiameter;
            
            const quote = new QuoteModel(quoteAttributes);

            expect(quote.coreDiameterOverride).toEqual(expectedCoreDiameter);
        });

        it('should be greater than or equal to 0', () => {
            const minCoreDiameter = 0;
            quoteAttributes.coreDiameterOverride = minCoreDiameter - 1;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should round to the 2nd decimal place', () => {
            const unroundedValue = 1.123;
            const roundedValue = 1.12;
            quoteAttributes.coreDiameterOverride = unroundedValue;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.coreDiameterOverride).toEqual(roundedValue);
        });
    });

    describe('attribute: numberOfColorsOverride', () => {
        it('should not be required', () => {
            delete quoteAttributes.numberOfColorsOverride;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should not be less than 1', () => {
            const minNumberOfColors = 1;
            quoteAttributes.numberOfColorsOverride = minNumberOfColors - 1;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should not be greater than 12', () => {
            const maxNumberOfColors = 12;
            quoteAttributes.numberOfColorsOverride = maxNumberOfColors + 1;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();

            expect(error).toBeDefined();
        });

        it('should be an integer', () => {
            const expectedNumberOfColors = 1.15;
            quoteAttributes.numberOfColorsOverride = expectedNumberOfColors;
            const quote = new QuoteModel(quoteAttributes);

            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    // * Outputs * //
    describe('attribute: initialStockLength', () => {
        it('should be a length attribute', () => {
            verifyLengthAttribute(quoteAttributes, 'initialStockLength');
        });
    });

    describe('attribute: colorCalibrationFeet', () => {
        it('should be a length attribute', () => {
            verifyLengthAttribute(quoteAttributes, 'colorCalibrationFeet');
        });

    });

    describe('attribute: proofRunupFeet', () => {
        it('should be a length attribute', () => {
            verifyLengthAttribute(quoteAttributes, 'proofRunupFeet');
        });
    });

    describe('attribute: printCleanerFeet', () => {
        it('should be a length attribute', () => {
            verifyLengthAttribute(quoteAttributes, 'printCleanerFeet');
        });
    });

    describe('attribute: scalingFeet', () => {
        it('should be a length attribute', () => {
            verifyLengthAttribute(quoteAttributes, 'scalingFeet');
        });
    });

    describe('attribute: newMaterialSetupFeet', () => {
        it('should be a length attribute', () => {
            verifyLengthAttribute(quoteAttributes, 'newMaterialSetupFeet');
        });
    });

    describe('attribute: dieLineSetupFeet', () => {
        it('should be a length attribute', () => {
            verifyLengthAttribute(quoteAttributes, 'dieLineSetupFeet');
        });
    });

    describe('attribute: dieCutterSetupFeet', () => {
        it('should be a length attribute', () => {
            verifyLengthAttribute(quoteAttributes, 'dieCutterSetupFeet');
        });
    });

    describe('attribute: throwAwayStockPercentage', () => {
        it('should be a percentage attribute', () => {
            verifyPercentageAttribute(quoteAttributes, 'throwAwayStockPercentage');
        });
    });

    describe('attribute: totalStockFeet', () => {
        it('should be a length attribute', () => {
            verifyLengthAttribute(quoteAttributes, 'totalStockFeet');
        });
    });

    describe('attribute: totalStockMsi', () => {
        it('should not be required', () => {
            delete quoteAttributes.totalStockFeet;
            delete quoteAttributes.totalStockMsi;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be a number', () => {
            const expectedTotalStockMsi = chance.d100();
            quoteAttributes.totalStockMsi = expectedTotalStockMsi;
            const quote = new QuoteModel(quoteAttributes);

            expect(quote.totalStockMsi).toEqual(expectedTotalStockMsi);
        });

        it('should round to the 4th decimal place', () => {
            const unroundedValue = 1.12345;
            const roundedValue = 1.1235;
            quoteAttributes.totalStockMsi = unroundedValue;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.totalStockMsi).toEqual(roundedValue);
        });
    });

    describe('attribute: totalRollsOfPaper', () => {
        it('should be a number of rolls attribute', () => {
            verifyNumberOfRollsAttribute(quoteAttributes, 'totalRollsOfPaper');
        });
    });

    describe('attribute: extraFrames', () => {
        it('should be a number of frames attribute', () => {
            verifyNumberOfFramesAttribute(quoteAttributes, 'extraFrames');
        });

        it('should default to 25', () => {
            const expectedDefaultExtraFrames = 25;
            delete quoteAttributes.extraFrames;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.extraFrames).toEqual(expectedDefaultExtraFrames);
        });
    });

    describe('attribute: totalFrames', () => {
        it('should be a number of frames attribute', () => {
            verifyNumberOfFramesAttribute(quoteAttributes, 'totalFrames');
        });
    });

    describe('attribute: totalStockCost', () => {
        it('should be a cost attribute', () => {
            verifyCostAttribute(quoteAttributes, 'totalStockCost');
        });
    });

    describe('attribute: totalFinishFeet', () => {
        it('should be a length attribute', () => {
            verifyLengthAttribute(quoteAttributes, 'totalFinishFeet');
        });
    });

    describe('attribute: totalFinishMsi', () => {
        it('should not be required', () => {
            delete quoteAttributes.totalFinishMsi;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be a number', () => {
            const expectedTotalFinishMsi = chance.d100();
            quoteAttributes.totalFinishMsi = expectedTotalFinishMsi;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.totalFinishMsi).toEqual(expectedTotalFinishMsi);
        });

        it('should be greater than or equal to 0', () => {
            const minTotalFinishMsi = 0;
            quoteAttributes.totalFinishMsi = minTotalFinishMsi - 1;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should round to the 4th decimal place', () => {
            const unroundedValue = 1.12342222222;
            const roundedValue = 1.1234;
            quoteAttributes.totalFinishMsi = unroundedValue;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.totalFinishMsi).toEqual(roundedValue);
        });
    });

    describe('attribute: totalFinishCost', () => {
        it('should be a cost attribute', () => {
            verifyCostAttribute(quoteAttributes, 'totalFinishCost');
        });
    });

    describe('attribute: totalCoreCost', () => {
        it('should be a cost attribute', () => {
            verifyCostAttribute(quoteAttributes, 'totalCoreCost');
        });
    });

    describe('attribute: totalBoxCost', () => {
        it('should be a cost attribute', () => {
            verifyCostAttribute(quoteAttributes, 'totalBoxCost');
        });
    });

    describe('attribute: inlinePrimingCost', () => {
        it('should be a cost attribute', () => {
            verifyCostAttribute(quoteAttributes, 'inlinePrimingCost');
        });
    });

    describe('attribute: scalingClickCost', () => {
        it('should be a cost attribute', () => {
            verifyCostAttribute(quoteAttributes, 'scalingClickCost');
        });
    });

    describe('attribute: proofRunupClickCost', () => {
        it('should be a cost attribute', () => {
            verifyCostAttribute(quoteAttributes, 'proofRunupClickCost');
        });
    });

    describe('attribute: printCleanerClickCost', () => {
        it('should be a cost attribute', () => {
            verifyCostAttribute(quoteAttributes, 'printCleanerClickCost');
        });
    });

    describe('attribute: totalMaterialsCost', () => {
        it('should be a length attribute', () => {
            verifyLengthAttribute(quoteAttributes, 'totalMaterialsCost');
        });
    });

    describe('attribute: stockSpliceTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'stockSpliceTime');
        });
    });

    describe('attribute: colorCalibrationTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'colorCalibrationTime');
        });
    });

    describe('attribute: proofPrintingTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'proofPrintingTime');
        });
    });

    describe('attribute: reinsertionPrintingTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'reinsertionPrintingTime');
        });
    });

    describe('attribute: rollChangeOverTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'rollChangeOverTime');
        });
    });

    describe('attribute: printingStockTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'printingStockTime');
        });
    });

    describe('attribute: printTearDownTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'printTearDownTime');
        });
    });

    describe('attribute: totalTimeAtPrinting', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'totalTimeAtPrinting');
        });
    });

    describe('attribute: throwAwayPrintTimePercentage', () => {
        it('should be a time attribute', () => {
            verifyPercentageAttribute(quoteAttributes, 'throwAwayPrintTimePercentage');
        });
    });

    describe('attribute: totalPrintingCost', () => {
        it('should be a cost attribute', () => {
            verifyCostAttribute(quoteAttributes, 'totalPrintingCost');
        });
    });

    describe('attribute: cuttingStockSpliceTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'cuttingStockSpliceTime');
        });
    });

    describe('attribute: dieSetupTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'dieSetupTime');
        });
    });

    describe('attribute: sheetedSetupTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'sheetedSetupTime');
        });
    });

    describe('attribute: cuttingStockTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'cuttingStockTime');
        });
    });

    describe('attribute: cuttingTearDownTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'cuttingTearDownTime');
        });
    });

    describe('attribute: sheetedTearDownTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes,'sheetedTearDownTime');
        });
    });

    describe('attribute: totalTimeAtCutting', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'totalTimeAtCutting');
        });
    });

    describe('attribute: totalCuttingCost', () => {
        it('should be a cost attribute', () => {
            verifyCostAttribute(quoteAttributes, 'totalCuttingCost');
        });
    });

    describe('attribute: throwAwayCuttingTimePercentage', () => {
        it('should be a percentage attribute', () => {
            verifyPercentageAttribute(quoteAttributes, 'throwAwayCuttingTimePercentage');
        });
    });

    describe('attribute: coreGatheringTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'coreGatheringTime');
        });
    });

    describe('attribute: changeOverTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'changeOverTime');
        });
    });

    describe('attribute: totalWindingRollTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'totalWindingRollTime');
        });
    });

    describe('attribute: labelDropoffAtShippingTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'labelDropoffAtShippingTime');
        });
    });

    describe('attribute: totalWindingTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'totalWindingTime');
        });
    });

    describe('attribute: throwAwayWindingTimePercentage', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'throwAwayWindingTimePercentage');
        });
    });
    describe('attribute: totalFinishedRolls', () => {
        it('should be a number of rolls attribute', () => {
            verifyNumberOfRollsAttribute(quoteAttributes, 'totalFinishedRolls');
        });
    });

    describe('attribute: totalWindingCost', () => {
        it('should be a cost attribute', () => {
            verifyCostAttribute(quoteAttributes, 'totalWindingCost');
        });
    });

    describe('attribute: totalCostOfMachineTime', () => {
        it('should be a cost attribute', () => {
            verifyCostAttribute(quoteAttributes, 'totalCostOfMachineTime');
        });
    });

    describe('attribute: boxCreationTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'boxCreationTime');
        });
    });

    describe('attribute: packagingBoxTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'packagingBoxTime');
        });
    });

    describe('attribute: packingSlipsTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'packingSlipsTime');
        });
    });

    describe('attribute: totalShippingTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'totalShippingTime');
        });
    });

    describe('attribute: totalShippingCost', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes, 'totalShippingCost');
        });
    });

    describe('attribute: reinsertionSetupTime', () => {
        it('should be a time attribute', () => {
            verifyTimeAttribute(quoteAttributes,'reinsertionSetupTime');
        });
    });

    describe('attribute: totalCores', () => {
        it('should not be required', () => {
            delete quoteAttributes.totalCores;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be a number', () => {
            const expectedCores = chance.d100();
            quoteAttributes.totalCores = expectedCores;

            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.totalCores).toEqual(expectedCores);
        });

        it('should fail if attribute is not an integer', () => {
            const floating = 1.123;
            quoteAttributes.totalCores = floating;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should not be negative', () => {
            const negativeNumber = -1;
            quoteAttributes.totalCores = negativeNumber;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: cuttingDiameter', () => {
        it('should not be required', () => {
            delete quoteAttributes.cuttingDiameter;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be a number', () => {
            const expectedDiameter = chance.d100();
            quoteAttributes.cuttingDiameter = expectedDiameter;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.cuttingDiameter).toEqual(expectedDiameter);
        });

        it('should round to the 4th decimal place', () => {
            const unroundedCuttingDiameter = 111.123456789;
            const expectedCuttingDiameter = 111.1235;
            quoteAttributes.cuttingDiameter = unroundedCuttingDiameter;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.cuttingDiameter).toEqual(expectedCuttingDiameter);
        });

        it('should not be negative', () => {
            const negativeNumber = -1;
            quoteAttributes.cuttingDiameter = negativeNumber;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: combinedMaterialThickness', () => {
        it('should be a number', () => {
            const expectedThickness = chance.d100();
            quoteAttributes.combinedMaterialThickness = expectedThickness;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.combinedMaterialThickness).toEqual(expectedThickness);
        });

        it('should be greater than 0', () => {
            const minThickness = 0;
            quoteAttributes.combinedMaterialThickness = minThickness - 1;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should round to the 4th decimal place', () => {
            const unroundedThickness = 111.123456789;
            const expectedThickness = 111.1235;
            quoteAttributes.combinedMaterialThickness = unroundedThickness;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.combinedMaterialThickness).toEqual(expectedThickness);
        });
    });

    describe('attribute: customer', () => {
        it('should not be required', () => {
            delete quoteAttributes.customer;
            const quote = new QuoteModel(quoteAttributes);

            const error = quote.validateSync();

            expect(error).toBeUndefined();
        });

        it('should be a new mongoose.Types.ObjectId', () => {
            const expectedCustomer = new mongoose.Types.ObjectId();
            quoteAttributes.customer = expectedCustomer;
            const quote = new QuoteModel(quoteAttributes);

            expect(quote.customer).toEqual(expectedCustomer);
            expect(quote.customer).toEqual(expect.any(mongoose.Types.ObjectId));
        });
    });

    describe('attribute: frameLength', () => {
        it('should not be required', () => {
            delete quoteAttributes.frameLength;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be a number', () => {
            const expectedFrameLength = 1;
            quoteAttributes.frameLength = expectedFrameLength;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.frameLength).toEqual(expectedFrameLength);
        });

        it('should not be less than 0', () => {
            const minFrameLength = 0;
            quoteAttributes.frameLength = minFrameLength - 1;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should not be greater than MAX_FRAME_LENGTH_INCHES', () => {
            quoteAttributes.frameLength = constants.MAX_FRAME_LENGTH_INCHES + 1;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: frameUtilization', () => {
        it('should not be required', () => {
            delete quoteAttributes.frameUtilization;
            const quote = new QuoteModel(quoteAttributes);

            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be a number', () => {
            const expectedFrameUtilization = 1;
            quoteAttributes.frameUtilization = expectedFrameUtilization;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.frameUtilization).toEqual(expectedFrameUtilization);
        });

        it('should not be less than 0', () => {
            const minFrameUtilization = 0;
            quoteAttributes.frameUtilization = minFrameUtilization - 1;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should not be greater than 1', () => {
            const maxFrameUtilization = 1;
            quoteAttributes.frameUtilization = maxFrameUtilization + 1;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should store round to 4 decimal places of precision', () => {
            const unroundedValue = 0.5555555555;
            const roundedValue = 0.5556;
            quoteAttributes.frameUtilization = unroundedValue;
            
            const quote = new QuoteModel(quoteAttributes);

            expect(quote.frameUtilization).toEqual(roundedValue);
        });

        it('should be undefined if frameLength is not defined', () => {
            delete quoteAttributes.frameLength;
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.frameUtilization).toBeUndefined();
        });
    });

    describe('attribute: finishedRollLength', () => {
        it('should not be required', () => {
            delete quoteAttributes.finishedRollLength;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be a number', () => {
            const expectedFinishRollLength = chance.d100();
            quoteAttributes.finishedRollLength = expectedFinishRollLength;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.finishedRollLength).toEqual(expectedFinishRollLength);
        });

        it('should round to 4 decimal places of precision', () => {
            const unroundedValue = 0.5555555555;
            const roundedValue = 0.5556;
            quoteAttributes.finishedRollLength = unroundedValue;
            
            const quote = new QuoteModel(quoteAttributes);

            expect(quote.finishedRollLength).toEqual(roundedValue);
        });
    });

    describe('attribute: finishedRollDiameter', () => {
        it('should not be required', () => {
            delete quoteAttributes.finishedRollDiameter;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be a number', () => {
            const finishedRollDiameter = chance.d100();
            quoteAttributes.finishedRollDiameter = finishedRollDiameter;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.finishedRollDiameter).toEqual(finishedRollDiameter);
        });

        it('should round to 3 decimal places of precision', () => {
            const unroundedValue = 0.5555555555;
            const roundedValue = 0.556;
            quoteAttributes.finishedRollDiameter = unroundedValue;
            
            const quote = new QuoteModel(quoteAttributes);

            expect(quote.finishedRollDiameter).toEqual(roundedValue);
        });
    });

    describe('attribute: finishedRollDiameterWithoutCore', () => {
        it('should not be required', () => {
            delete quoteAttributes.finishedRollDiameterWithoutCore;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be a number', () => {
            const finishedRollDiameterWithoutCore = chance.d100();
            quoteAttributes.finishedRollDiameterWithoutCore = finishedRollDiameterWithoutCore;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.finishedRollDiameterWithoutCore).toEqual(finishedRollDiameterWithoutCore);
        });

        it('should round to 3 decimal places of precision', () => {
            const unroundedValue = 0.5555555555;
            const roundedValue = 0.556;
            quoteAttributes.finishedRollDiameterWithoutCore = unroundedValue;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.finishedRollDiameterWithoutCore).toEqual(roundedValue);
        });
    });

    describe('attribute: printingSpeed', () => {
        it('should not be required', () => {
            delete quoteAttributes.printingSpeed;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be a number', () => {
            const expectedPrintingSpeed = chance.d100();
            quoteAttributes.printingSpeed = expectedPrintingSpeed;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.printingSpeed).toEqual(expectedPrintingSpeed);
        });

        it('should not be less than 0', () => {
            const minPrintingSpeed = 0;
            quoteAttributes.printingSpeed = minPrintingSpeed - 1;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should round to 4 decimal places', () => {
            const printingSpeed = 1.123456789;
            const roundedPrintingSpeed = 1.1235;
            quoteAttributes.printingSpeed = printingSpeed;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.printingSpeed).toEqual(roundedPrintingSpeed);
        });
    });

    describe('attribute: totalNumberOfRolls', () => {
        it('should not be required', () => {
            delete quoteAttributes.totalNumberOfRolls;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be a number', () => {
            const expectedTotalNumberOfRolls = chance.d100();
            quoteAttributes.totalNumberOfRolls = expectedTotalNumberOfRolls;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.totalNumberOfRolls).toEqual(expectedTotalNumberOfRolls);
        });

        it('should not be negative', () => {
            const minTotalNumberOfRolls = 0;
            quoteAttributes.totalNumberOfRolls = minTotalNumberOfRolls - 1;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be an integer', () => {
            const floatingPointValue = 0.55;
            quoteAttributes.totalNumberOfRolls = floatingPointValue;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: products', () => {
        let expectedProduct;

        beforeEach(() => {
            expectedProduct = {
                productId: new mongoose.Types.ObjectId(),
                labelQty: chance.d100()
            };
            quoteAttributes.products = [expectedProduct];
        });

        it('should not be a required attribute', () => {
            delete quoteAttributes.products;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should default to an empty array', () => {
            delete quoteAttributes.products;
            
            const quote = new QuoteModel(quoteAttributes);

            expect(quote.products).toEqual([]);
        });

        it('should be an array containing objects with the correct attributes', () => {
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.products[0]._id).toBeDefined();
            expect(quote.products[0].productId).toEqual(expectedProduct.productId);
            expect(quote.products[0].labelQty).toEqual(expectedProduct.labelQty);
        });

        describe('attribute: products[n].productId', () => {
            it('should fail validation if attribute does not exist', () => {
                delete quoteAttributes.products[0].productId;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should be a new mongoose.Types.ObjectId type', () => {
                const quote = new QuoteModel(quoteAttributes);
                
                expect(quote.products[0].productId).toEqual(expect.any(mongoose.Types.ObjectId));
            });
        });

        describe('attribute: products[n].labelQty', () => {
            it('should fail validation if attribute IS NOT defined', () => {
                delete quoteAttributes.products[0].labelQty;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).toBeDefined();
            });

            it('should be a number type', () => {
                const quote = new QuoteModel(quoteAttributes);
                
                expect(quote.products[0].labelQty).toEqual(expect.any(Number));
            });

            it('should not be less than 0', () => {
                quoteAttributes.products[0].labelQty = -1;
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();

                expect(error).toBeDefined();
            });

            it('should fail validation if attribute is a floating point number', () => {
                quoteAttributes.products[0].labelQty = chance.floating({ min: 0.1, max: 0.9 });
                const quote = new QuoteModel(quoteAttributes);
                
                const error = quote.validateSync();
                
                expect(error).toBeDefined();
            });
        });
    });

    describe('attribute: totalClicksCost', () => {
        it('should not be required', () => {
            delete quoteAttributes.totalClicksCost;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('it should be a number', () => {
            const totalClicksCost = chance.d100();
            quoteAttributes.totalClicksCost = totalClicksCost;
            
            const quote = new QuoteModel(quoteAttributes);
            
            expect(quote.totalClicksCost).toEqual(totalClicksCost);
        });

        it('should not be negative', () => {
            quoteAttributes.totalClicksCost = -0.1;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });
    });

    describe('attribute: totalMachineCost', () => {
        it('should be a cost attribute', () => {
            verifyCostAttribute(quoteAttributes, 'totalMachineCost');
        });
    });

    describe('attribute: totalProductionCost', () => {
        it('should be a cost attribute', () => {
            verifyCostAttribute(quoteAttributes, 'totalProductionCost');
        });
    });

    describe('attribute: quotedPrice', () => {
        it('should be a cost attribute', () => {
            verifyCostAttribute(quoteAttributes, 'quotedPrice');
        });
    });

    describe('attribute: pricePerThousand', () => {
        it('should be a cost attribute', () => {
            verifyCostAttribute(quoteAttributes, 'pricePerThousand');
        });
    });

    describe('attribute: profit', () => {
        it('should be a cost attribute', () => {
            verifyCostAttribute(quoteAttributes, 'profit');
        });
    });

    describe('attribute: pricePerLabel', () => {
        it('should not be required', () => {
            delete quoteAttributes.pricePerLabel;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeUndefined();
        });

        it('should be a number', () => {
            quoteAttributes.pricePerLabel = chance.d100();
            const quote = new QuoteModel(quoteAttributes);
            
            const { pricePerLabel } = quote;
            
            expect(pricePerLabel).toEqual(expect.any(Number));
        });

        it('should not be negative', () => {
            const negativeCostPerMsi = -1;
            quoteAttributes.pricePerLabel = negativeCostPerMsi;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should round to the 5th decimal place', () => {
            const unroundedValue = 999.123459;
            const roundedValue = 999.12346;
            quoteAttributes.pricePerLabel = unroundedValue;
            const quote = new QuoteModel(quoteAttributes);

            expect(quote.pricePerLabel).toEqual(roundedValue);
        });
    });

    describe('attribute: unwindDirection', () => {
        it('should be required', () => {
            delete quoteAttributes.unwindDirection;
            const quote = new QuoteModel(quoteAttributes);
            
            const error = quote.validateSync();
            
            expect(error).toBeDefined();
        });

        it('should be a number', () => {
            const quote = new QuoteModel(quoteAttributes);
            
            const { unwindDirection } = quote;
            
            expect(unwindDirection).toEqual(expect.any(Number));
        });

        it('should fail if not one of the unwind directions', () => {
            const definitelyNotAValidUnwindDirection = 5893245;
            quoteAttributes.unwindDirection = definitelyNotAValidUnwindDirection;
            const quote = new QuoteModel(quoteAttributes);

            const error = quote.validateSync();
            
            expect(error).toBeDefined();
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

        it('should have timestamps', async () => {
            const quote = new QuoteModel(quoteAttributes);
            let savedquote = await quote.save();

            expect(savedquote.createdAt).toBeDefined();
            expect(savedquote.updatedAt).toBeDefined();
        });
    });
});
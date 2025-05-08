/* eslint-disable no-magic-numbers */
import * as constants from '../../application/api/enums/constantsEnum.ts';
import { createQuote } from '../../application/api/services/quoteService';
import Chance from 'chance';
import mongoose from 'mongoose';
import { when } from 'jest-when';
import { convertMinutesToSeconds, convertSecondsToMinutes } from '../../application/api/services/dateTimeService.ts';
import * as testDataGenerator from '../../test-utils/testDataGenerator.ts';
import * as databaseService from '../../application/api/services/databaseService';

const chance = Chance();

jest.mock('../../application/api/models/die.ts');
jest.mock('../../application/api/models/material.ts');
jest.mock('../../application/api/models/finish.ts');
jest.mock('../../application/api/models/baseProduct.ts');

import { DieModel } from '../../application/api/models/die.ts';
import { MaterialModel } from '../../application/api/models/material.ts';
import { FinishModel } from '../../application/api/models/finish.ts';
import { BaseProductModel } from '../../application/api/models/baseProduct.ts';
import { unwindDirections } from '../../application/api/enums/unwindDirectionsEnum';

const FEET_PER_ROLL = 5000;
const ONE_THOUSAND = 1000;
const FOUR = 4;
const MINUTES_PER_HOUR = 60;
const THREE_DECIMAL_PLACES = 3;
const STARTING_QUOTE_NUMBER = 60000;

function generateProduct(mongooseProductId) {
    return {
        productId: mongooseProductId,
        labelQty: chance.d100()
    };
}

function generateMaterial() {
    return {
        _id: new mongoose.Types.ObjectId(),
        quotePricePerMsi: chance.d100(),
        thickness: chance.integer({ min: 1, max: 2 }),
        costPerMsi: chance.d100()
    };
}

function generateFinish() {
    return {
        _id: new mongoose.Types.ObjectId(),
        quotePricePerMsi: chance.d100(),
        thickness: chance.integer({ min: 1, max: 2 }),
        costPerMsi: chance.d100()
    };
}

function generateDie() {
    return {
        _id: new mongoose.Types.ObjectId(),
        sizeAcross: 1,
        sizeAround: chance.d6(),
        spaceAround: chance.d6(),
        numberAcross: chance.d12()
    };
}

function computeFrameLength(die) {
    const { sizeAround, spaceAround } = die;

    const frameNumberAround = Math.floor(constants.MAX_FRAME_LENGTH_INCHES / (sizeAround + spaceAround));

    return (sizeAround + spaceAround) * frameNumberAround;
}

function getExpectedPrintingSpeed(numberOfColors, die) {
    const frameLength = computeFrameLength(die);
    const printingSpeed = 60 / ((numberOfColors * 0.49) * (12 / (frameLength))); // eslint-disable-line no-magic-numbers

    return printingSpeed;
}

const INCHES_PER_FOOT = 12;

describe('File: quoteService.js', () => {
    let quoteInputAttributes, die, primaryMaterial, secondaryMaterial, finish, baseProduct;

    beforeEach(() => {
        die = generateDie();
        primaryMaterial = generateMaterial();
        secondaryMaterial = generateMaterial();
        finish = generateFinish();
        baseProduct = {
            _id: new mongoose.Types.ObjectId(),
            die: die._id,
            primaryMaterial: primaryMaterial._id,
            secondaryMaterial: secondaryMaterial._id,
            finish: finish._id,
            labelsPerRoll: chance.integer({ min: 100, max: 1000 }),
            numberOfColors: chance.integer({ min: 1, max: 12 }),
            coreDiameter: 3.25 // eslint-disable-line no-magic-numbers
        };

        when(DieModel.findById)
            .calledWith(die._id)
            .mockResolvedValue(die);
        when(FinishModel.findById)
            .calledWith(finish._id)
            .mockResolvedValue(finish);
        when(BaseProductModel.findById)
            .calledWith(baseProduct._id)
            .mockResolvedValue(baseProduct);
        when(MaterialModel.findById)
            .calledWith(primaryMaterial._id)
            .mockResolvedValue(primaryMaterial);
        when(MaterialModel.findById)
            .calledWith(secondaryMaterial._id)
            .mockResolvedValue(secondaryMaterial);

        quoteInputAttributes = {
            quoteNumber: STARTING_QUOTE_NUMBER,
            labelQty: chance.integer({ min: 100, max: 1000 }),
            products: [generateProduct(baseProduct._id)],
            unwindDirection: chance.pickone(unwindDirections)
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Function: createQuote', () => {
        describe('attribute: initialStockLength', () => {
            it('should compute using dieOverride.sizeAround and dieOverride.spaceAround when defined', async () => {
                const dieOverride = generateDie();
                quoteInputAttributes = {
                    ...quoteInputAttributes,
                    dieOverride
                };
                const { labelQty } = quoteInputAttributes;
                const expectedValue = (((dieOverride.sizeAround + dieOverride.spaceAround) * labelQty) / dieOverride.numberAcross) / INCHES_PER_FOOT;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.initialStockLength).not.toBeFalsy();
                expect(quote.initialStockLength).toBeCloseTo(expectedValue, 3);
            });

            it('should compute using die.sizeAround and die.spaceAround when dieOverride not defined', async () => {
                delete quoteInputAttributes.dieOverride;
                quoteInputAttributes = {
                    ...quoteInputAttributes,
                    labelQty: chance.d100()
                };
                const { labelQty } = quoteInputAttributes;
                const { sizeAround, spaceAround } = die;
                const expectedValue = (((sizeAround + spaceAround) * labelQty) / die.numberAcross) / INCHES_PER_FOOT;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.initialStockLength).not.toBeFalsy();
                expect(quote.initialStockLength).toBeCloseTo(expectedValue, 4);
            });
        });

        describe('attribute: printCleanerFeet', () => {
            it('should compute the attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const {
                    initialStockLength, colorCalibrationFeet, proofRunupFeet,
                    dieCutterSetupFeet, scalingFeet, newMaterialSetupFeet
                } = quote;
                const sum = initialStockLength + colorCalibrationFeet + proofRunupFeet + dieCutterSetupFeet + scalingFeet + newMaterialSetupFeet;
                const expectedValue = Math.ceil(sum / FEET_PER_ROLL) * constants.PRINT_CLEANER_FEET;

                expect(quote.printCleanerFeet).not.toBeFalsy();
                expect(quote.printCleanerFeet).toBeCloseTo(expectedValue, 2);
            });
        });

        describe('attribute: colorCalibrationFeet', () => {
            it('should compute the attribute correctly', async () => {
                const threeProducts = [quoteInputAttributes.products[0], quoteInputAttributes.products[0], quoteInputAttributes.products[0]];
                quoteInputAttributes.products = threeProducts;
                const numberOfDesigns = threeProducts.length;
                const expectedValue = numberOfDesigns * constants.COLOR_CALIBRATION_FEET;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.colorCalibrationFeet).not.toBeFalsy();
                expect(quote.colorCalibrationFeet).toEqual(expectedValue);
            });

            it('should compute the attribute correctly when numberOfDesignsOverride is defined', async () => {
                const numberOfDesignsOverride = chance.d100();
                quoteInputAttributes.numberOfDesignsOverride = numberOfDesignsOverride;
                const expectedValue = numberOfDesignsOverride * constants.COLOR_CALIBRATION_FEET;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.colorCalibrationFeet).not.toBeFalsy();
                expect(quote.colorCalibrationFeet).toEqual(expectedValue);
            });
        });

        describe('attribute: proofRunupFeet', () => {
            it('should set attribute to a constant value', async () => {
                const expectedValue = constants.PROOF_RUNUP_FEET;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.proofRunupFeet).not.toBeFalsy();
                expect(quote.proofRunupFeet).toEqual(expectedValue);
            });
        });

        describe('attribute: scalingFeet', () => {
            it('should set attribute to a constant value', async () => {
                const expectedValue = constants.SCALING_FEET;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.scalingFeet).not.toBeFalsy();
                expect(quote.scalingFeet).toEqual(expectedValue);
            });
        });

        describe('attribute: newMaterialSetupFeet', () => {
            it('should set attribute to a constant value', async () => {
                const expectedValue = constants.NEWLY_LOADED_ROLL_WASTE_FEET;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.newMaterialSetupFeet).not.toBeFalsy();
                expect(quote.newMaterialSetupFeet).toEqual(expectedValue);
            });
        });

        describe('attribute: dieLineSetupFeet', () => {
            it('should compute attribute correctly when sizeAroundOverride and spaceAroundOverride are defined', async () => {
                const dieOverride = generateDie();
                quoteInputAttributes = {
                    ...quoteInputAttributes,
                    dieOverride
                };
                const expectedFrameLength = computeFrameLength(dieOverride);
                const expectedValue = (expectedFrameLength * 2) / INCHES_PER_FOOT;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.dieLineSetupFeet).not.toBeFalsy();
                expect(quote.dieLineSetupFeet).toBeCloseTo(expectedValue, 4);
            });
        });

        describe('attribute: totalStockFeet', () => {
            it('should compute attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const {
                    initialStockLength, colorCalibrationFeet, proofRunupFeet, dieCutterSetupFeet,
                    printCleanerFeet, scalingFeet, newMaterialSetupFeet, dieLineSetupFeet
                } = quote;
                const expectedTotalStockFeet =
          initialStockLength + colorCalibrationFeet + proofRunupFeet + dieCutterSetupFeet
          + printCleanerFeet + scalingFeet + newMaterialSetupFeet + dieLineSetupFeet;

                expect(quote.totalStockFeet).not.toBeFalsy();
                expect(quote.totalStockFeet).toBeCloseTo(expectedTotalStockFeet, 3);
            });
        });

        describe('attribute: totalRollsOfPaper', () => {
            it('should be set to 0 if totalStockFeet is less than or equal to 5000 (FEET_PER_ROLL)', async () => {
                const numberThatShouldForceTotalStockFeetToBeLessThan5000 = chance.d10();
                quoteInputAttributes.labelQty = numberThatShouldForceTotalStockFeetToBeLessThan5000;

                const quote = await createQuote(quoteInputAttributes);

                const sanityCheck = quote.totalStockFeet <= FEET_PER_ROLL;

                expect(sanityCheck).toEqual(true);
                expect(quote.totalRollsOfPaper).toBeDefined();
                expect(quote.totalRollsOfPaper).toEqual(0);
            });

            it('should be computed correctly if totalStockFeet is greater than 5000 (FEET_PER_ROLL)', async () => {
                const bigInteger = 9950000;
                const numberThatShouldForceTotalStockFeetToBeGreaterThan5000 = bigInteger;
                quoteInputAttributes.labelQty = numberThatShouldForceTotalStockFeetToBeGreaterThan5000;

                const quote = await createQuote(quoteInputAttributes);

                const expectedNumberOfRolls = Math.floor(quote.totalStockFeet / FEET_PER_ROLL) - 1;
                const sanityCheck = quote.totalStockFeet > FEET_PER_ROLL;

                expect(sanityCheck).toEqual(true);
                expect(quote.totalRollsOfPaper).not.toBeFalsy();
                expect(quote.totalRollsOfPaper).toEqual(expectedNumberOfRolls);
            });
        });

        describe('attribute: throwAwayStockPercentage', () => {
            it('should compute attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { initialStockLength, totalStockFeet } = quote;

                const expectedValue = 1 - (initialStockLength / totalStockFeet);

                expect(quote.throwAwayStockPercentage).not.toBeFalsy();
                expect(quote.throwAwayStockPercentage).toBeCloseTo(expectedValue, 2);
            });
        });

        describe('attribute: totalStockMsi', () => {
            it('should compute attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { totalStockFeet } = quote;

                const expectedValue = (totalStockFeet * constants.MAX_MATERIAL_SIZE_ACROSS * INCHES_PER_FOOT) / ONE_THOUSAND;

                expect(quote.totalStockMsi).not.toBeFalsy();
                expect(quote.totalStockMsi).toBeCloseTo(expectedValue, 2);
            });
        });

        describe('attribute: totalFinishFeet', () => {
            it('should compute the attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { initialStockLength, dieCutterSetupFeet, printCleanerFeet, dieLineSetupFeet } = quote;

                const expectedValue = initialStockLength + printCleanerFeet + dieCutterSetupFeet + dieLineSetupFeet;

                expect(quote.totalFinishFeet).not.toBeFalsy();
                expect(quote.totalFinishFeet).toBeCloseTo(expectedValue, 2);
            });
        });

        describe('attribute: totalFinishMsi', () => {
            it('should compute the attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { totalFinishFeet } = quote;

                const expectedValue = (totalFinishFeet * constants.MAX_MATERIAL_SIZE_ACROSS * INCHES_PER_FOOT) / ONE_THOUSAND;

                expect(quote.totalFinishMsi).not.toBeFalsy();
                expect(quote.totalFinishMsi).toBeCloseTo(expectedValue, 2);
            });
        });

        describe('attribute: totalCoreCost', () => {
            it('should compute the attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { totalCores } = quote;

                const expectedValue = totalCores * constants.PER_CORE_COST;

                expect(quote.totalCoreCost).not.toBeFalsy();
                expect(quote.totalCoreCost).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: inlinePrimingCost', () => {
            it('should compute the attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { totalStockMsi } = quote;

                const expectedValue = totalStockMsi * constants.INLINE_PRIMING_COST_PER_MSI;

                expect(quote.inlinePrimingCost).not.toBeFalsy();
                expect(quote.inlinePrimingCost).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: scalingClickCost', () => {
            it('should be computed correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { SCALING_CLICKS, COST_PER_COLOR } = constants;

                const expectedValue = SCALING_CLICKS * baseProduct.numberOfColors * 2 * COST_PER_COLOR;

                expect(quote.scalingClickCost).not.toBeFalsy();
                expect(quote.scalingClickCost).toBeCloseTo(expectedValue, 1);
            });

            it('should be computed correctly when numberOfColorsOverride is defined', async () => {
                const numberOfColorsOverride = chance.d12();
                quoteInputAttributes = {
                    ...quoteInputAttributes,
                    numberOfColorsOverride
                };
                const quote = await createQuote(quoteInputAttributes);
                const { SCALING_CLICKS, COST_PER_COLOR } = constants;

                const expectedValue = SCALING_CLICKS * numberOfColorsOverride * 2 * COST_PER_COLOR;

                expect(quote.scalingClickCost).not.toBeFalsy();
                expect(quote.scalingClickCost).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: proofRunupClickCost', () => {
            it('should be computed correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const numberOfDesigns = quoteInputAttributes.products.length;

                const expectedValue = constants.COST_PER_COLOR * baseProduct.numberOfColors * 2 * numberOfDesigns;

                expect(quote.proofRunupClickCost).not.toBeFalsy();
                expect(quote.proofRunupClickCost).toBeCloseTo(expectedValue, 1);
            });

            it('should be computed correctly when numberOfColorsOverride is defined', async () => {
                const numberOfColorsOverride = chance.d12();
                quoteInputAttributes = {
                    ...quoteInputAttributes,
                    numberOfColorsOverride
                };
                const quote = await createQuote(quoteInputAttributes);
                const numberOfDesigns = quoteInputAttributes.products.length;

                const expectedValue = constants.COST_PER_COLOR * numberOfColorsOverride * 2 * numberOfDesigns;

                expect(quote.proofRunupClickCost).not.toBeFalsy();
                expect(quote.proofRunupClickCost).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: printCleanerClickCost', () => {
            it('should be computed correctly (when totalStockFeet < 5000)', async () => {
                const numberThatShouldForceTotalStockFeetToBeLessThan5000 = 6;
                quoteInputAttributes.labelQty = numberThatShouldForceTotalStockFeetToBeLessThan5000;

                const quote = await createQuote(quoteInputAttributes);
                const { PRINT_CLEANER_FRAME, COST_PER_COLOR } = constants;

                const expectedValue = PRINT_CLEANER_FRAME * COST_PER_COLOR * FOUR;
                const sanityCheck = quote.totalStockFeet < FEET_PER_ROLL;

                expect(sanityCheck).toEqual(true);
                expect(quote.printCleanerClickCost).not.toBeFalsy();
                expect(quote.printCleanerClickCost).toBeCloseTo(expectedValue, 1);
            });

            it('should be computed correctly (when totalStockFeet >= 5000)', async () => {
                const numberThatShouldForceTotalStockFeetToBeGreaterThan5000 = 900000;

                quoteInputAttributes.labelQty = numberThatShouldForceTotalStockFeetToBeGreaterThan5000;

                const quote = await createQuote(quoteInputAttributes);
                const { PRINT_CLEANER_FRAME, COST_PER_COLOR } = constants;

                const scalar = Math.floor(quote.totalStockFeet / FEET_PER_ROLL);
                const expectedValue = scalar * PRINT_CLEANER_FRAME * COST_PER_COLOR * FOUR;
                const sanityCheck = quote.totalStockFeet > FEET_PER_ROLL;

                expect(sanityCheck).toEqual(true);
                expect(quote.printCleanerClickCost).not.toBeFalsy();
                expect(quote.printCleanerClickCost.toFixed(2)).toEqual(expectedValue.toFixed(2));
            });
        });

        describe('attribute: proofPrintingTime', () => {
            it('should compute the attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);

                const expectedValue = quoteInputAttributes.products.length * constants.PRINTING_PROOF_TIME;

                expect(quote.proofPrintingTime).not.toBeFalsy();
                expect(quote.proofPrintingTime).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: rollChangeOverTime', () => {
            it('should equal zero when there is ONLY 1 roll', async () => {
                const superTinyNumberToEnsureOnly1RollIsRequired = 1;
                quoteInputAttributes = {
                    ...quoteInputAttributes,
                    labelQty: superTinyNumberToEnsureOnly1RollIsRequired
                };
                const quote = await createQuote(quoteInputAttributes);

                expect(quote.rollChangeOverTime).toEqual(0);
            });

            it('should equal zero when there is MORE THAN 1 roll', async () => {
                const bigNumberToEnsureManyRollsAreRequired = 50000;
                quoteInputAttributes = {
                    ...quoteInputAttributes,
                    labelQty: bigNumberToEnsureManyRollsAreRequired
                };
                const quote = await createQuote(quoteInputAttributes);
                const { totalRollsOfPaper } = quote;

                const expectedValue = totalRollsOfPaper * constants.PRINTING_ROLL_CHANGE_OVER_TIME;

                expect(quote.rollChangeOverTime).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: finishedRollLength', () => {
            describe('When quote.labelQty >= quote.labelsPerRoll', () => {
                beforeEach(() => {
                    const labelsPerRoll = baseProduct.labelsPerRoll;
                    const labelQty = chance.pickone([labelsPerRoll, labelsPerRoll + 1]);
                    quoteInputAttributes = {
                        ...quoteInputAttributes,
                        labelQty
                    };
                });

                it('should compute the attribute correctly when dieOverride.sizeAcross and dieOverride.spaceAround ARE defined', async () => {
                    const dieOverride = generateDie();
                    quoteInputAttributes = {
                        ...quoteInputAttributes,
                        dieOverride
                    };
                    const quote = await createQuote(quoteInputAttributes);

                    const expectedValue = ((dieOverride.sizeAcross + dieOverride.spaceAround) * baseProduct.labelsPerRoll) / INCHES_PER_FOOT;

                    expect(quote.finishedRollLength).not.toBeFalsy();
                    expect(quote.finishedRollLength).toBeCloseTo(expectedValue, 3);
                });

                it('should compute the attribute correctly when dieOverride.sizeAcross and dieOverride.spaceAround ARE NOT defined', async () => {
                    delete quoteInputAttributes.dieOverride;
                    const quote = await createQuote(quoteInputAttributes);

                    const expectedValue = ((die.sizeAcross + die.spaceAround) * baseProduct.labelsPerRoll) / INCHES_PER_FOOT;

                    expect(quote.finishedRollLength).not.toBeFalsy();
                    expect(quote.finishedRollLength).toBeCloseTo(expectedValue, 3);
                });
            });

            describe('When quote.labelQty < quote.labelsPerRoll', () => {
                beforeEach(() => {
                    const labelQty = baseProduct.labelsPerRoll - 1;
                    quoteInputAttributes = {
                        ...quoteInputAttributes,
                        labelQty
                    };
                });

                it('should compute the attribute correctly when sizeAcrossOverride and spaceAroundOverride ARE defined', async () => {
                    const dieOverride = generateDie();
                    quoteInputAttributes = {
                        ...quoteInputAttributes,
                        dieOverride
                    };
                    const quote = await createQuote(quoteInputAttributes);
                    const { labelQty } = quote;

                    const expectedValue = ((dieOverride.sizeAcross + dieOverride.spaceAround) * labelQty) / INCHES_PER_FOOT;

                    expect(quote.finishedRollLength).not.toBeFalsy();
                    expect(quote.finishedRollLength).toBeCloseTo(expectedValue, 3);
                });

                it('should compute the attribute correctly when sizeAcrossOverride and spaceAroundOverride ARE NOT defined', async () => {
                    delete quoteInputAttributes.dieOverride;
                    const quote = await createQuote(quoteInputAttributes);
                    const { labelQty } = quote;

                    const expectedValue = ((die.sizeAcross + die.spaceAround) * labelQty) / INCHES_PER_FOOT;

                    expect(quote.finishedRollLength).not.toBeFalsy();
                    expect(quote.finishedRollLength).toBeCloseTo(expectedValue, 3);
                });
            });
        });

        describe('attribute: printingStockTime', () => {
            it('should compute the attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { totalStockFeet, printingSpeed } = quote;

                const expectedValue = totalStockFeet / printingSpeed;

                expect(quote.printingStockTime).not.toBeFalsy();
                expect(quote.printingStockTime).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: stockSpliceTime', () => {
            it('should set attribute to a constant value', async () => {
                const expectedValue = constants.NEW_MATERIAL_STOCK_SPLICE;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.stockSpliceTime).not.toBeFalsy();
                expect(quote.stockSpliceTime).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: totalTimeAtPrinting', () => {
            it('should compute the attribute correctly', async () => {
                quoteInputAttributes = {
                    ...quoteInputAttributes,
                    isSheeted: true
                };
                const quote = await createQuote(quoteInputAttributes);
                const {
                    stockSpliceTime, colorCalibrationTime, proofPrintingTime, reinsertionPrintingTime,
                    printTearDownTime, rollChangeOverTime, printingStockTime, reinsertionSetupTime
                } = quote;

                const expectedValue = stockSpliceTime + colorCalibrationTime + proofPrintingTime
          + reinsertionSetupTime + rollChangeOverTime + printingStockTime
          + reinsertionPrintingTime + printTearDownTime;

                expect(quote.totalTimeAtPrinting).not.toBeFalsy();
                expect(quote.totalTimeAtPrinting).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: totalPrintingCost', () => {
            it('should compute the attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { totalTimeAtPrinting } = quote;

                const expectedValue = (totalTimeAtPrinting / MINUTES_PER_HOUR) * constants.PRINTING_HOURLY_RATE;

                expect(quote.totalPrintingCost).not.toBeFalsy();
                expect(quote.totalPrintingCost).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: totalTimeAtCutting', () => {
            it('should be computed correctly', async () => {
                quoteInputAttributes = {
                    ...quoteInputAttributes,
                    isSheeted: true
                };
                const quote = await createQuote(quoteInputAttributes);
                const {
                    cuttingStockSpliceTime, dieSetupTime, sheetedSetupTime,
                    cuttingStockTime, cuttingTearDownTime, sheetedTearDownTime
                } = quote;

                const expectedValue = cuttingStockSpliceTime + dieSetupTime + sheetedSetupTime + cuttingStockTime + cuttingTearDownTime + sheetedTearDownTime;

                expect(quote.totalTimeAtCutting).not.toBeFalsy();
                expect(quote.totalTimeAtCutting).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: totalCuttingCost', () => {
            it('should compute the attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { totalTimeAtCutting } = quote;

                const expectedValue = (totalTimeAtCutting / MINUTES_PER_HOUR) * constants.CUTTING_HOURLY_RATE;

                expect(quote.totalCuttingCost).not.toBeFalsy();
                expect(quote.totalCuttingCost).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: throwAwayCuttingTimePercentage', () => {
            it('should compute the attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { cuttingStockTime, totalTimeAtCutting } = quote;

                const expectedValue = 1 - (cuttingStockTime / totalTimeAtCutting);

                expect(quote.throwAwayCuttingTimePercentage).not.toBeFalsy();
                expect(quote.throwAwayCuttingTimePercentage).toBeCloseTo(expectedValue, 3);
            });
        });

        describe('attribute: changeOverTime', () => {
            it('should compute the attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);

                const expectedValue = quote.totalFinishedRolls * constants.REWINDING_CHANGE_OVER_MINUTES;

                expect(quote.changeOverTime).not.toBeFalsy();
                expect(quote.changeOverTime).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: totalWindingRollTime', () => {
            it('should compute the attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { totalFinishedRolls, finishedRollLength } = quote;

                const expectedValue = totalFinishedRolls * (finishedRollLength / constants.REWIND_SPEED);

                expect(quote.totalWindingRollTime).not.toBeFalsy();
                expect(quote.totalWindingRollTime).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: totalWindingTime', () => {
            it('should compute the attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { coreGatheringTime, changeOverTime, totalWindingRollTime, labelDropoffAtShippingTime } = quote;

                const expectedValue = coreGatheringTime + changeOverTime + totalWindingRollTime + labelDropoffAtShippingTime;

                expect(quote.totalWindingTime).not.toBeFalsy();
                expect(quote.totalWindingTime).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: throwAwayWindingTimePercentage', () => {
            it('should compute the attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { totalWindingRollTime, totalWindingTime } = quote;

                const expectedValue = 1 - (totalWindingRollTime / totalWindingTime);

                expect(quote.throwAwayWindingTimePercentage).not.toBeFalsy();
                expect(quote.throwAwayWindingTimePercentage).toBeCloseTo(expectedValue, 2);
            });
        });

        describe('attribute: totalWindingCost', () => {
            it('should compute the attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { totalWindingTime } = quote;

                const expectedValue = (totalWindingTime / MINUTES_PER_HOUR) * constants.WINDING_HOURLY_RATE;

                expect(quote.totalWindingCost).not.toBeFalsy();
                expect(quote.totalWindingCost).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: totalCostOfMachineTime', () => {
            it('should compute the attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { totalPrintingCost, totalCuttingCost, totalWindingCost } = quote;

                const expectedValue = totalPrintingCost + totalCuttingCost + totalWindingCost;

                expect(quote.totalCostOfMachineTime).not.toBeFalsy();
                expect(quote.totalCostOfMachineTime).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: boxCreationTime', () => {
            it('should compute the attribute correctly', async () => {
                const hugeNumberOfLabelsHopefullyRequiringManyBoxes = 100000000000;
                quoteInputAttributes.labelQty = hugeNumberOfLabelsHopefullyRequiringManyBoxes;
                const quote = await createQuote(quoteInputAttributes);
                const { packagingDetails } = quote;
                const expectedValue = packagingDetails.totalBoxes * constants.BOX_CREATION_TIME;

                expect(quote.boxCreationTime).not.toBeFalsy();
                expect(quote.boxCreationTime).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: packagingBoxTime', () => {
            it('should compute the attribute correctly', async () => {
                const hugeNumberOfLabelsHopefullyRequiringManyBoxes = 100000000000;
                quoteInputAttributes.labelQty = hugeNumberOfLabelsHopefullyRequiringManyBoxes;
                const quote = await createQuote(quoteInputAttributes);
                const { packagingDetails } = quote;
                const expectedValue = packagingDetails.totalBoxes * constants.PACKAGING_PER_BOX_TIME;

                expect(quote.packagingBoxTime).not.toBeFalsy();
                expect(quote.packagingBoxTime).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: frameUtilization', () => {
            it('should compute the attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { frameLength } = quote;

                const expectedValue = frameLength / constants.MAX_FRAME_AROUND;

                expect(quote.frameUtilization).not.toBeFalsy();
                expect(quote.frameUtilization).toBeCloseTo(expectedValue, 2);
            });
        });

        describe('attribute: totalFinishCost', () => {
            it('should compute the attribute correctly when finishOverride IS DEFINED', async () => {
                const finishOverride = generateFinish();
                quoteInputAttributes = {
                    ...quoteInputAttributes,
                    finishOverride
                };
                const quote = await createQuote(quoteInputAttributes);
                const { totalFinishMsi } = quote;

                const expectedValue = finishOverride.costPerMsi * totalFinishMsi;

                expect(quote.totalFinishCost).not.toBeFalsy();
                expect(quote.totalFinishCost).toBeCloseTo(expectedValue, 1);
            });

            it('should compute the attribute correctly when finishOverride IS UNDEFINED but products[x].finish IS DEFINED', async () => {
                delete quoteInputAttributes.finishOverride;
                const quote = await createQuote(quoteInputAttributes);
                const { totalFinishMsi } = quote;

                const expectedValue = totalFinishMsi * finish.costPerMsi;

                expect(quote.totalFinishCost).not.toBeFalsy();
                expect(quote.totalFinishCost).toBeCloseTo(expectedValue, 1);
            });

            it('should compute the attribute correctly when finishOverride IS UNDEFINED AND products[x].finish IS UNDEFINED', async () => {
                delete quoteInputAttributes.finishOverride;
                when(FinishModel.findById)
                    .calledWith(finish._id)
                    .mockResolvedValue(null);
                const expectedValue = 0;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.totalFinishCost).toEqual(expectedValue);
            });
        });

        describe('attribute: colorCalibrationTime', () => {
            it('should set attribute to a constant value', async () => {
                const expectedValue = constants.COLOR_CALIBRATION_TIME;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.colorCalibrationTime).not.toBeFalsy();
                expect(quote.colorCalibrationTime).toEqual(expectedValue);
            });
        });

        describe('attribute: reinsertionPrintingTime', () => {
            it('should set attribute to a constant value', async () => {
                const expectedValue = 0;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.reinsertionPrintingTime).toBeDefined();
                expect(quote.reinsertionPrintingTime).toEqual(expectedValue);
            });
        });

        describe('attribute: printTearDownTime', () => {
            it('should set attribute to a constant value', async () => {
                const expectedValue = constants.PRINTING_TEAR_DOWN_TIME;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.printTearDownTime).not.toBeFalsy();
                expect(quote.printTearDownTime).toEqual(expectedValue);
            });
        });

        describe('attribute: cuttingStockSpliceTime', () => {
            it('should compute attribute correctly', async () => {
                const bigInteger = 9950000;
                const numberThatShouldForceTotalStockFeetToBeGreaterThan5000 = bigInteger;
                quoteInputAttributes.labelQty = numberThatShouldForceTotalStockFeetToBeGreaterThan5000;
                const quote = await createQuote(quoteInputAttributes);
                const { totalRollsOfPaper } = quote;
                const expectedValue = (totalRollsOfPaper + 1) * constants.CUTTING_STOCK_SPLICE_TIME;

                expect(quote.cuttingStockSpliceTime).not.toBeFalsy();
                expect(quote.cuttingStockSpliceTime).toBeCloseTo(expectedValue, 2);
            });
        });

        describe('attribute: dieSetupTime', () => {
            it('should set attribute to a constant value', async () => {
                const expectedValue = constants.DIE_SETUP;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.dieSetupTime).not.toBeFalsy();
                expect(quote.dieSetupTime).toEqual(expectedValue);
            });
        });

        describe('attribute: sheetedSetupTime', () => {
            it('should set attribute to a constant value if "isSheeted" is TRUE', async () => {
                quoteInputAttributes.isSheeted = true;
                const expectedValue = constants.SHEETED_SETUP_TIME;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.sheetedSetupTime).not.toBeFalsy();
                expect(quote.sheetedSetupTime).toEqual(expectedValue);
            });

            it('should set attribute to ZERO if "isSheeted" is FALSE', async () => {
                quoteInputAttributes.isSheeted = false;
                const expectedValue = 0;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.sheetedSetupTime).toBeDefined();
                expect(quote.sheetedSetupTime).toEqual(expectedValue);
            });
        });

        describe('attribute: cuttingTearDownTime', () => {
            it('should set attribute to a constant value', async () => {
                const expectedValue = constants.CUTTING_TEAR_DOWN_TIME;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.cuttingTearDownTime).not.toBeFalsy();
                expect(quote.cuttingTearDownTime).toEqual(expectedValue);
            });
        });

        describe('attribute: sheetedTearDownTime', () => {
            it('should set attribute to a constant value if "isSheeted" is TRUE', async () => {
                quoteInputAttributes.isSheeted = true;
                const expectedValue = constants.SHEETED_TEAR_DOWN_TIME;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.sheetedTearDownTime).not.toBeFalsy();
                expect(quote.sheetedTearDownTime).toEqual(expectedValue);
            });

            it('should set attribute to ZERO if "isSheeted" is FALSY', async () => {
                delete quoteInputAttributes.isSheeted;
                const expectedValue = 0;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.sheetedTearDownTime).toBeDefined();
                expect(quote.sheetedTearDownTime).toEqual(expectedValue);
            });
        });

        describe('attribute: coreGatheringTime', () => {
            it('should set attribute to a constant value', async () => {
                const expectedValue = constants.CORE_GATHERING_TIME;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.coreGatheringTime).not.toBeFalsy();
                expect(quote.coreGatheringTime).toEqual(expectedValue);
            });
        });

        describe('attribute: labelDropoffAtShippingTime', () => {
            it('should set attribute to a constant value', async () => {
                const expectedValue = constants.LABEL_DROP_OFF_TIME;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.labelDropoffAtShippingTime).not.toBeFalsy();
                expect(quote.labelDropoffAtShippingTime).toEqual(expectedValue);
            });
        });

        describe('attribute: packingSlipsTime', () => {
            it('should set attribute to a constant value', async () => {
                const expectedValue = constants.PACKING_SLIP_TIME;

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.packingSlipsTime).not.toBeFalsy();
                expect(quote.packingSlipsTime).toEqual(expectedValue);
            });
        });

        describe('attribute: dieCutterSetupFeet', () => {
            it('should calculate the value correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { extraFrames, frameLength } = quote;
                const numberOfDesigns = quote.products.length;
                const expectedValue = ((extraFrames * frameLength) / INCHES_PER_FOOT) * numberOfDesigns;

                expect(quote.dieCutterSetupFeet).not.toBeFalsy();
                expect(quote.dieCutterSetupFeet).toBeCloseTo(expectedValue, 3);
            });

            it('should calculate the value correctly when numberOfDesignsOverride is defined and greater than 1', async () => {
                const numberOfDesignsOverride = chance.d12();
                quoteInputAttributes.numberOfDesignsOverride = numberOfDesignsOverride;
                const quote = await createQuote(quoteInputAttributes);
                const { extraFrames, frameLength } = quote;
                const expectedValue = ((extraFrames * frameLength) / INCHES_PER_FOOT) * numberOfDesignsOverride;

                expect(quote.dieCutterSetupFeet).not.toBeFalsy();
                expect(quote.dieCutterSetupFeet).toBeCloseTo(expectedValue, 3);
            });
        });

        describe('attribute: extraFrames', () => {
            const { EXTRA_FRAMES_PER_ADDITIONAL_DESIGN, EXTRA_FRAMES_FOR_THE_FIRST_DESIGN } = constants;

            it('should calculate the attribute correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const numberOfDesigns = quote.products.length;
                const expectedValue = EXTRA_FRAMES_FOR_THE_FIRST_DESIGN + ((numberOfDesigns - 1) * EXTRA_FRAMES_PER_ADDITIONAL_DESIGN);

                expect(quote.extraFrames).not.toBeFalsy();
                expect(quote.extraFrames).toEqual(expectedValue);
            });

            it('should calculate the value correctly when numberOfDesignsOverride is defined and equal to 1', async () => {
                const numberOfDesignsOverride = 1;
                quoteInputAttributes.numberOfDesignsOverride = numberOfDesignsOverride;

                const quote = await createQuote(quoteInputAttributes);
                const expectedValue = EXTRA_FRAMES_FOR_THE_FIRST_DESIGN;

                expect(quote.extraFrames).not.toBeFalsy();
                expect(quote.extraFrames).toEqual(expectedValue);
            });

            it('should calculate the value correctly when numberOfDesignsOverride is defined and greater than 1', async () => {
                const numberOfDesignsOverride = 1 + chance.d12();
                quoteInputAttributes.numberOfDesignsOverride = numberOfDesignsOverride;

                const quote = await createQuote(quoteInputAttributes);
                const expectedValue = EXTRA_FRAMES_FOR_THE_FIRST_DESIGN + ((numberOfDesignsOverride - 1) * EXTRA_FRAMES_PER_ADDITIONAL_DESIGN);

                expect(quote.extraFrames).not.toBeFalsy();
                expect(quote.extraFrames).toEqual(expectedValue);
            });
        });

        describe('attribute: totalFrames', () => {
            it('should be calculated correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { totalStockFeet, frameLength } = quote;

                const expectedValue = Math.ceil((totalStockFeet / frameLength) * INCHES_PER_FOOT);

                expect(quote.totalFrames).not.toBeFalsy();
                expect(quote.totalFrames).toEqual(expectedValue);
            });
        });

        describe('attribute: totalStockCost', () => {
            it('should be calculated using products[x].primaryMaterial and products[x].secondaryMaterial when not overridden by user', async () => {
                delete quoteInputAttributes.primaryMaterialOverride;
                delete quoteInputAttributes.secondaryMaterialOverride;
                const quote = await createQuote(quoteInputAttributes);
                const { totalStockMsi } = quote;

                const expectedValue = (totalStockMsi * primaryMaterial.quotePricePerMsi) + (totalStockMsi * secondaryMaterial.quotePricePerMsi);

                expect(quote.totalStockCost).not.toBeFalsy();
                expect(quote.totalStockCost).toBeCloseTo(expectedValue, 1);
            });

            it('should be overridable by the user', async () => {
                const primaryMaterialOverride = generateMaterial();
                const secondaryMaterialOverride = generateMaterial();
                quoteInputAttributes = {
                    ...quoteInputAttributes,
                    primaryMaterialOverride,
                    secondaryMaterialOverride
                };
                const quote = await createQuote(quoteInputAttributes);
                const { totalStockMsi } = quote;

                const expectedValue = (totalStockMsi * primaryMaterialOverride.quotePricePerMsi) + (totalStockMsi * secondaryMaterialOverride.quotePricePerMsi);

                expect(quote.totalStockCost).not.toBeFalsy();
                expect(quote.totalStockCost).toBeCloseTo(expectedValue, 1);
            });

            it('should be computed correctly when secondaryMaterial is undefined', async () => {
                delete quoteInputAttributes.secondaryMaterialOverride;
                when(MaterialModel.findById)
                    .calledWith(secondaryMaterial._id)
                    .mockResolvedValue(null);
                const quote = await createQuote(quoteInputAttributes);
                const { totalStockMsi } = quote;

                const expectedValue = totalStockMsi * primaryMaterial.quotePricePerMsi;

                expect(quote.totalStockCost).not.toBeFalsy();
                expect(quote.totalStockCost).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: cuttingStockTime', () => {
            it('should be calculated correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { totalStockFeet } = quote;

                const expectedValue = totalStockFeet / constants.DIE_CUTTING_SPEED;

                expect(quote.cuttingStockTime).not.toBeFalsy();
                expect(quote.cuttingStockTime).toBeCloseTo(expectedValue, 1);
            });
        });

        /* * Job Variables * */
        describe('attribute: printingSpeed', () => {
            it('should be calculated correctly when dieOverride is defined', async () => {
                const dieOverride = generateDie();
                const numberOfColorsOverride = chance.d12();
                quoteInputAttributes = {
                    ...quoteInputAttributes,
                    dieOverride,
                    numberOfColorsOverride
                };
                const quote = await createQuote(quoteInputAttributes);

                const expectedValue = getExpectedPrintingSpeed(numberOfColorsOverride, dieOverride);

                expect(quote.printingSpeed).not.toBeFalsy();
                expect(quote.printingSpeed).toBeCloseTo(expectedValue, 3);
            });

            it('should be calculated correctly when dieOverride.sizeAround and dieOverride.spaceAround are NOT defined', async () => {
                delete quoteInputAttributes.dieOverride;
                delete quoteInputAttributes.numberOfColorsOverride;
                const quote = await createQuote(quoteInputAttributes);

                const expectedValue = getExpectedPrintingSpeed(baseProduct.numberOfColors, die);

                expect(quote.printingSpeed).not.toBeFalsy();
                expect(quote.printingSpeed).toBeCloseTo(expectedValue, 3);
            });
        });

        describe('attribute: totalFinishedRolls', () => {
            it('should be calculated correctly when: labelQty / labelsPerRoll > 1', async () => {
                const bigNumber = 10000;
                const smallNumberOfLabelsPerRoll = chance.d10();
                quoteInputAttributes.labelQty = bigNumber;
                quoteInputAttributes.labelsPerRollOverride = smallNumberOfLabelsPerRoll;
                const quote = await createQuote(quoteInputAttributes);
                const { labelQty } = quote;

                const expectedValue = Math.ceil(labelQty / smallNumberOfLabelsPerRoll);

                expect(quote.totalFinishedRolls).not.toBeFalsy();
                expect(quote.totalFinishedRolls).toEqual(expectedValue);
            });

            it('should be calculated correctly when: labelQty / labelsPerRoll > 0 && labelQty / labelsPerRoll <= 1', async () => {
                const bigNumber = 1000000000;
                const smallNumber = chance.d10();
                quoteInputAttributes.labelQty = smallNumber;
                quoteInputAttributes.labelsPerRollOverride = bigNumber;

                const quote = await createQuote(quoteInputAttributes);

                const expectedValue = 1;

                expect(quote.totalFinishedRolls).not.toBeFalsy();
                expect(quote.totalFinishedRolls).toEqual(expectedValue);
            });
        });

        describe('attribute: frameLength', () => {
            it('should compute using sizeAroundOverride and spaceAroundOverride when defined', async () => {
                const dieOverride = generateDie();
                quoteInputAttributes = {
                    ...quoteInputAttributes,
                    dieOverride
                };
                const expectedValue = computeFrameLength(dieOverride);

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.frameLength).not.toBeFalsy();
                expect(quote.frameLength).toEqual(expectedValue);
            });

            it('should compute using die.sizeAround and die.spaceAround when sizeAroundOverride and spaceAroundOverride are undefined', async () => {
                delete quoteInputAttributes.dieOverride;
                const expectedValue = computeFrameLength(die);

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.frameLength).not.toBeFalsy();
                expect(quote.frameLength).toEqual(expectedValue);
            });
        });

        describe('attribute: totalNumberOfRolls', () => {
            it('should be calculated correctly', async () => {
                const labelQty = chance.d100();
                quoteInputAttributes = {
                    ...quoteInputAttributes,
                    labelQty
                };
                const expectedValue = Math.ceil(labelQty / baseProduct.labelsPerRoll);

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.totalNumberOfRolls).not.toBeFalsy();
                expect(quote.totalNumberOfRolls).toEqual(expectedValue);
            });

            it('should handle setting totalNumberOfRolls to 0 correctly', async () => {
                const labelQty = 0;
                quoteInputAttributes = {
                    ...quoteInputAttributes,
                    labelQty
                };

                const quote = await createQuote(quoteInputAttributes);

                expect(quote.totalNumberOfRolls).toEqual(0);
            });
        });

        describe('attribute: finishedRollDiameter', () => {
            it('should be calculated correctly', async () => {
                const labelsPerRollOverride = 2000;
                const dieOverride = generateDie();
                const finishOverride = generateFinish();
                const primaryMaterialOverride = generateMaterial();
                const secondaryMaterialOverride = generateMaterial();
                dieOverride.sizeAcross = 0.125;
                dieOverride.spaceAround = 1.5;
                const expectedRollDiameter = 6.204;

                // Sums to 6.750 in combined thickness
                finishOverride.thickness = 0.750;
                primaryMaterialOverride.thickness = 3;
                secondaryMaterialOverride.thickness = 3;

                quoteInputAttributes = {
                    ...quoteInputAttributes,
                    labelQty: 500000,
                    labelsPerRollOverride,
                    dieOverride,
                    finishOverride,
                    primaryMaterialOverride,
                    secondaryMaterialOverride
                };
                const quote = await createQuote(quoteInputAttributes);

                expect(quote.finishedRollDiameter).not.toBeFalsy();
                expect(quote.finishedRollDiameter).toEqual(expectedRollDiameter);
            });
        });

        describe('attribute: finishedRollDiameterWithoutCore', () => {
            it('should be computed correctly using the baseProduct.coreDiameter', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const expectedRollDiameterWithoutCore = quote.finishedRollDiameter - baseProduct.coreDiameter;

                expect(quote.finishedRollDiameterWithoutCore).not.toBeFalsy();
                expect(quote.finishedRollDiameterWithoutCore).toBeCloseTo(expectedRollDiameterWithoutCore, THREE_DECIMAL_PLACES);
            });

            it('should be computed correctly using the coreDiameterOverride', async () => {
                const coreDiameterOverride = 3;
                quoteInputAttributes.coreDiameterOverride = coreDiameterOverride;
                const quote = await createQuote(quoteInputAttributes);

                const expectedRollDiameterWithoutCore = quote.finishedRollDiameter - coreDiameterOverride;

                expect(quote.finishedRollDiameterWithoutCore).not.toBeFalsy();
                expect(quote.finishedRollDiameterWithoutCore).toBeCloseTo(expectedRollDiameterWithoutCore, THREE_DECIMAL_PLACES);
            });
        });

        describe('attribute: packagingDetails', () => {
            it('should be defined', async () => {
                const quote = await createQuote(quoteInputAttributes);

                expect(quote.packagingDetails).toBeDefined();
            });
        });

        describe('attribute: totalBoxCost', () => {
            it('should be calculated correctly', async () => {
                const hugeLabelQtyToEnsureManyBoxes = 100000000;
                quoteInputAttributes.labelQty = hugeLabelQtyToEnsureManyBoxes;
                const quote = await createQuote(quoteInputAttributes);
                const { packagingDetails } = quote;
                const expectedBoxCost = packagingDetails.totalBoxes * constants.BOX_COST;

                expect(quote.totalBoxCost).not.toBeFalsy();
                expect(quote.totalBoxCost).toBeCloseTo(expectedBoxCost, 1);
            });
        });

        describe('attribute: totalMaterialsCost', () => {
            it('should be calculated correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const { totalStockCost, totalFinishCost, inlinePrimingCost, totalClicksCost, totalBoxCost, totalCoreCost } = quote;

                const expectedValue = totalStockCost + totalFinishCost + inlinePrimingCost + totalClicksCost + totalCoreCost + totalBoxCost;

                expect(quote.totalMaterialsCost).not.toBeFalsy();
                expect(quote.totalMaterialsCost).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: totalShippingTime', () => {
            it('should be calculated correctly', async () => {
                const hugeLabelQtyToEnsureMoreThanOneRoll = 100000000;
                quoteInputAttributes.labelQty = hugeLabelQtyToEnsureMoreThanOneRoll;
                const quote = await createQuote(quoteInputAttributes);
                const { boxCreationTime, packagingBoxTime, packingSlipsTime } = quote;

                const expectedValue = boxCreationTime + packagingBoxTime + packingSlipsTime;

                expect(quote.totalShippingTime).not.toBeFalsy();
                expect(quote.totalShippingTime).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: totalShippingCost', () => {
            it('should be calculated correctly', async () => {
                const hugeLabelQtyToEnsureManyBoxesToShip = 100000000;
                quoteInputAttributes.labelQty = hugeLabelQtyToEnsureManyBoxesToShip;
                const quote = await createQuote(quoteInputAttributes);
                const { totalShippingTime } = quote;

                const expectedValue = (totalShippingTime / MINUTES_PER_HOUR) * constants.SHIPPING_HOURLY_RATE;

                expect(quote.totalShippingCost).not.toBeFalsy();
                expect(quote.totalShippingCost).toBeCloseTo(expectedValue, 1);
            });
        });

        describe('attribute: totalClicksCost', () => {
            it('should be calculated correctly', async () => {
                const quote = await createQuote(quoteInputAttributes);
                const {
                    scalingClickCost, proofRunupClickCost,
                    printCleanerClickCost, totalFrames
                } = quote;
                const { COST_PER_COLOR } = constants;
                const expectedClicksCost = scalingClickCost + proofRunupClickCost + printCleanerClickCost + (COST_PER_COLOR * (totalFrames * baseProduct.numberOfColors * 2));

                expect(quote.totalClicksCost).not.toBeFalsy();
                expect(quote.totalClicksCost).toBeCloseTo(expectedClicksCost, 1);
            });
        });

        describe('attribute: reinsertionSetupTime', () => {
            it('should be calculated correctly', async () => {
                const hugeLabelQtyToEnsureMoreThanOneRoll = 100000000;
                quoteInputAttributes.labelQty = hugeLabelQtyToEnsureMoreThanOneRoll;
                const quote = await createQuote(quoteInputAttributes);

                const expectedReinsertionSetupTime = quote.totalRollsOfPaper * constants.REINSERTION_SETUP_TIME_PER_ROLL;

                expect(quote.reinsertionSetupTime).not.toBeFalsy();
                expect(quote.reinsertionSetupTime).toEqual(expectedReinsertionSetupTime);
            });
        });
    });

    describe('attribute: combinedMaterialThickness', () => {
        it('should be calculated correctly', async () => {
            const quote = await createQuote(quoteInputAttributes);
            const expectedCombinedMaterialThickness = primaryMaterial.thickness + secondaryMaterial.thickness + finish.thickness;

            expect(quote.combinedMaterialThickness).not.toBeFalsy();
            expect(quote.combinedMaterialThickness).toEqual(expectedCombinedMaterialThickness);
        });
    });

    describe('attribute: cuttingDiameter', () => {
        it('should be calculated correctly', async () => {
            const quote = await createQuote(quoteInputAttributes);
            const { totalStockFeet, combinedMaterialThickness } = quote;
            const materialLengthInInches = totalStockFeet * INCHES_PER_FOOT;
            const term1 = ((materialLengthInInches) * (combinedMaterialThickness / ONE_THOUSAND)) / 3.142; // eslint-disable-line no-magic-numbers
            const term2 = Math.pow((baseProduct.coreDiameter / 2), 2);

            const expectedCuttingDiameter = Math.sqrt(term1 + term2) * 2;

            expect(quote.cuttingDiameter).not.toBeFalsy();
            expect(quote.cuttingDiameter).toBeCloseTo(expectedCuttingDiameter, 3);
        });
    });

    describe('attribute: totalCores', () => {
        it('should be calculated correctly', async () => {
            const quote = await createQuote(quoteInputAttributes);
            const { totalFinishedRolls, cuttingDiameter } = quote;
            const scalar = Math.ceil(cuttingDiameter / 21); // eslint-disable-line no-magic-numbers
            const expectedValue = totalFinishedRolls + (scalar * die.numberAcross);

            expect(quote.totalCores).not.toBeFalsy();
            expect(quote.totalCores).toEqual(expectedValue);
        });
    });

    describe('acceptance tests', () => {
        it('should return quote with the overriden values', async () => {
            quoteInputAttributes = {
                quoteNumber: STARTING_QUOTE_NUMBER,
                profitMargin: 0.30,
                labelsPerRollOverride: 2000,
                numberOfDesignsOverride: 2,
                labelQty: 10000,
                coreDiameterOverride: 3,
                dieOverride: {
                    sizeAcross: 1,
                    sizeAround: 2,
                    spaceAround: 1,
                    numberAcross: 2
                },
                primaryMaterialOverride: {
                    quotePricePerMsi: 3,
                    thickness: 2,
                    costPerMsi: 3
                },
                secondaryMaterialOverride: {
                    quotePricePerMsi: 3,
                    thickness: 2,
                    costPerMsi: 3
                },
                finishOverride: {
                    quotePricePerMsi: 4,
                    thickness: 5,
                    costPerMsi: 1
                },
                numberOfColorsOverride: 4,
            };
            const quote = await createQuote(quoteInputAttributes);

            expect(quote.labelsPerRollOverride).toEqual(quoteInputAttributes.labelsPerRollOverride);
            expect(quote.numberOfDesignsOverride).toEqual(quoteInputAttributes.numberOfDesignsOverride);
            expect(quote.labelQty).toEqual(quoteInputAttributes.labelQty);
            expect(quote.coreDiameterOverride).toEqual(quoteInputAttributes.coreDiameterOverride);
            expect(quote.dieOverride).toEqual(expect.objectContaining(quoteInputAttributes.dieOverride));
            expect(quote.primaryMaterialOverride).toEqual(expect.objectContaining(quoteInputAttributes.primaryMaterialOverride));
            expect(quote.secondaryMaterialOverride).toEqual(expect.objectContaining(quoteInputAttributes.secondaryMaterialOverride));
            expect(quote.finishOverride).toEqual(expect.objectContaining(quoteInputAttributes.finishOverride));
            expect(quote.numberOfColorsOverride).toEqual(quoteInputAttributes.numberOfColorsOverride);
        });

        it('should create a quote with correctly calculated attributes', async () => {
            const unwindDirection = chance.pickone(unwindDirections);

            quoteInputAttributes = {
                quoteNumber: STARTING_QUOTE_NUMBER,
                profitMargin: 0.30,
                labelsPerRollOverride: 2000,
                numberOfDesignsOverride: 2,
                labelQty: 10000,
                coreDiameterOverride: 3.25,
                dieOverride: {
                    sizeAcross: 1.5,
                    sizeAround: 1.5,
                    spaceAround: 0.125,
                    numberAcross: 7
                },
                primaryMaterialOverride: {
                    quotePricePerMsi: 0.930,
                    thickness: 5.500,
                    costPerMsi: 0.2810
                },
                finishOverride: {
                    quotePricePerMsi: 0.2000,
                    thickness: 1.250,
                    costPerMsi: 0.51
                },
                numberOfColorsOverride: 4,
                unwindDirection: unwindDirection
            };

            const quote = await createQuote(quoteInputAttributes);
            const error = quote.validateSync();

            expect(error).toBeUndefined();
            expect(quote).toBeDefined();
            expect(quote).toEqual(expect.objectContaining({
                initialStockLength: 193.4524,
                colorCalibrationFeet: 42,
                proofRunupFeet: 23,
                printCleanerFeet: 40,
                dieCutterSetupFeet: 280.3125,
                scalingFeet: 30,
                newMaterialSetupFeet: 78,
                dieLineSetupFeet: 6.2292,
                totalStockFeet: 692.9940,
                throwAwayStockPercentage: 0.7208,
                totalStockMsi: 106.0281,
                totalRollsOfPaper: 0,
                extraFrames: 45,
                totalFrames: 446,
                totalStockCost: 98.61,
                cuttingDiameter: 9.0567,
                finishedRollDiameter: 6.204,
                combinedMaterialThickness: 6.750,
                totalCores: 12,
                totalFinishFeet: 519.9940,
                totalFinishMsi: 79.5591,
                totalFinishCost: 40.58,
                totalCoreCost: 1.20,
                totalBoxCost: 5.00,
                inlinePrimingCost: 2.12,
                frameLength: 37.375,
                scalingClickCost: 5.47,
                proofRunupClickCost: 0.15,
                printCleanerClickCost: 0.76,
                totalClicksCost: 40.28,
                totalMaterialsCost: 187.78,
                stockSpliceTime: 5,
                colorCalibrationTime: 7,
                proofPrintingTime: 6,
                reinsertionPrintingTime: 0,
                rollChangeOverTime: 0,
                printingSpeed: 95.3444,
                printingStockTime: convertSecondsToMinutes(convertMinutesToSeconds(7.2683)),
                printTearDownTime: 7,
                totalTimeAtPrinting: convertSecondsToMinutes(convertMinutesToSeconds(32.2683)),
                throwAwayPrintTimePercentage: 0.7748,
                totalPrintingCost: 82.82,
                cuttingStockSpliceTime: 5,
                dieSetupTime: 7,
                sheetedSetupTime: 0,
                cuttingStockTime: convertSecondsToMinutes(convertMinutesToSeconds(10.6614)),
                cuttingTearDownTime: 7,
                sheetedTearDownTime: 0,
                totalTimeAtCutting: convertSecondsToMinutes(convertMinutesToSeconds(29.6614)),
                totalCuttingCost: 49.93,
                throwAwayCuttingTimePercentage: 0.6406,
                coreGatheringTime: 3,
                changeOverTime: 2.5,
                totalWindingRollTime: convertSecondsToMinutes(convertMinutesToSeconds(6.7708)),
                labelDropoffAtShippingTime: 3,
                totalWindingTime: convertSecondsToMinutes(convertMinutesToSeconds(15.2708)),
                totalCostOfMachineTime: 156.93,
                throwAwayWindingTimePercentage: 0.5566,
                totalFinishedRolls: 5,
                totalWindingCost: 24.18,
                boxCreationTime: 0.5,
                packagingBoxTime: 3,
                packingSlipsTime: 7,
                totalShippingTime: 10.5,
                totalShippingCost: 3.50,
                reinsertionSetupTime: 0,
                frameUtilization: 0.9688,
                finishedRollLength: 270.8333,
                finishedRollDiameterWithoutCore: 2.954,
                totalMachineCost: 156.93,
                totalProductionCost: 348.21,
                quotedPrice: 452.68,
                pricePerThousand: 45.27,
                profit: 104.46,
                pricePerLabel: 0.04527,
                unwindDirection: unwindDirection
            }));
            expect(quote.packagingDetails).toEqual(expect.objectContaining({
                totalBoxes: 1
            }));
        });

        describe('verfy quote, finish, primaryMaterial, and secondaryMaterial can be fetched successfully from the database', () => {
            let baseProductAttributes;

            beforeAll(async () => {
                await databaseService.connectToTestMongoDatabase();
            });

            afterEach(async () => {
                await databaseService.clearDatabase();
            });

            afterAll(async () => {
                await databaseService.closeDatabase();
            });

            it('should generate a quote using the objects queried from the database', async () => {
                const dieAttributes = testDataGenerator.mockData.Die();
                const primaryMaterialAttributes = testDataGenerator.mockData.Material();
                const secondaryMaterialAttributes = testDataGenerator.mockData.Material();
                const finishAttributes = testDataGenerator.mockData.Finish();

                baseProductAttributes = {
                    _id: new mongoose.Types.ObjectId(),
                    die: new mongoose.Types.ObjectId(),
                    primaryMaterial: new mongoose.Types.ObjectId(),
                    secondaryMaterial: new mongoose.Types.ObjectId(),
                    finish: new mongoose.Types.ObjectId(),
                    numberOfColors: chance.d10(),
                    labelsPerRoll: chance.d10(),
                    coreDiameter: 3.25,
                };

                when(DieModel.findById)
                    .calledWith(baseProductAttributes.die)
                    .mockResolvedValue(dieAttributes);
                when(FinishModel.findById)
                    .calledWith(baseProductAttributes.finish)
                    .mockResolvedValue(finishAttributes);
                when(BaseProductModel.findById)
                    .calledWith(expect.anything())
                    .mockResolvedValue(baseProductAttributes);
                when(MaterialModel.findById)
                    .calledWith(baseProductAttributes.primaryMaterial)
                    .mockResolvedValue(primaryMaterialAttributes);
                when(MaterialModel.findById)
                    .calledWith(baseProductAttributes.secondaryMaterial)
                    .mockResolvedValue(secondaryMaterialAttributes);
                const products = [
                    {
                        productId: baseProductAttributes._id,
                        labelQty: chance.d100()
                    }
                ];
                quoteInputAttributes = {
                    quoteNumber: STARTING_QUOTE_NUMBER,
                    labelQty: chance.integer({ min: 100, max: 10000 }),
                    profitMargin: 0.30,
                    products,
                    unwindDirection: chance.pickone(unwindDirections),
                };
                const quote = await createQuote(quoteInputAttributes);
                const error = quote.validateSync();

                expect(quote).toBeDefined();
                expect(error).toBeUndefined();
            });
        });
    });
});
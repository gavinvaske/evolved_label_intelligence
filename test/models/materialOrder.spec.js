import Chance from 'chance';
import { MaterialOrderModel } from '../../application/api/models/materialOrder.ts';
import mongoose from 'mongoose';

const chance = Chance();

const TOTAL_ROLLS_MIN = 1;
const TOTAL_ROLLS_MAX = 100;

const TOTAL_COST_MIN = 1;
const TOTAL_COST_MAX = 500000;

describe('materialOrder validation', () => {
    let materialOrderAttributes;

    beforeEach(() => {
        materialOrderAttributes = {
            material: new mongoose.Types.ObjectId(),
            purchaseOrderNumber: `${chance.integer({min: 0})}`,
            orderDate: chance.date({string: true}),
            arrivalDate: chance.date({string: true}),
            feetPerRoll: chance.integer({min: 0}),
            totalRolls: chance.integer({min: TOTAL_ROLLS_MIN, max: TOTAL_ROLLS_MAX}),
            totalCost: chance.floating({min: TOTAL_COST_MIN, max: TOTAL_COST_MAX}),
            vendor: new mongoose.Types.ObjectId(),
            hasArrived: chance.bool(),
            notes: chance.string(),
            author: new mongoose.Types.ObjectId(),
            freightCharge: chance.floating({ min: 0, fixed: 2 }),
            fuelCharge: chance.floating({ min: 0, fixed: 2 })
        };
    });

    it('should validate when all attributes are defined correctly', () => {
        const materialOrder = new MaterialOrderModel(materialOrderAttributes);
    
        const error = materialOrder.validateSync();

        expect(error).toBe(undefined);
    });

    describe('materialOrder.material validation', () => {
        it('should fail validation if material is not defined', () => {
            delete materialOrderAttributes.material;

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });
    });

    describe('materialOrder.purchaseOrderNumber validation', () => {
        it('should fail validation if purchaseOrderNumber is not defined', () => {
            delete materialOrderAttributes.purchaseOrderNumber;

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });

        it('should fail validation if purchaseOrderNumber is not an integer', () => {
            const randomFloatingNumber = chance.floating({fixed: 8});
            materialOrderAttributes.purchaseOrderNumber = randomFloatingNumber;

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });

        it('should fail validation if purchaseOrderNumber contains non-numberic characters', () => {
            materialOrderAttributes.purchaseOrderNumber = `${chance.integer()}${chance.word()}`;

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });
    });

    describe('materialOrder.orderDate validation', () => {
        it('should fail validation if orderDate is not defined', () => {
            delete materialOrderAttributes.orderDate;

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });

        it('should fail validation if orderDate is not a date', () => {
            materialOrderAttributes.orderDate = chance.word();

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });
    });

    describe('materialOrder.arrivalDate validation', () => {
        it('should fail validation if arrivalDate is not defined', () => {
            delete materialOrderAttributes.arrivalDate;

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });

        it('should fail validation if arrivalDate is not a date', () => {
            materialOrderAttributes.arrivalDate = chance.word();

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });
    });

    describe('materialOrder.feetPerRoll validation', () => {
        it('should fail validation if feetPerRoll is not defined', () => {
            delete materialOrderAttributes.feetPerRoll;

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });

        it('should validate if feetPerRoll is a non-negative floating value', () => {
            materialOrderAttributes.feetPerRoll = chance.floating({min: 0, max: 10000});

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).toBe(undefined);
        });
        
        it('should fail validation if feetPerRoll is less than 0', () => {
            materialOrderAttributes.feetPerRoll = chance.floating({min: -10000, max: 0});

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });
    });

    describe('materialOrder.totalRolls validation', () => {
        it('should fail validation if totalRolls is not defined', () => {
            delete materialOrderAttributes.totalRolls;

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });

        it('should fail validation if totalRolls less than 1', () => {
            materialOrderAttributes.totalRolls = chance.integer({max: TOTAL_ROLLS_MIN - 1});

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });

        it('should fail validation if totalRolls greater than 100', () => {
            materialOrderAttributes.totalRolls = chance.integer({min: TOTAL_ROLLS_MAX + 1});

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });

        it('should fail validation if totalRolls is not an integer', () => {
            materialOrderAttributes.totalRolls = chance.floating({min: TOTAL_ROLLS_MIN, max: TOTAL_ROLLS_MAX});

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });
    });
    describe('materialOrder.totalCost validation', () => {
        it('should fail validation if totalCost is not defined', () => {
            delete materialOrderAttributes.totalCost;

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });

        it('should fail validation if totalCost less than 1', () => {
            materialOrderAttributes.totalCost = chance.floating({max: TOTAL_COST_MIN - 1});

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });

        it('should fail validation if totalRolls greater than 500,000', () => {
            materialOrderAttributes.totalCost = chance.floating({min: TOTAL_COST_MAX + 1});

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });

        it('should auto round to nearest penny', () => {
            const unrounderedFreightCharge = 99.999;
            const roundedFreightCharge = 100.00;
            materialOrderAttributes.totalCost = unrounderedFreightCharge;
            const materialOrder = new MaterialOrderModel(materialOrderAttributes);
            
            expect(materialOrder.totalCost).toBe(roundedFreightCharge);
        });
    });

    describe('materialOrder.vendor validation', () => {
        it('should fail validation if vendor is not defined', () => {
            delete materialOrderAttributes.vendor;

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });

        it('should fail validation if vendor not the correct type', () => {
            materialOrderAttributes.vendor = chance.word();

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });
    });

    describe('materialOrder.hasArrived validation', () => {
        it('should NOT fail validation if hasArrived is not defined', () => {
            delete materialOrderAttributes.hasArrived;

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).toBe(undefined);
        });
    });

    describe('materialOrder.notes validation', () => {
        it('should NOT fail validation if notes is not defined', () => {
            delete materialOrderAttributes.notes;

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).toBe(undefined);
        });

        it('should trim leading/trailing spaces', () => {
            const notesWithoutSpaces = materialOrderAttributes.notes;
            materialOrderAttributes.notes = ' ' + notesWithoutSpaces + '  ';

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).toBe(undefined);
            expect(materialOrder.notes).toBe(notesWithoutSpaces);
        });
    });

    describe('attribute: freightCharge', () => {
        it('should be required', () => {
            delete materialOrderAttributes.freightCharge;
            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const { errors } = materialOrder.validateSync();

            expect(errors.freightCharge).toBeDefined();
        });

        it('should be a number', () => {
            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            expect(materialOrder.freightCharge).toEqual(expect.any(Number));
        });

        it('should be a positive number', () => {
            materialOrderAttributes.freightCharge = -1;
            const materialOrder = new MaterialOrderModel(materialOrderAttributes);
            
            const { errors } = materialOrder.validateSync();
            
            expect(errors.freightCharge).toBeDefined();
        });

        it('should auto round to nearest penny', () => {
            const unrounderedFreightCharge = 10.125;
            const roundedFreightCharge = 10.13;
            materialOrderAttributes.freightCharge = unrounderedFreightCharge;
            const materialOrder = new MaterialOrderModel(materialOrderAttributes);
            
            expect(materialOrder.freightCharge).toBe(roundedFreightCharge);
        });
    });

    describe('attribute: fuelCharge', () => {
        it('should be required', () => {
            delete materialOrderAttributes.fuelCharge;
            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const { errors } = materialOrder.validateSync();

            expect(errors.fuelCharge).toBeDefined();
        });

        it('should be a number', () => {
            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            expect(materialOrder.fuelCharge).toEqual(expect.any(Number));
        });

        it('should be a positive number', () => {
            materialOrderAttributes.fuelCharge = -1;
            const materialOrder = new MaterialOrderModel(materialOrderAttributes);
            
            const { errors } = materialOrder.validateSync();
            
            expect(errors.fuelCharge).toBeDefined();
        });

        it('should auto round to nearest penny', () => {
            const unrounderedFreightCharge = 99.999;
            const roundedFreightCharge = 100.00;
            materialOrderAttributes.freightCharge = unrounderedFreightCharge;
            const materialOrder = new MaterialOrderModel(materialOrderAttributes);
            
            expect(materialOrder.freightCharge).toBe(roundedFreightCharge);
        });
    });

    describe('materialOrder.author validation', () => {
        it('should fail validation if author is not defined', () => {
            delete materialOrderAttributes.author;

            const materialOrder = new MaterialOrderModel(materialOrderAttributes);

            const error = materialOrder.validateSync();

            expect(error).not.toBe(undefined);
        });
    });
    
});
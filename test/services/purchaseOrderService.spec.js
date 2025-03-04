import Chance from 'chance';
import * as purchaseOrderService from '../../application/api/services/purchaseOrderService.ts';
import { MaterialOrderModel } from '../../application/api/models/materialOrder.ts';

const chance = Chance();

jest.mock('../../application/api/models/materialOrder.ts');

describe('purchaseOrderService test suite', () => {
    describe('getPurchaseOrdersForMaterials()', () => {
        let purchaseOrdersInDatabase,
            purchaseOrderIds;

        afterEach(() => {
            jest.resetAllMocks();
        });

        beforeEach(() => {
            purchaseOrderIds = chance.n(chance.string, chance.integer({min: 0, max: 100}));
            purchaseOrdersInDatabase = buildPurchaseOrders(purchaseOrderIds);
            execFunction = jest.fn().mockResolvedValue(purchaseOrdersInDatabase);
            findFunction = jest.fn().mockImplementation(() => {
                return {
                    exec: execFunction
                };
            });

            MaterialOrderModel.find.mockImplementation(findFunction);
        });

        it ('should not throw error', async () => {
            await expect(purchaseOrderService.getPurchaseOrdersForMaterials([])).resolves.not.toThrow();
        });

        it ('should search for materials from database', async () => {
            await purchaseOrderService.getPurchaseOrdersForMaterials();

            expect(findFunction).toHaveBeenCalledTimes(1);
            expect(execFunction).toHaveBeenCalledTimes(1);
        });

        it ('should use the correct search when querying the database', async () => {
            const expectedSearchQuery = {
                material: {$in: purchaseOrderIds}
            };
            await purchaseOrderService.getPurchaseOrdersForMaterials(purchaseOrderIds);

            expect(findFunction).toHaveBeenCalledWith(expectedSearchQuery);
        });

        it ('should return the purchaseOrders from the database', async () => {
            const purchaseOrders = await purchaseOrderService.getPurchaseOrdersForMaterials();

            expect(purchaseOrders).toBeDefined();
            expect(purchaseOrders.length).toBe(purchaseOrdersInDatabase.length);
        });
    });

    describe('findPurchaseOrdersThatHaveNotArrived()', () => {
        it('should return an empty array if an empty array is passed in', () => {
            const emptyArray = [];
            const purchaseOrders = [];

            const foundPurchaseOrders = purchaseOrderService.findPurchaseOrdersThatHaveNotArrived(purchaseOrders);

            expect(foundPurchaseOrders).toEqual(emptyArray);
        });

        it('should only return purchaseOrders that HAVE NOT arrived', () => {
            const purchaseOrdersThatHaveArrived = chance.n(getPurchaseOrderThatHasArrived, chance.integer({min: 1, max: 1000}));
            const purchaseOrdersThatHaveNotArrived = chance.n(getPurchaseOrderThatHasNotArrived, chance.integer({min: 1, max: 1000}));
            const purchaseOrders = [
                ...purchaseOrdersThatHaveArrived,
                ...purchaseOrdersThatHaveNotArrived
            ];

            const foundPurchaseOrders = purchaseOrderService.findPurchaseOrdersThatHaveNotArrived(purchaseOrders);

            expect(foundPurchaseOrders.length).toEqual(purchaseOrdersThatHaveNotArrived.length);
        });
    });

    describe('findPurchaseOrdersThatHaveArrived()', () => {
        it('should return an empty array if an empty array is passed in', () => {
            const emptyArray = [];
            const purchaseOrders = [];

            const foundPurchaseOrders = purchaseOrderService.findPurchaseOrdersThatHaveArrived(purchaseOrders);

            expect(foundPurchaseOrders).toEqual(emptyArray);
        });

        it('should only return purchaseOrders that HAVE arrived', () => {
            const purchaseOrdersThatHaveArrived = chance.n(getPurchaseOrderThatHasArrived, chance.integer({min: 1, max: 1000}));
            const purchaseOrdersThatHaveNotArrived = chance.n(getPurchaseOrderThatHasNotArrived, chance.integer({min: 1, max: 1000}));
            const purchaseOrders = [
                ...purchaseOrdersThatHaveArrived,
                ...purchaseOrdersThatHaveNotArrived
            ];

            const foundPurchaseOrders = purchaseOrderService.findPurchaseOrdersThatHaveArrived(purchaseOrders);

            expect(foundPurchaseOrders.length).toEqual(purchaseOrdersThatHaveArrived.length);
        });
    });

    describe('computeLengthOfMaterialOrders()', () => {
        it('should return length of 0 if no purchase orders are passed', () => {
            const expectedLength = 0;
            const purchaseOrders = [];

            const actualLength = purchaseOrderService.computeLengthOfMaterialOrders(purchaseOrders);

            expect(actualLength).toBe(expectedLength);
        });

        it('should compute the length of material on purchase orders correctly', () => {
            const numberOfPurchaseOrders = chance.integer({min: 1, max: 100});
            const purchaseOrders = chance.n(buildPurchaseOrder, numberOfPurchaseOrders);
            let expectedLength = 0;

            for (let i=0; i < numberOfPurchaseOrders; i++) {
                expectedLength += purchaseOrders[i].totalRolls * purchaseOrders[i].feetPerRoll;
            }

            const actualLength = purchaseOrderService.computeLengthOfMaterialOrders(purchaseOrders);

            expect(actualLength).toBe(expectedLength);
        });
    });
});

function getPurchaseOrderThatHasNotArrived() {
    return {
        hasArrived: false
    };
}

function getPurchaseOrderThatHasArrived() {
    return {
        hasArrived: true
    };
}

function buildPurchaseOrder() {
    return {
        _id: chance.string(),
        totalRolls: chance.integer({min: 1, max: 10}),
        feetPerRoll: chance.integer({min: 1, max: 10})
    };
}

function buildPurchaseOrders(purchaseOrderIds) {
    return purchaseOrderIds.map((purchaseOrderId) => {
        return {
            _id: purchaseOrderId,
        };
    });
}
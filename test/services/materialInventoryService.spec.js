import Chance from 'chance';
import { when } from 'jest-when';
import * as materialInventoryService from '../../application/api/services/materialInventoryService.ts';
import * as mockPurchaseOrderService from '../../application/api/services/purchaseOrderService.ts';

const chance = Chance();

jest.mock('../../application/api/services/purchaseOrderService.ts');

describe('materialInventoryService test suite', () => {
    describe('mapMaterialIdToPurchaseOrders()', () => {
        it('should map correct materialId to associated purchaseOrders', () => {
            const firstMaterialId = chance.string();
            const secondMaterialId = chance.string();
            const materialIds = [firstMaterialId, secondMaterialId];
            const firstMaterialPurchaseOrders = [
                buildPurchaseOrder(firstMaterialId)
            ];
            const secondMaterialPurchaseOrders = [
                buildPurchaseOrder(secondMaterialId),
                buildPurchaseOrder(secondMaterialId),
                buildPurchaseOrder(secondMaterialId),
            ];
            const purchaseOrders = [
                ...firstMaterialPurchaseOrders,
                ...secondMaterialPurchaseOrders
            ];

            const actualMaterialIdToPurchaseOrders = materialInventoryService.mapMaterialIdToPurchaseOrders(materialIds, purchaseOrders);

            expect(actualMaterialIdToPurchaseOrders[firstMaterialId].length).toBe(firstMaterialPurchaseOrders.length);
            expect(actualMaterialIdToPurchaseOrders[secondMaterialId].length).toBe(secondMaterialPurchaseOrders.length);
        });

        it('should map correct materialId to associated purchaseOrders', () => {
            const firstMaterialId = chance.string();
            const secondMaterialId = chance.string();
            const materialIds = [firstMaterialId, secondMaterialId];
            const purchaseOrders = [];
            const emptyArray = [];

            const actualMaterialIdToPurchaseOrders = materialInventoryService.mapMaterialIdToPurchaseOrders(materialIds, purchaseOrders);

            expect(actualMaterialIdToPurchaseOrders[firstMaterialId]).toEqual(emptyArray);
            expect(actualMaterialIdToPurchaseOrders[secondMaterialId]).toEqual(emptyArray);
        });
    });

    describe('buildMaterialInventory', () => {
        let purchaseOrdersThatHaveArrived, 
            purchaseOrdersThatHaveNotArrived, 
            material,
            purchaseOrders;

        afterEach(() => {
            jest.resetAllMocks();
        });

        beforeEach(() => {
            material = {};
            purchaseOrdersThatHaveArrived = [
                buildPurchaseOrder(chance.string()),
                buildPurchaseOrder(chance.string())
            ];
            purchaseOrdersThatHaveNotArrived = [
                buildPurchaseOrder(chance.string())
            ];
            purchaseOrders = [
                ...purchaseOrdersThatHaveArrived,
                ...purchaseOrdersThatHaveNotArrived
            ];

            when(mockPurchaseOrderService.findPurchaseOrdersThatHaveArrived)
                .calledWith(purchaseOrders)
                .mockReturnValue(purchaseOrdersThatHaveArrived);

            when(mockPurchaseOrderService.findPurchaseOrdersThatHaveNotArrived)
                .calledWith(purchaseOrders)
                .mockReturnValue(purchaseOrdersThatHaveNotArrived);

            when(mockPurchaseOrderService.computeLengthOfMaterialOrders)
                .calledWith(purchaseOrders)
                .mockReturnValue(chance.integer({min: 0}));
        });
        it('should not throw an error', () => {
            expect(() => {
                materialInventoryService.buildMaterialInventory({}, [], 0);
            }).not.toThrow();
        });

        it('should call correct methods', () => {
            const materialLengthAdjustment = chance.integer();
            materialInventoryService.buildMaterialInventory(material, purchaseOrders, materialLengthAdjustment);

            expect(mockPurchaseOrderService.findPurchaseOrdersThatHaveArrived).toHaveBeenCalledTimes(1);
            expect(mockPurchaseOrderService.findPurchaseOrdersThatHaveNotArrived).toHaveBeenCalledTimes(1);
            expect(mockPurchaseOrderService.computeLengthOfMaterialOrders).toHaveBeenCalledWith(purchaseOrdersThatHaveArrived);
            expect(mockPurchaseOrderService.computeLengthOfMaterialOrders).toHaveBeenCalledWith(purchaseOrdersThatHaveNotArrived);
        });

        it('should return a materialInventory object with correctly calculated attributes', () => {
            const lengthOfMaterialOrdered = chance.integer({min: 1});
            const lengthOfMaterialInStock = chance.integer({min: 1});
            const materialLengthAdjustment = chance.integer();

            when(mockPurchaseOrderService.computeLengthOfMaterialOrders)
                .calledWith(purchaseOrdersThatHaveArrived)
                .mockReturnValue(lengthOfMaterialInStock);

            when(mockPurchaseOrderService.computeLengthOfMaterialOrders)
                .calledWith(purchaseOrdersThatHaveNotArrived)
                .mockReturnValue(lengthOfMaterialOrdered);

            const netLengthOfMaterialInStock = lengthOfMaterialInStock + materialLengthAdjustment;
            const expectedMaterialInventory = {
                material,
                netLengthOfMaterialInStock,
                lengthOfMaterialOrdered,
                lengthOfMaterialInStock,
                purchaseOrdersForMaterial: purchaseOrdersThatHaveNotArrived
            };

            const materialInventory = materialInventoryService.buildMaterialInventory(material, purchaseOrders, materialLengthAdjustment);
        
            expect(materialInventory).toEqual(expectedMaterialInventory);
        });
    });

    describe('computeNetLengthOfMaterialInInventory', () => {
        let materialInventories;

        it('should return 0 when input is an empty array', () => {
            materialInventories = [];
            const expectedNetLengthOfMaterial = 0;

            const actualNetLengthOfMaterial = materialInventoryService.computeNetLengthOfMaterialInInventory(materialInventories);

            expect(actualNetLengthOfMaterial).toBe(expectedNetLengthOfMaterial);
        });

        it('should return the summation of each materialInventories "netLengthOfMaterialInStock" attribute', () => {
            const netLengthOfMaterial1 = chance.integer();
            const netLengthOfMaterial2 = chance.integer();
            const netLengthOfMaterial3 = chance.integer();
            materialInventories = [
                { netLengthOfMaterialInStock: netLengthOfMaterial1 },
                { netLengthOfMaterialInStock: netLengthOfMaterial2 },
                { netLengthOfMaterialInStock: netLengthOfMaterial3 }
            ];
            const expectedNetLengthOfMaterial = netLengthOfMaterial1 + netLengthOfMaterial2 + netLengthOfMaterial3;

            const actualNetLengthOfMaterial = materialInventoryService.computeNetLengthOfMaterialInInventory(materialInventories);

            expect(actualNetLengthOfMaterial).toBe(expectedNetLengthOfMaterial);
        });
    });
});

function buildPurchaseOrder(materialId) {
    return {
        material: materialId
    };
}
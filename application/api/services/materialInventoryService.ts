import * as purchaseOrderService from './purchaseOrderService.ts';
import { MaterialLengthAdjustmentModel } from '../models/materialLengthAdjustment.ts';
import { MongooseId, MongooseIdStr } from '@shared/types/typeAliases.ts';
import { IMaterial, IMaterialOrder } from '@shared/types/models.ts';
import { MaterialModel } from '../models/material.ts';
import * as mongooseService from '../services/mongooseService.ts';
import * as materialInventoryService from '../services/materialInventoryService.ts';

type MaterialLengthAdjustmentDetails = {
  materialLengthAdjustmentIds: MongooseIdStr[]
  sum: number
}
/* 
  @See: 
    https://mongoplayground.net/
  
  @Returns: 
    A map where the key is the material _id which maps to the net length of that material found in the MaterialLengthAdjustment db table
  
  @Notes:
    type materialIdsWithTotalLengthAdjustments = {
      _id: mongooseId,
      totalLength: number
    }
*/
export async function getLengthAdjustmentDetailsByMaterialId(): Promise<Record<MongooseIdStr, MaterialLengthAdjustmentDetails>> {
  const materialIdsWithLengthAdjustmentDetails = await MaterialLengthAdjustmentModel.aggregate([
    {
      $group: {
        _id: '$material',
        sumOfMaterialLengthAdjustments: {
          $sum: { '$toDouble': '$length' }
        },
        materialLengthAdjustmentIds: {
          $push: '$_id' // Collects all the IDs of the grouped material adjustments
        }
      },
    },
  ]);

  const lengthAdjustmentDetailsByMaterialId: Record<MongooseIdStr, MaterialLengthAdjustmentDetails> = {};

  materialIdsWithLengthAdjustmentDetails.forEach(({ _id, sumOfMaterialLengthAdjustments, materialLengthAdjustmentIds }) => {
    lengthAdjustmentDetailsByMaterialId[_id] = {
      sum: sumOfMaterialLengthAdjustments,
      materialLengthAdjustmentIds
    };
  });

  return lengthAdjustmentDetailsByMaterialId;
}

export function mapMaterialIdToPurchaseOrders(materialIds: MongooseId[], purchaseOrders: IMaterialOrder[]): Record<string, IMaterialOrder[]> {
  const materialIdToPurchaseOrders = {};

  materialIds.forEach((materialId) => {
    materialIdToPurchaseOrders[materialId as string] = [];
  });

  purchaseOrders.forEach((purchaseOrder) => {
    const materialId = purchaseOrder.material;

    materialIdToPurchaseOrders[materialId as string].push(purchaseOrder);
  });

  return materialIdToPurchaseOrders;
}

export function getInventoryForMaterial(purchaseOrdersForMaterial: IMaterialOrder[], lengthAdjustmentDetails: MaterialLengthAdjustmentDetails | undefined): IMaterial['inventory'] {
  const arrivedOrders = purchaseOrderService.findPurchaseOrdersThatHaveArrived(purchaseOrdersForMaterial);
  const notArrivedOrders = purchaseOrderService.findPurchaseOrdersThatHaveNotArrived(purchaseOrdersForMaterial);
  const lengthArrived = purchaseOrderService.computeLengthOfMaterialOrders(arrivedOrders);
  const lengthNotArrived = purchaseOrderService.computeLengthOfMaterialOrders(notArrivedOrders);
  const materialOrderIds = purchaseOrdersForMaterial.map((purchaseOrder) => purchaseOrder._id);
  const sumOfLengthAdjustments = lengthAdjustmentDetails?.sum || 0
  const netLengthAvailable = lengthArrived + sumOfLengthAdjustments

  const foo = {
    netLengthAvailable: netLengthAvailable,
    lengthNotArrived: lengthNotArrived,
    lengthArrived: lengthArrived,
    materialOrders: materialOrderIds,
    sumOfLengthAdjustments: sumOfLengthAdjustments,
    lengthAdjustments: lengthAdjustmentDetails?.materialLengthAdjustmentIds || []
  }
  return foo
}

export function buildMaterialInventory(material: IMaterial, allPurchaseOrdersForMaterial: IMaterialOrder[], netMaterialLengthAdjustment: number) {
    const purchaseOrdersThatHaveArrived = purchaseOrderService.findPurchaseOrdersThatHaveArrived(allPurchaseOrdersForMaterial);
    const purchaseOrdersThatHaveNotArrived = purchaseOrderService.findPurchaseOrdersThatHaveNotArrived(allPurchaseOrdersForMaterial);
    const lengthOfMaterialInStock = purchaseOrderService.computeLengthOfMaterialOrders(purchaseOrdersThatHaveArrived);

    return {
        material,
        lengthOfMaterialOrdered: purchaseOrderService.computeLengthOfMaterialOrders(purchaseOrdersThatHaveNotArrived),
        lengthOfMaterialInStock: lengthOfMaterialInStock,
        netLengthOfMaterialInStock: lengthOfMaterialInStock + netMaterialLengthAdjustment,
        purchaseOrdersForMaterial: purchaseOrdersThatHaveNotArrived
    };
}

export function computeNetLengthOfMaterialInInventory(materialInventories) {
  const initialValue = 0;

  return materialInventories.reduce((accumulator, currentMaterialInventory) => {
    return accumulator + currentMaterialInventory.netLengthOfMaterialInStock;
  }, initialValue);
}

export async function populateMaterialInventories(materialIds?: MongooseIdStr[]) {
  const filter = !!materialIds ? { _id: { $in: [materialIds] } } : {};
  const materials: IMaterial[] = await MaterialModel
    .find(filter)
    .populate({ path: 'materialCategory' })
    .populate({ path: 'vendor' })
    .populate({ path: 'adhesiveCategory' })
    .exec();

  const distinctMaterialObjectIds = mongooseService.getObjectIds<IMaterial>(materials);
  const materialIdToLengthAdjustmentDetails = await materialInventoryService.getLengthAdjustmentDetailsByMaterialId();
  const allPurchaseOrders = await purchaseOrderService.getPurchaseOrdersForMaterials(distinctMaterialObjectIds);
  const materialIdToPurchaseOrders = materialInventoryService.mapMaterialIdToPurchaseOrders(distinctMaterialObjectIds, allPurchaseOrders);

  const materialIdToInventory: Record<string, IMaterial['inventory']> = {};

  materials.forEach((material) => {
    const materialOrders = materialIdToPurchaseOrders[material._id as string] || [];
    const lengthAdjustmentDetails = materialIdToLengthAdjustmentDetails[material._id as string];
    materialIdToInventory[material._id as string] = materialInventoryService.getInventoryForMaterial(materialOrders, lengthAdjustmentDetails as MaterialLengthAdjustmentDetails)
  });

  const bulkOps = Object.keys(materialIdToInventory).map((materialId) => ({
    updateOne: {
      filter: { _id: materialId },
      update: { $set: { inventory: materialIdToInventory[materialId] } },
      upsert: false
    }
  }))

  await MaterialModel.bulkWrite(bulkOps)
}
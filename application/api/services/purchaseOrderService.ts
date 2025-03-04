import { MongooseId } from '@shared/types/typeAliases.ts';
import { MaterialOrderModel } from '../models/materialOrder.ts';
import { IMaterialOrder } from '@shared/types/models.ts';

export async function getPurchaseOrdersForMaterials(materialIds: MongooseId[]): Promise<IMaterialOrder[]> {
    const searchQuery = {
        material: {$in: materialIds}
    };

    return await MaterialOrderModel
      .find(searchQuery)
      .exec() as unknown as IMaterialOrder[];
}

export function findPurchaseOrdersThatHaveNotArrived(purchaseOrders: IMaterialOrder[]): IMaterialOrder[] {
    return purchaseOrders.filter((purchaseOrder) => {
        return !purchaseOrder.hasArrived;
    });
}

export function findPurchaseOrdersThatHaveArrived(purchaseOrders: IMaterialOrder[]): IMaterialOrder[] {
    return purchaseOrders.filter((purchaseOrder) => {
        return purchaseOrder.hasArrived;
    });
}

export function computeLengthOfMaterialOrders(purchaseOrders: IMaterialOrder[]): number {
    let lengthOfMaterial = 0;
    
    purchaseOrders.forEach((purchaseOrder) => {
        lengthOfMaterial += getMaterialLengthOnPurchaseOrder(purchaseOrder);
    });

    return lengthOfMaterial;
}

function getMaterialLengthOnPurchaseOrder(purchaseOrder) {
    return purchaseOrder.totalRolls * purchaseOrder.feetPerRoll;
}
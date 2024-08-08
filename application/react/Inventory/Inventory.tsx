import React, { useEffect, useState } from 'react';
import './Inventory.scss'
import { observer } from 'mobx-react-lite';
import Summary from './Summary/Summary';
import Materials from './Materials/Materials';
import { MaterialOrder } from '../_types/databaseModels/MaterialOrder';
import { Material } from '../_types/databasemodels/material.ts';
import inventorySummaryStore from '../stores/inventorySummaryStore';
import { io } from 'socket.io-client';
import InventoryFilterBar from './InventoryFilterBar/InventoryFilterBar';
import { MaterialDetailsModal } from './MaterialDetailsModal/MaterialDetailsModal';
import { useAxios } from '../_hooks/useAxios.ts';


const socket = io();

export type MaterialInventory = {
  lengthOfMaterialInStock: number
  lengthOfMaterialOrdered: number
  material: Material,
  netLengthOfMaterialInStock: number,
  purchaseOrdersForMaterial: MaterialOrder[]
}

export type MaterialInventorySummary = {
  lengthOfAllMaterialsInInventory: number,
  lengthOfAllMaterialsOrdered: number,
  materialInventories: MaterialInventory[],
  netLengthOfMaterialInInventory: number
}

const Inventory = observer(() => {
  const inventorySummary: Partial<MaterialInventorySummary> = inventorySummaryStore.getInventorySummary()
  const [clickedMaterial, setClickedMaterial] = useState<MaterialInventory | null>(null);
  const axios = useAxios();
  
  useEffect(() => {
    inventorySummaryStore.recalculateInventorySummary(axios) /* Populates the mobx store with Inventory data which is then auto-rendered on screen */
  }, []);

  socket.on('MATERIAL:CHANGED', (_: Material) => {
    inventorySummaryStore.recalculateInventorySummary(axios) /* Populates the mobx store with Inventory data which is then auto-rendered on screen */
  })

  socket.on('MATERIAL_ORDER:CHANGED', (_: MaterialOrder) => {
    inventorySummaryStore.recalculateInventorySummary(axios) /* Populates the mobx store with Inventory data which is then auto-rendered on screen */
  })

  function displayMaterialInventoryDetailsModal(materialInventory: MaterialInventory) {
    setClickedMaterial(materialInventory)
  }

  function closeMaterialInventoryDetailsModal() {
    setClickedMaterial(null)
  }

  return (
    <div id='inventory-page' data-test='inventory-page'>
      {
        clickedMaterial && 
        (<MaterialDetailsModal materialInventory={clickedMaterial} onClose={() => closeMaterialInventoryDetailsModal()} />)
      }
      
      {
        inventorySummary &&
        <Summary inventorySummaryStore={inventorySummaryStore} />
      }

      <InventoryFilterBar />
      
      {
        inventorySummary &&
          <Materials
            inventorySummaryStore={inventorySummaryStore}
            onMaterialClicked={(materialInventory: MaterialInventory) => displayMaterialInventoryDetailsModal(materialInventory)}
          />
      }
    </div>
  )
});

export default Inventory;
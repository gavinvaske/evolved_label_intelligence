import React from 'react'
import './InventoryFilterBar.scss'
import inventoryStore from '../../stores/inventoryStore';
import { observer } from 'mobx-react-lite';
import { conditionalQuickFilters, textQuickFilters } from './quickFilters';
import { FilterBar } from '../../_global/FilterBar/FilterBar';
import { Link } from 'react-router-dom';

const InventoryFilterBar = observer((_) => {

  return (
    <div id='inventory-filter-bar' className="workflow-filter flex-center-left-row full-width card">
      <div className='tooltip-top btn-wrapper'> 
        <Link to='/react-ui/forms/material-order' className='btn-create'><i className="fa-regular fa-plus"></i> Order</Link>
        <span className="tooltiptext">Order material</span>
      </div>
      <div className='tooltip-top btn-wrapper'> 
        <Link to='/react-ui/forms/material' className='btn-create'><i className="fa-regular fa-plus"></i> Material</Link>
        <span className="tooltiptext">Create a new material</span>
      </div>
      <div className='tooltip-top btn-wrapper'>
        <Link to='/react-ui/forms/material-length-adjustment' className='btn-create'>Adjustment</Link>
        <span className="tooltiptext">Adjust footage for material</span>
      </div>

      <FilterBar
          conditionalQuickFilters={conditionalQuickFilters}
          textQuickFilters={textQuickFilters}
          store={inventoryStore}
          filterableItemsCount={inventoryStore.getMaterials().length}
      />
    </div>
  )
})

export default InventoryFilterBar
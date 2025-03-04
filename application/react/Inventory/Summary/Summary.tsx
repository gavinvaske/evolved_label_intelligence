import React from 'react';
import './Summary.scss'
import { observer } from 'mobx-react-lite';
import inventoryStore from '../../stores/inventoryStore';

const Summary = observer(() => {

  return (
    <div className='material-summary-container'>
      <div className='card col col-one'>
        <h1>Inventory</h1>
      </div>
      <div className='card col col-two'>
        <span>Feet On Hand</span>
        <h2 className='total-length-of-material-in-inventory'>{inventoryStore.getArrivedMaterialsLength()}</h2>
      </div>
      <div className='card col col-three'>
        <span>Net Feet</span>
        <h2 className='net-length-of-material-in-inventory'>{inventoryStore.getNetLengthOfMaterialsInInventory()}</h2>
      </div>
      <div className='card col col-four'>
        <span>Feet On Order</span>
        <h2 className='total-length-of-material-ordered'>{inventoryStore.getNotArrivedMaterialsLength()}</h2>
      </div>
    </div>
  )
});

export default Summary;
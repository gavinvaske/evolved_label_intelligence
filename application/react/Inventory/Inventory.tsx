import './Inventory.scss'
import { observer } from 'mobx-react-lite';
import Summary from './Summary/Summary';
import MaterialCards from './Materials/MaterialCards.tsx';
import InventoryFilterBar from './InventoryFilterBar/InventoryFilterBar';

const Inventory = observer(() => {
  return (
    <div id='inventory-page' className='page-wrapper' data-test='inventory-page'>
      <Summary />
      <InventoryFilterBar />
      <MaterialCards />
    </div>
  )
});

export default Inventory;
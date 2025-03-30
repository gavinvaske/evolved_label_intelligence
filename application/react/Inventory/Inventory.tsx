import { observer } from 'mobx-react-lite';
import Summary from './Summary/Summary';
import MaterialCards from './Materials/MaterialCards.tsx';
import InventoryFilterBar from './InventoryFilterBar/InventoryFilterBar';
import * as sharedStyles from '@ui/styles/shared.module.scss'

const Inventory = observer(() => {
  return (
    <div className={sharedStyles.pageWrapper} data-test='inventory-page'>
      <Summary />
      <InventoryFilterBar />
      <MaterialCards />
    </div>
  )
});

export default Inventory;
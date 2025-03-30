import { observer } from 'mobx-react-lite';
import inventoryStore from '../../stores/inventoryStore';
import * as styles from './Summary.module.scss';
import clsx from 'clsx';

const Summary = observer(() => {

  return (
    <div className={styles.materialSummaryContainer}>
      <div className={clsx(styles.card, styles.col)}>
        <h1>Inventory</h1>
      </div>
      <div className={clsx(styles.card, styles.col)}>
        <span>Feet On Hand</span>
        <h2 className='total-length-of-material-in-inventory'>{inventoryStore.getArrivedMaterialsLength()}</h2>
      </div>
      <div className={clsx(styles.card, styles.col)}>
        <span>Net Feet</span>
        <h2 className='net-length-of-material-in-inventory'>{inventoryStore.getNetLengthOfMaterialsInInventory()}</h2>
      </div>
      <div className={clsx(styles.card, styles.col)}>
        <span>Feet On Order</span>
        <h2 className='total-length-of-material-ordered'>{inventoryStore.getNotArrivedMaterialsLength()}</h2>
      </div>
    </div>
  )
});

export default Summary;
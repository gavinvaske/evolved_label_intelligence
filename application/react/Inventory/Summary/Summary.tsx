import { observer } from 'mobx-react-lite';
import inventoryStore from '../../stores/inventoryStore';
import * as styles from './Summary.module.scss';
import clsx from 'clsx';

const Summary = observer(() => {

  return (
    <div className={styles.materialSummaryContainer}>
      <div className={clsx(styles.card)}>
        <h1>Inventory</h1>
      </div>
      <div className={clsx(styles.card)}>
        <span>Length Arrived</span>
        <h2 className='total-length-of-material-in-inventory' data-test='total-length-of-arrived-material'>{inventoryStore.getArrivedMaterialsLength()}</h2>
      </div>
      <div className={clsx(styles.card)}>
        <span>Length Not Arrived</span>
        <h2 className='total-length-of-material-ordered' data-test='total-length-of-not-arrived-material'>{inventoryStore.getNotArrivedMaterialsLength()}</h2>
      </div>
      <div className={clsx(styles.card)}>
        <span>Net Length</span>
        <h2 className='net-length-of-material-in-inventory' data-test='net-length-of-material'>{inventoryStore.getNetLengthOfMaterialsInInventory()}</h2>
      </div>
    </div>
  )
});

export default Summary;
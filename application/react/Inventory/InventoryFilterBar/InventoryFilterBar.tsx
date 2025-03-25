
import inventoryStore from '../../stores/inventoryStore';
import { observer } from 'mobx-react-lite';
import { conditionalQuickFilters, textQuickFilters } from './quickFilters';
import { FilterBar } from '../../_global/FilterBar/FilterBar';
import { Link } from 'react-router-dom';
import * as styles from './InventoryFilterBar.module.scss';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import clsx from 'clsx';
import * as flexboxStyles from '@ui/styles/flexbox.module.scss'

const InventoryFilterBar = observer((_) => {

  return (
    <div className={clsx(flexboxStyles.flexCenterLeftRow, sharedStyles.fullWidth, sharedStyles.card, styles.inventoryFilterBar)}>
      <div className={clsx(sharedStyles.tooltipTop, styles.btnWrapper)}> 
        <Link to='/react-ui/forms/material-order' className={sharedStyles.btnCreate}><i className="fa-regular fa-plus"></i> Order</Link>
        <span className={clsx(sharedStyles.tooltipText)}>Order material</span>
      </div>
      <div className={clsx(sharedStyles.tooltipTop, styles.btnWrapper)}> 
        <Link to='/react-ui/forms/material' className={sharedStyles.btnCreate}><i className="fa-regular fa-plus"></i> Material</Link>
        <span className={clsx(sharedStyles.tooltipText)}>Create a new material</span>
      </div>
      <div className={clsx(sharedStyles.tooltipTop, styles.btnWrapper)}>
        <Link to='/react-ui/forms/material-length-adjustment' className={sharedStyles.btnCreate}>Adjustment</Link>
        <span className={clsx(sharedStyles.tooltipText)}>Adjust footage for material</span>
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
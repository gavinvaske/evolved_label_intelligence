import inventoryStore from '../../stores/inventoryStore';
import { observer } from 'mobx-react-lite';
import { conditionalQuickFilters, textQuickFilters } from './quickFilters';
import { FilterBar } from '../../_global/FilterBar/FilterBar';
import * as styles from './InventoryFilterBar.module.scss';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import clsx from 'clsx';
import * as flexboxStyles from '@ui/styles/flexbox.module.scss'
import { GoPlus } from "react-icons/go";
import { Button } from '../../_global/Button/Button';

const InventoryFilterBar = observer((_) => {

  return (
    <div className={clsx(flexboxStyles.flexCenterLeftRow, sharedStyles.fullWidth, sharedStyles.card, styles.inventoryFilterBar)}>
      <div className={styles.createButtonsWrapper}>
        <Button
          color="purple"
          to="/react-ui/forms/material-order"
          tooltip="Order a material"
          icon={<GoPlus />}
      >
        Order
      </Button>
      <Button
        color="purple"
        to="/react-ui/forms/material"
        tooltip="Create a material"
        icon={<GoPlus />}
      >
        Material
      </Button>
      <Button
        color="purple"
        to="/react-ui/forms/material-length-adjustment"
        tooltip="Adjust material footage"
        icon={<GoPlus />}
      >
          Adjustment
        </Button>
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
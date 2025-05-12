import { observer } from 'mobx-react-lite';
import { IMaterial } from '@shared/types/models';
import clsx from 'clsx';
import * as sharedStyles from '@ui/styles/shared.module.scss';
import * as styles from './MaterialCard.module.scss'
import * as flexboxStyles from '@ui/styles/flexbox.module.scss'
import { MaterialActions } from './MaterialActions';

type Props = {
  material: IMaterial,
  onClick: () => void,
}

const MaterialCard = observer((props: Props) => {
  const { material, onClick } = props;
  const numMaterialOrders = material.inventory.materialOrders.length;
  const numLengthAdjustments = material.inventory.lengthAdjustments.length

  return (
    <div id={material._id as string} className={clsx(styles.card)} onClick={() => onClick()} data-test='material-inventory-card'>
      <div className={clsx(styles.cardHeader, flexboxStyles.flexCenterCenterRow)}>
        <div className={clsx(styles.col, styles.colLeft)}>
          <h2 className={clsx({
            [styles.lowInventory as string]: isLowInventory(material),
            [styles.lowInventoryWarning as string]: isLowInventoryWarning(material),
          })}>
            {material.materialId}
          </h2>
          <div className={clsx(sharedStyles.tooltipTop, styles.materialWidthContainer)}>
            <h2 className={clsx(styles.materialWidth)}>{material.width ? `${material.width}"` : 'N/A'}</h2>
            <span className={clsx(sharedStyles.tooltipText)}>{material.width ? `${material.width}"` : 'N/A'} material width</span>
          </div>
        </div>
        <div className={clsx(styles.col, styles.colRight)}>
          <div className={styles.actionsContainer}>
            <MaterialActions
              material={material}
              numMaterialOrders={numMaterialOrders}
              numLengthAdjustments={numLengthAdjustments}
            />
          </div>
        </div>
      </div>

      <div className={clsx(styles.materialDescription, flexboxStyles.textLeft)}>
        <span className={clsx(styles.materialName)}>{material.name || 'N/A'}</span>
      </div>
      <div className={clsx(styles.actualVsOrderedContainer)}>
        <div className={clsx(styles.col, styles.colLeft)}>
          <span>Arrived</span>
          <h2 data-test='length-arrived'>{material.inventory.lengthArrived || 0}</h2>
        </div>
        <div className={clsx(styles.divideLine)}></div>
        <div className={clsx(styles.col, styles.colRight)}>
          <span>Not Arrived</span>
          <h2 data-test='length-not-arrived'>{material.inventory.lengthNotArrived || 0}</h2>
        </div>
        <div className={clsx(styles.divideLine)}></div>
        <div className={clsx(styles.col, styles.colRight)}>
          <span>Net</span>
          <h2 data-test='net-length-available'>{material.inventory.netLengthAvailable || 0}</h2>
        </div>
      </div>
      <div className={clsx(styles.materialLocationContainer, sharedStyles.tooltipTop)}>
        <span className={clsx(sharedStyles.tooltipText)}>Location of material</span>
        <div className={clsx(styles.spanWrapper)}>
          <span className={clsx(styles.materialLocation)}>{material?.locations?.length > 0 ? material.locations.join(', ') : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
});

function isLowInventory(material: IMaterial): boolean {
  const { lowStockThreshold, lowStockBuffer, inventory } = material;

  if ((!lowStockThreshold || !lowStockBuffer) || inventory.netLengthAvailable < lowStockThreshold) {
    return true
  }
  return false;
}

function isLowInventoryWarning(material: IMaterial): boolean {
  const { lowStockThreshold, lowStockBuffer, inventory } = material;

  if (
    inventory.netLengthAvailable > lowStockThreshold
    && inventory.netLengthAvailable < lowStockThreshold + lowStockBuffer
  ) {
    return true;
  }
  return false;
}

export default MaterialCard;
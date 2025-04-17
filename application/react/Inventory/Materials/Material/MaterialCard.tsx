import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { IMaterial } from '@shared/types/models.ts';
import { BsPlusSlashMinus } from "react-icons/bs";
import { LengthAdjustmentsModal } from './LengthAdjustmentsModal/LengthAdjustmentsModal.tsx';
import { PurchaseOrderModal } from './PurchaseOrdersModal/PurchaseOrdersModal.tsx';
import clsx from 'clsx';
import * as sharedStyles from '@ui/styles/shared.module.scss';
import * as styles from './MaterialCard.module.scss'
import * as flexboxStyles from '@ui/styles/flexbox.module.scss'
import { FaPenToSquare } from "react-icons/fa6";

type Props = {
  material: IMaterial,
  onClick: () => void
}

const MaterialCard = observer((props: Props) => {
  const { material, onClick } = props;
  const [shouldShowPoModal, setShouldShowPoModal] = useState(false);
  const [shouldShowLengthAdjustmentsModal, setShouldShowLengthAdjustmentsModal] = useState(false);
  const numMaterialOrders = material.inventory.materialOrders.length;
  const numLengthAdjustments = material.inventory.lengthAdjustments.length

  const showPurchaseOrderModal = (e) => {
    setShouldShowPoModal(true)
    e.stopPropagation() // This is required to prevent any parents' onClick from being called
  };

  const showLengthAdjustmentsModal = (e) => {
    setShouldShowLengthAdjustmentsModal(true)
    e.stopPropagation() // This is required to prevent any parents' onClick from being called
  };

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
          <div className={clsx(styles.materialCardOptionsContainer)}>
            <div className={clsx(styles.materialOption, styles.poContainer, sharedStyles.tooltipTop, numMaterialOrders === 0 ? styles.disabled : styles.enabled)} onClick={(e) => numMaterialOrders > 0 && showPurchaseOrderModal(e)}>
              <span className={clsx(sharedStyles.tooltipText)}>{numMaterialOrders === 0 ? 'No purchase orders' : `View ${numMaterialOrders} purchase orders`}</span>
              <div className={clsx(styles.iconContainer)}>
                <div className={clsx(styles.poCounter)}>{`${numMaterialOrders}`}</div>
              </div>

              {
                shouldShowPoModal &&
                <PurchaseOrderModal material={material} onClose={() => setShouldShowPoModal(!shouldShowPoModal)} />
              }

              {
                shouldShowLengthAdjustmentsModal &&
                <LengthAdjustmentsModal material={material} onClose={() => setShouldShowLengthAdjustmentsModal(!shouldShowLengthAdjustmentsModal)} />
              }

            </div>
            <div className={clsx(styles.materialOption, styles.openTicketContainer, sharedStyles.tooltipTop, numLengthAdjustments === 0 ? styles.disabled : styles.enabled)} onClick={(e) => numLengthAdjustments > 0 && showLengthAdjustmentsModal(e)}>
              <div className={clsx(styles.iconContainer)}>
                <i><BsPlusSlashMinus /></i>
              </div>
              <span className={clsx(sharedStyles.tooltipText)}>
                {
                  numLengthAdjustments === 0 ?
                    'No Adjustments' :
                    `View ${numLengthAdjustments} Adjustments`
                }
              </span>
            </div>
            <div className={clsx(styles.materialOption, styles.editContainer, sharedStyles.tooltipTop)}>
              <Link to={`/react-ui/forms/material/${material._id}`} onClick={(e) => e.stopPropagation()}>
                <div className={clsx(styles.iconContainer)}>
                  <i><FaPenToSquare /></i>
                </div>
              </Link>
              <span className={clsx(sharedStyles.tooltipText)}>Edit material details</span>
            </div>
          </div>
        </div>
      </div>

      <div className={clsx(styles.materialDescription, flexboxStyles.textLeft)}>
        <span className={clsx(styles.materialName)}>{material.name || 'N/A'}</span>
      </div>
      <div className={clsx(styles.actualVsOrderedContainer)}>
        <div className={clsx(styles.col, styles.colLeft)}>
          <span>Actual</span>
          <h2>{material.inventory.lengthArrived}</h2>
        </div>
        <div className={clsx(styles.divideLine)}></div>
        <div className={clsx(styles.col, styles.colRight)}>
          <span>Ordered</span>
          <h2>{material.inventory.lengthNotArrived}</h2>
        </div>
        <div className={clsx(styles.divideLine)}></div>
        <div className={clsx(styles.col, styles.colRight)}>
          <span>Net</span>
          <h2>{material.inventory.netLengthAvailable}</h2>
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
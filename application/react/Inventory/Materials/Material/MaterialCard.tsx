import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { IMaterial } from '@shared/types/models';
import { BsPlusSlashMinus } from "react-icons/bs";
import { LengthAdjustmentsModal } from './LengthAdjustmentsModal/LengthAdjustmentsModal';
import { PurchaseOrdersModal } from './PurchaseOrdersModal/PurchaseOrdersModal';
import clsx from 'clsx';
import * as sharedStyles from '@ui/styles/shared.module.scss';
import * as styles from './MaterialCard.module.scss'
import * as flexboxStyles from '@ui/styles/flexbox.module.scss'
import { FaPenToSquare } from "react-icons/fa6";
import { Modal } from '../../../_global/Modal/Modal';
import { IconButton } from '../../../_global/IconButton/IconButton';

type Props = {
  material: IMaterial,
  onClick: () => void,
}

const MaterialCard = observer((props: Props) => {
  const { material, onClick } = props;
  const [shouldShowPoModal, setShouldShowPoModal] = useState(false);
  const [shouldShowLengthAdjustmentsModal, setShouldShowLengthAdjustmentsModal] = useState(false);
  const numMaterialOrders = material.inventory.materialOrders.length;
  const numLengthAdjustments = material.inventory.lengthAdjustments.length
  const navigate = useNavigate();

  const showPurchaseOrderModal = (e: React.MouseEvent) => {
    setShouldShowPoModal(true)
    e.stopPropagation() // This is required to prevent any parents' onClick from being called
  };

  const showLengthAdjustmentsModal = (e: React.MouseEvent) => {
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
            <IconButton /* View Purchase Orders */
              icon={<div className={clsx(styles.poCounter)}>{`${numMaterialOrders}`}</div>}
              tooltip={numMaterialOrders === 0 ? 'No purchase orders' : `View ${numMaterialOrders} purchase orders`}
              onClick={(e) => numMaterialOrders > 0 && showPurchaseOrderModal(e)}
              disabled={numMaterialOrders === 0}
              variant={'green'}
            />

            <IconButton /* Create Purchase Order */
              icon={<FaPenToSquare />}
              tooltip="Create Purchase Order"
              onClick={() => navigate(`/react-ui/forms/material-order`, { state: { material: material._id } })}
              variant={'darkGrey'}
            />

            <IconButton /* View Length Adjustments */
              icon={<BsPlusSlashMinus />}
              tooltip={numLengthAdjustments === 0 ? 'No Adjustments' : `View ${numLengthAdjustments} Adjustments`}
              onClick={(e) => numLengthAdjustments > 0 && showLengthAdjustmentsModal(e)}
              disabled={numLengthAdjustments === 0}
              variant={'blue'}
            />

            <IconButton /* Create Length Adjustment */
              icon={<FaPenToSquare />}
              tooltip="Create Length Adjustment"
              onClick={() => navigate(`/react-ui/forms/material-length-adjustment`, { state: { material: material._id } })}
              variant={'purple'}
            />

            <IconButton /* Edit Material Details */
              icon={<FaPenToSquare />}
              tooltip="Edit material details"
              onClick={() => navigate(`/react-ui/forms/material/${material._id}`)}
              variant={'magenta'}
            />
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

      {shouldShowPoModal && (
        <Modal onClose={() => setShouldShowPoModal(false)}>
          <PurchaseOrdersModal material={material} />
        </Modal>
      )}

      {shouldShowLengthAdjustmentsModal && (
        <Modal onClose={() => setShouldShowLengthAdjustmentsModal(false)}>
          <LengthAdjustmentsModal material={material} />
        </Modal>
      )}
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
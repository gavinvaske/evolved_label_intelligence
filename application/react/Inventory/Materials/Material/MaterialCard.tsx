import { useState } from 'react';
import './MaterialCard.scss'  // TODO: Extract the css classes that the modals use
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { IMaterial } from '@shared/types/models.ts';
import { BsPlusSlashMinus } from "react-icons/bs";
import { LengthAdjustmentsModal } from './LengthAdjustmentsModal/LengthAdjustmentsModal.tsx';
import { PurchaseOrderModal } from './PurchaseOrdersModal/PurchaseOrdersModal.tsx';
import clsx from 'clsx';
import * as sharedStyles from '@ui/styles/shared.module.scss';

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
    if (e.currentTarget.classList.contains('disabled')) {
      e.stopPropagation();
      return; // Prevent further execution if the class is present
    }
    setShouldShowPoModal(true)
    e.stopPropagation() // This is required to prevent any parents' onClick from being called
  };

  const showLengthAdjustmentsModal = (e) => {
    if (e.currentTarget.classList.contains('disabled')) {
      e.stopPropagation();
      return; // Prevent further execution if the class is present
    }
    setShouldShowLengthAdjustmentsModal(true)
    e.stopPropagation() // This is required to prevent any parents' onClick from being called
  };

  return (
    <div id={material._id as string} className={clsx('card', getLowInventoryClass(material))} onClick={() => onClick()} data-test='material-inventory-card'>
      <div className={clsx('card-header', 'flex-center-center-row')}>
        <div className={clsx('col', 'col-left')}>
          <h2>{material.materialId}</h2>
          <div className={clsx('tooltip-top', 'material-width-container')}>
            <h2 className={clsx('material-width')}>{material.width ? `${material.width}"` : 'N/A'}</h2>
            <span className={clsx('tooltiptext')}>{material.width ? `${material.width}"` : 'N/A'} material width</span>
          </div>
        </div>
        <div className={clsx('col', 'col-right')}>
          <div className={clsx('material-card-options-container')}>
            <div className={clsx('material-option', 'po-container', 'tooltip-top', numMaterialOrders === 0 ? 'disabled' : 'enabled')} onClick={(e) => showPurchaseOrderModal(e)}>
              <span className={clsx('tooltiptext')}>{numMaterialOrders === 0 ? 'No purchase orders' : `View ${numMaterialOrders} purchase orders`}</span>
              <div className={clsx('icon-container')}>
                <div className={clsx('po-counter')}>{`${numMaterialOrders}`}</div>
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
            <div className={clsx('material-option', 'open-ticket-container', 'tooltip-top', numLengthAdjustments === 0 ? 'disabled' : 'enabled')} onClick={(e) => showLengthAdjustmentsModal(e)}>
              <div className={clsx('icon-container')}>
                <i><BsPlusSlashMinus /></i>
              </div>
              <span className={clsx('tooltiptext')}>
                {
                  numLengthAdjustments === 0 ?
                    'No Adjustments' :
                    `View ${numLengthAdjustments} Adjustments`
                }
              </span>
            </div>
            <div className={clsx('material-option', 'edit-container', 'tooltip-top')}>
              <Link to={`/react-ui/forms/material/${material._id}`} onClick={(e) => e.stopPropagation()}>
                <div className={clsx('icon-container')}>
                  <i className={clsx('fa-regular', 'fa-pen-to-square')}></i>
                </div>
              </Link>
              <span className={clsx('tooltiptext')}>Edit material details</span>
            </div>
          </div>
        </div>
      </div>
      <div className={clsx('material-description', 'text-left')}>
        <span className={clsx('material-name')}>{material.name || 'N/A'}</span>
      </div>
      <div className={clsx('actual-vs-ordered-container')}>
        <div className={clsx('col', 'col-left')}>
          <span>Actual</span>
          <h2 className={clsx('material-length-in-stock')}>{material.inventory.lengthArrived}</h2>
        </div>
        <div className={clsx('divide-line')}></div>
        <div className={clsx('col', 'col-right')}>
          <span>Ordered</span>
          <h2 className={clsx('material-length-ordered')}>{material.inventory.lengthNotArrived}</h2>
        </div>
        <div className={clsx('divide-line')}></div>
        <div className={clsx('col', 'col-right')}>
          <span>Net</span>
          <h2 className={clsx('material-length-ordered')}>{material.inventory.netLengthAvailable}</h2>
        </div>

      </div>
      <div className={clsx('material-location-container', 'tooltip-top')}>
        <span className={clsx('tooltiptext')}>Location of material</span>
        <div className={clsx('span-wrapper')}>
          <span className={clsx('material-location')}>{material?.locations?.length > 0 ? material.locations.join(', ') : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
});

function getLowInventoryClass({ lowStockThreshold, lowStockBuffer, inventory }: IMaterial): string {
  if (!lowStockThreshold || !lowStockBuffer) return 'low-inventory';

  if (inventory.netLengthAvailable < lowStockThreshold) {
    return 'low-inventory';
  }

  if (inventory.netLengthAvailable < lowStockThreshold + lowStockBuffer) {
    return 'low-inventory-warning';
  }

  return '';
}

export default MaterialCard;
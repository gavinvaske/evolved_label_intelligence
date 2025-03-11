import React, { useState } from 'react';
import './MaterialCard.scss'
import { observer } from 'mobx-react-lite';
import { Modal } from '../../../_global/Modal/Modal.tsx';
import { Link, useNavigate } from 'react-router-dom';
import { getDayMonthYear } from '../../../_helperFunctions/dateTime.ts';
import { IMaterial } from '@shared/types/models.ts';
import { useQuery } from '@tanstack/react-query';
import { getMaterialOrdersByIds } from '../../../_queries/materialOrder.ts';
import { LoadingIndicator } from '../../../_global/LoadingIndicator/LoadingIndicator.tsx';
import { useErrorMessage } from '../../../_hooks/useErrorMessage.ts';
import { BsPlusSlashMinus } from "react-icons/bs";
import { getMaterialLengthAdjustmentsByIds } from '../../../_queries/materialLengthAdjustment.ts';
import { MongooseIdStr } from '@shared/types/typeAliases.ts';

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
    <div id={material._id as string} className={`card ${getLowInventoryClass(material)}`} onClick={() => onClick()} data-test='material-inventory-card'>
      <div className='card-header flex-center-center-row'>
        <div className='col col-left'>
          <h2 className='material-id'>{material.materialId}</h2>
          <div className='tooltip-top material-width-container'>
            <h2 className='material-width'>{material.width ? `${material.width}"` : 'N/A'}</h2>
            <span className='tooltiptext'>{material.width ? `${material.width}"` : 'N/A'} material width</span>
          </div>
        </div>
        <div className='col col-right'>
          <div className='material-card-options-container'>
            <div className={`material-option po-container tooltip-top ${numMaterialOrders === 0 ? 'disabled' : 'enabled'}`} onClick={(e) => showPurchaseOrderModal(e)}>
              <span className='tooltiptext'>{numMaterialOrders === 0 ? 'No purchase orders' : `View ${numMaterialOrders} purchase orders`}</span>
              <div className='icon-container'>
                <div className='po-counter'>{`${numMaterialOrders}`}</div>
              </div>

              {
                shouldShowPoModal && 
                <PurchaseOrderModal material={material} onClose={() => setShouldShowPoModal(!shouldShowPoModal)}/>
              }

              {
                shouldShowLengthAdjustmentsModal &&
                <LengthAdjustmentsModal material={material} onClose={() => setShouldShowLengthAdjustmentsModal(!shouldShowLengthAdjustmentsModal)}/>
              }

            </div>
            <div className={`material-option open-ticket-container tooltip-top ${numLengthAdjustments === 0 ? 'disabled' : 'enabled'}`}>
              <div className={`icon-container ${numLengthAdjustments === 0 && ''}`} onClick={(e) => showLengthAdjustmentsModal(e)}>
                <i><BsPlusSlashMinus /></i>
              </div>
              <span className='tooltiptext'>
                {
                  numLengthAdjustments === 0 ? 
                    'No Adjustments' : 
                    `View ${numLengthAdjustments} Adjustments`
                }
              </span>
            </div>
            <div className='material-option edit-container tooltip-top'>
              <Link to={`/react-ui/forms/material/${material._id}`} onClick={(e) => e.stopPropagation()}>
                <div className='icon-container'>
                  <i className="fa-regular fa-pen-to-square"></i>
                </div>
              </Link>
              <span className='tooltiptext'>Edit material details</span>
            </div>
          </div>
        </div>
      </div>
      <div className='material-description text-left'>
        <span className='material-name'>{material.name || 'N/A'}</span>
      </div>
      <div className='actual-vs-ordered-container'>
        <div className='col col-left'>
          <span>Actual</span>
          <h2 className='material-length-in-stock'>{material.inventory.lengthArrived}</h2>
        </div>
        <div className='divide-line'></div>
        <div className='col col-right'>
          <span>Ordered</span>
          <h2 className='material-length-ordered'>{material.inventory.lengthNotArrived}</h2>
        </div>
        <div className='divide-line'></div>
        <div className='col col-right'>
          <span>Net</span>
          <h2 className='material-length-ordered'>{material.inventory.netLengthAvailable}</h2>
        </div>

      </div>
      <div className='material-location-container tooltip-top'>
        <span className='tooltiptext'>Location of material</span>
        <div className='span-wrapper'>
          <span className='material-location'>{material?.locations?.length > 0 ? material.locations.join(', ') : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
});

type ModalProps = {
  material: IMaterial, 
  onClose: () => void
}

const PurchaseOrderModal = (props: ModalProps) => {
  const { material, onClose } = props;

  return (
    <Modal onClose={() => onClose()}>
      <div className='modal-content'>
        <div className='title-wrapper'>
          <h4>Purchase orders: {material.materialId}</h4>
        </div>
        <div className='purchase-order-info-wrapper'>
          <div className='po-table'>
            <div className='tb-header'>
              <div className='tb-cell cell-one'>
                <div className='pulse-indicator'></div>
                PO #
              </div>
              <div className='tb-cell cell-two'>
                Order Date
              </div>
              <div className='tb-cell cell-three'>
                Arrival Date
              </div>
              <div className='tb-cell cell-four'>
                Total Feet
              </div>
            </div>
            {renderPurchaseOrders(material)}
          </div>
        </div>
      </div>
    </Modal>
  )
}

const LengthAdjustmentsModal = (props: ModalProps) => {
  const { material, onClose } = props;

  return (
    <Modal onClose={() => onClose()}>
      <div className='modal-content'>
        <div className='title-wrapper'>
          <h4>Material Length Adjustments: {material.materialId}</h4>
        </div>
        <div className='purchase-order-info-wrapper'>
          <div className='po-table'>
            <div className='tb-header'>
              <div className='tb-cell cell-50'>
                <div className='pulse-indicator'></div>
                Material ID
              </div>
              <div className='tb-cell cell-50'>
                Length
              </div>
            </div>
            {renderMaterialLengthAdjustments(material)}
          </div>
        </div>
      </div>
    </Modal>
  )
}

function getLowInventoryClass({lowStockThreshold, lowStockBuffer, inventory}: IMaterial): string {
  if (!lowStockThreshold || !lowStockBuffer) return 'low-inventory';

  if (inventory.netLengthAvailable < lowStockThreshold) {
    return 'low-inventory';
  }

  if (inventory.netLengthAvailable < lowStockThreshold + lowStockBuffer) {
    return 'low-inventory-warning';
  }

  return '';
}

function renderPurchaseOrders(material: IMaterial) {
  const navigate = useNavigate();
  const { isPending, isFetching, data: materialOrders, isError, error } = useQuery({
    queryKey: ['get-material-orders', JSON.stringify(material.inventory.materialOrders)],
    queryFn: async () => {
      const materials = await getMaterialOrdersByIds(material.inventory.materialOrders);

      return materials
    },
    initialData: []
  })

  if (isPending || isFetching) return (<LoadingIndicator />)

  if (isError) {
    useErrorMessage(error)
  }

  materialOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  return (
    materialOrders.map((mo, index: number) => (
      <div className='tb-row' key={index} onClick={() => navigate(`/react-ui/forms/material-order/${mo._id}`)}>
        <div className='tb-cell cell-one'>
          <div className='pulse-indicator'></div>
          {mo.purchaseOrderNumber}
        </div>
        <div className='tb-cell cell-two'>
          <div className='pulse-indicator'></div>
          {getDayMonthYear(mo.orderDate)}
        </div>
        <div className='tb-cell cell-three'>
          <div className='pulse-indicator'></div>
          {getDayMonthYear(mo.arrivalDate)}
        </div>
        <div className='tb-cell cell-four'>
          <div className='pulse-indicator'></div>
          {(mo.feetPerRoll * mo.totalRolls)}
        </div>
      </div>
    ))
  )
}

function renderMaterialLengthAdjustments(material: IMaterial) {
  const navigate = useNavigate();
  const { isPending, isFetching, data: lengthAdjustments, isError, error } = useQuery({
    queryKey: ['material-length-adjustments', JSON.stringify(material.inventory.lengthAdjustments)],
    queryFn: async () => {
      const lengthAdjustments = await getMaterialLengthAdjustmentsByIds(material.inventory.lengthAdjustments as MongooseIdStr[]);

      return lengthAdjustments
    },
    initialData: []
  })

  if (isPending || isFetching) return (<LoadingIndicator />)

  if (isError) {
    useErrorMessage(error)
  }

  lengthAdjustments.sort((a, b) => new Date(b.updatedAt as string).getTime() - new Date(a.updatedAt as string).getTime());

  return (
    lengthAdjustments.map((lo, index: number) => (
      <div className='tb-row' key={index} onClick={() => navigate(`/react-ui/forms/material-length-adjustment/${lo._id}`)}>
        <div className='tb-cell cell-50'>
          <div className='pulse-indicator'></div>
          {(lo.material as IMaterial).name}
        </div>
        <div className='tb-cell cell-50'>
          {lo.length}
        </div>
      </div>
    ))
  )
}

export default MaterialCard;
import React from 'react';
import './MaterialDetailsModal.scss'
import { FullScreenModal } from '../../_global/FullScreenModal/FullScreenModal';
import '../../utils/app.scss'

import { IMaterial } from '@shared/types/models';

type Props = {
  material: IMaterial,
  onClose: () => void
}

export const MaterialDetailsModal = (props: Props) => {
  const { material, onClose } = props;

  return (
    <FullScreenModal onClose={() => onClose()}>

        <div className='modal-header'>
          <h1>{material.materialId} <span>{material.name}</span></h1>
        </div>
        <div className='modal-body'>
          <div className='body-header'>
            <div className='box box-one'>
              <h5>Stock Available:</h5>
              <span>{material.inventory.netLengthAvailable}</span>
              </div>
            <div className='box box-two'>
            <h5>Adjustments:</h5> 
              <span>{material.inventory.manualLengthAdjustment}</span>
            </div>
            <div className='box box-three'>
              <h5>On Order:</h5>
              <span> {material.inventory.lengthNotArrived}</span>
            </div>
          </div>
          <div className='card-container'>
            <div className='card'>
              <h5>Description:</h5> 
              <span>{material.description}</span>
            </div>
            <div className='card'>
              <h5>When to use:</h5> 
              <span>{material.whenToUse}</span>
            </div>
          </div>
          <div className='card full-width'>
            <div className='tbl-pri'>
              <div className='tbl-hdr'>
                <div className='tbl-cell'><div className='pulse-indicator'></div>Name</div>
                <div className='tbl-cell'>Id</div>
                <div className='tbl-cell'>Vendor</div>
                <div className='tbl-cell'>Category</div>
                <div className='tbl-cell'>Thickness</div>
                <div className='tbl-cell'>Weight</div>
              </div>
              <div className='tbl-row'>
                <div className='tbl-cell'><div className='pulse-indicator'></div>{material.name}</div>
                <div className='tbl-cell'>{material.materialId}</div>
                <div className='tbl-cell'>{typeof material.vendor === 'object' && material?.vendor?.name}</div>
                <div className='tbl-cell'>{typeof material.materialCategory === 'object' && material?.materialCategory?.name}</div>
                <div className='tbl-cell'>{material.thickness}</div>
                <div className='tbl-cell'>{material.weight}</div>
              </div>
            </div>
            <div className='tbl-pri'>
              <div className='tbl-hdr'>
                <div className='tbl-cell'><div className='pulse-indicator'></div>Freight Cost/Msi</div>
                <div className='tbl-cell'>Width</div>
                <div className='tbl-cell'>FaceColor</div>
                <div className='tbl-cell'>Adhesive</div>
                <div className='tbl-cell'>Quote Price/MSI</div>
                <div className='tbl-cell'></div>
              </div>
              <div className='tbl-row'>
                <div className='tbl-cell'><div className='pulse-indicator'></div>{material.freightCostPerMsi}</div>
                <div className='tbl-cell'>{material.width}</div>
                <div className='tbl-cell'>{material.faceColor}</div>
                <div className='tbl-cell'>{material.adhesive}</div>
                <div className='tbl-cell'>{material.quotePricePerMsi}</div>
                <div className='tbl-cell'></div>
              </div>
            </div>
            <div className='tbl-pri'>
              <div className='tbl-hdr'>
                <div className='tbl-cell'><div className='pulse-indicator'></div>Length</div>
                <div className='tbl-cell'>Facesheet Weight/MSI</div>
                <div className='tbl-cell'>Adhesive Weight/MSI</div>
                <div className='tbl-cell'>Liner Weight/MSI</div>
                <div className='tbl-cell'>Total POs</div>
                <div className='tbl-cell'>costPerMsi</div>
              </div>
              <div className='tbl-row'>
                <div className='tbl-cell'><div className='pulse-indicator'></div>{material.length}</div>
                <div className='tbl-cell'>{material.facesheetWeightPerMsi}</div>
                <div className='tbl-cell'>{material.adhesiveWeightPerMsi}</div>
                <div className='tbl-cell'>{material.linerWeightPerMsi}</div>
                <div className='tbl-cell'>{material.inventory.materialOrders.length || 0}</div>
                <div className='tbl-cell'>{material.costPerMsi}</div>
              </div>
            </div>
            <div className='tbl-pri'>
              <div className='tbl-hdr'>
                <div className='tbl-cell'><div className='pulse-indicator'></div>Alternative Stock</div>
                <div className='tbl-cell'>Adhesive Category</div>
              </div>
              <div className='tbl-row'>
                <div className='tbl-cell'><div className='pulse-indicator'></div>{material.alternativeStock}</div>
                <div className='tbl-cell'>{typeof material.adhesiveCategory === 'object' && material?.adhesiveCategory?.name}</div>
              </div>
            </div>
          </div>
        </div>
    </FullScreenModal>
  )
}



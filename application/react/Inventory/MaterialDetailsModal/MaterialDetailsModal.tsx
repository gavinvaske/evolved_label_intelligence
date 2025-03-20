import './MaterialDetailsModal.scss'
import { FullScreenModal } from '../../_global/LargeModal/LargeModal.tsx';
import * as tableStyles from '@ui/styles/table.module.scss'

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
              <span>{material.inventory.sumOfLengthAdjustments}</span>
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
            <div className={tableStyles.tblPri}>
              <div className={tableStyles.tblHdr}>
                <div className={tableStyles.tblCell}><div className={tableStyles.pulseIndicator}></div>Name</div>
                <div className={tableStyles.tblCell}>Id</div>
                <div className={tableStyles.tblCell}>Vendor</div>
                <div className={tableStyles.tblCell}>Category</div>
                <div className={tableStyles.tblCell}>Thickness</div>
                <div className={tableStyles.tblCell}>Weight</div>
              </div>
              <div className={tableStyles.tblRow}>
                <div className={tableStyles.tblCell}><div className={tableStyles.pulseIndicator}></div>{material.name}</div>
                <div className={tableStyles.tblCell}>{material.materialId}</div>
                <div className={tableStyles.tblCell}>{typeof material.vendor === 'object' && material?.vendor?.name}</div>
                <div className={tableStyles.tblCell}>{typeof material.materialCategory === 'object' && material?.materialCategory?.name}</div>
                <div className={tableStyles.tblCell}>{material.thickness}</div>
                <div className={tableStyles.tblCell}>{material.weight}</div>
              </div>
            </div>
            <div className={tableStyles.tblPri}>
              <div className={tableStyles.tblHdr}>
                <div className={tableStyles.tblCell}><div className={tableStyles.pulseIndicator}></div>Freight Cost/Msi</div>
                <div className={tableStyles.tblCell}>Width</div>
                <div className={tableStyles.tblCell}>FaceColor</div>
                <div className={tableStyles.tblCell}>Adhesive</div>
                <div className={tableStyles.tblCell}>Quote Price/MSI</div>
                <div className={tableStyles.tblCell}></div>
              </div>
              <div className={tableStyles.tblRow}>
                <div className={tableStyles.tblCell}><div className={tableStyles.pulseIndicator}></div>{material.freightCostPerMsi}</div>
                <div className={tableStyles.tblCell}>{material.width}</div>
                <div className={tableStyles.tblCell}>{material.faceColor}</div>
                <div className={tableStyles.tblCell}>{material.adhesive}</div>
                <div className={tableStyles.tblCell}>{material.quotePricePerMsi}</div>
                <div className={tableStyles.tblCell}></div>
              </div>
            </div>
            <div className={tableStyles.tblPri}>
              <div className={tableStyles.tblHdr}>
                <div className={tableStyles.tblCell}><div className={tableStyles.pulseIndicator}></div>Length</div>
                <div className={tableStyles.tblCell}>Facesheet Weight/MSI</div>
                <div className={tableStyles.tblCell}>Adhesive Weight/MSI</div>
                <div className={tableStyles.tblCell}>Liner Weight/MSI</div>
                <div className={tableStyles.tblCell}>Total POs</div>
                <div className={tableStyles.tblCell}>costPerMsi</div>
              </div>
              <div className={tableStyles.tblRow}>
                <div className={tableStyles.tblCell}><div className={tableStyles.pulseIndicator}></div>{material.length}</div>
                <div className={tableStyles.tblCell}>{material.facesheetWeightPerMsi}</div>
                <div className={tableStyles.tblCell}>{material.adhesiveWeightPerMsi}</div>
                <div className={tableStyles.tblCell}>{material.linerWeightPerMsi}</div>
                <div className={tableStyles.tblCell}>{material.inventory.materialOrders.length || 0}</div>
                <div className={tableStyles.tblCell}>{material.costPerMsi}</div>
              </div>
            </div>
            <div className={tableStyles.tblPri}>
              <div className={tableStyles.tblHdr}>
                <div className={tableStyles.tblCell}><div className={tableStyles.pulseIndicator}></div>Alternative Stock</div>
                <div className={tableStyles.tblCell}>Adhesive Category</div>
              </div>
              <div className={tableStyles.tblRow}>
                <div className={tableStyles.tblCell}><div className={tableStyles.pulseIndicator}></div>{material.alternativeStock}</div>
                <div className={tableStyles.tblCell}>{typeof material.adhesiveCategory === 'object' && material?.adhesiveCategory?.name}</div>
              </div>
            </div>
          </div>
        </div>
    </FullScreenModal>
  )
}



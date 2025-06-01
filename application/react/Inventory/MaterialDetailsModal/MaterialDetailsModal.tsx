import { Modal } from '../../_global/Modal/Modal';
import * as tableStyles from '@ui/styles/table.module.scss'
import * as styles from './MaterialDetailsModal.module.scss'
import * as sharedStyles from '@ui/styles/shared.module.scss'

import { IMaterial } from '@shared/types/models';
import clsx from 'clsx';

type Props = {
  material: IMaterial,
  onClose: () => void
}

export const MaterialDetailsModal = (props: Props) => {
  const { material, onClose } = props;

  return (
    <Modal onClose={() => onClose()} size='fullscreen' data-test='material-details-modal'>

        <div className={styles.modalHeader}>
          <h1>{material.materialId} <span>{material.name}</span></h1>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.bodyHeader}>
            <div className={styles.box}>
              <h5>Stock Available:</h5>
              <span>{material.inventory.netLengthAvailable}</span>
              </div>
            <div className={styles.box}>
            <h5>Adjustments:</h5> 
              <span>{material.inventory.sumOfLengthAdjustments}</span>
            </div>
            <div className={styles.box}>
              <h5>On Order:</h5>
              <span> {material.inventory.lengthNotArrived}</span>
            </div>
          </div>
          <div className={styles.cardContainer}>
            <div className={styles.card}>
              <h5>Description:</h5> 
              <span>{material.description}</span>
            </div>
            <div className={styles.card}>
              <h5>When to use:</h5> 
              <span>{material.whenToUse}</span>
            </div>
          </div>
          <div className={clsx(styles.card, sharedStyles.fullWidth)}>
            <div className={styles.tblPri}>
              <div className={styles.tblHdr}>
                <div className={styles.tblCell}><div className={styles.pulseIndicator}></div>Name</div>
                <div className={styles.tblCell}>Id</div>
                <div className={styles.tblCell}>Vendor</div>
                <div className={styles.tblCell}>Category</div>
                <div className={styles.tblCell}>Thickness</div>
                <div className={styles.tblCell}>Weight</div>
              </div>
              <div className={styles.tblRow}>
                <div className={styles.tblCell}><div className={styles.pulseIndicator}></div>{material.name}</div>
                <div className={styles.tblCell}>{material.materialId}</div>
                <div className={styles.tblCell}>{typeof material.vendor === 'object' && material?.vendor?.name}</div>
                <div className={styles.tblCell}>{typeof material.materialCategory === 'object' && material?.materialCategory?.name}</div>
                <div className={styles.tblCell}>{material.thickness}</div>
                <div className={styles.tblCell}>{material.weight}</div>
              </div>
            </div>
            <div className={styles.tblPri}>
              <div className={styles.tblHdr}>
                <div className={styles.tblCell}><div className={styles.pulseIndicator}></div>Freight Cost/Msi</div>
                <div className={styles.tblCell}>Width</div>
                <div className={styles.tblCell}>FaceColor</div>
                <div className={styles.tblCell}>Adhesive</div>
                <div className={styles.tblCell}>Quote Price/MSI</div>
                <div className={styles.tblCell}></div>
              </div>
              <div className={styles.tblRow}>
                <div className={styles.tblCell}><div className={styles.pulseIndicator}></div>{material.freightCostPerMsi}</div>
                <div className={styles.tblCell}>{material.width}</div>
                <div className={styles.tblCell}>{material.faceColor}</div>
                <div className={styles.tblCell}>{material.adhesive}</div>
                <div className={styles.tblCell}>{material.quotePricePerMsi}</div>
                <div className={styles.tblCell}></div>
              </div>
            </div>
            <div className={styles.tblPri}>
              <div className={styles.tblHdr}>
                <div className={styles.tblCell}><div className={styles.pulseIndicator}></div>Length</div>
                <div className={styles.tblCell}>Facesheet Weight/MSI</div>
                <div className={styles.tblCell}>Adhesive Weight/MSI</div>
                <div className={styles.tblCell}>Liner Weight/MSI</div>
                <div className={styles.tblCell}>Total POs</div>
                <div className={styles.tblCell}>costPerMsi</div>
              </div>
              <div className={styles.tblRow}>
                <div className={styles.tblCell}><div className={styles.pulseIndicator}></div>{material.length}</div>
                <div className={styles.tblCell}>{material.facesheetWeightPerMsi}</div>
                <div className={styles.tblCell}>{material.adhesiveWeightPerMsi}</div>
                <div className={styles.tblCell}>{material.linerWeightPerMsi}</div>
                <div className={styles.tblCell}>{material.inventory.materialOrders.length || 0}</div>
                <div className={styles.tblCell}>{material.costPerMsi}</div>
              </div>
            </div>
            <div className={styles.tblPri}>
              <div className={styles.tblHdr}>
                <div className={styles.tblCell}><div className={styles.pulseIndicator}></div>Alternative Stock</div>
                <div className={styles.tblCell}>Adhesive Category</div>
              </div>
              <div className={styles.tblRow}>
                <div className={styles.tblCell}><div className={styles.pulseIndicator}></div>{material.alternativeStock}</div>
                <div className={styles.tblCell}>{typeof material.adhesiveCategory === 'object' && material?.adhesiveCategory?.name}</div>
              </div>
            </div>
          </div>
        </div>
    </Modal>
  )
}



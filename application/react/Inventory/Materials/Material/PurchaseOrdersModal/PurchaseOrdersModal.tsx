import { IMaterial, IMaterialOrder } from "@shared/types/models";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getMaterialOrdersByIds } from "../../../../_queries/materialOrder";
import { LoadingIndicator } from "../../../../_global/LoadingIndicator/LoadingIndicator";
import { useErrorMessage } from "../../../../_hooks/useErrorMessage";
import { getDayMonthYear } from "../../../../_helperFunctions/dateTime";
import { MdOutlinePreview } from "react-icons/md";
import { IoCreateOutline } from "react-icons/io5";
import { Modal } from "../../../../_global/Modal/Modal";

type ModalProps = {
  material: IMaterial,
  onClose: () => void
}

export const PurchaseOrderModal = (props: ModalProps) => {
  const { material, onClose } = props;
  const navigate = useNavigate();

  return (
    <Modal onClose={() => onClose()}>
      <div className='modal-content'>
        <div className='title-wrapper'>
          <h4>Purchase orders: {material.materialId}</h4>
          <i>
            <IoCreateOutline
              title='Create New Material Order'
              size={20}
              onClick={() => navigate('/react-ui/forms/material-order', {
                state: {
                  material: material._id
                }
              })}
            />
          </i>
          <i>
            <MdOutlinePreview
              title='View All Material Orders'
              size={20}
              onClick={() => navigate('/react-ui/tables/material-order')}
            />
          </i>
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

function renderPurchaseOrders(material: IMaterial) {
  const navigate = useNavigate();
  const { isPending, isFetching, data: materialOrders, isError, error } = useQuery<IMaterialOrder[]>({
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
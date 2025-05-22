import { RowActionItem, RowActions } from '../../../_global/Table/RowActions/RowActions';
import { MongooseId } from "@shared/types/typeAliases.ts";
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useErrorMessage } from '../../../_hooks/useErrorMessage';
import { Row } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query'
import { useSuccessMessage } from '../../../_hooks/useSuccessMessage';
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import { IDeliveryMethod } from '@shared/types/models.ts';
import { ConfirmationResult } from '../../../_global/Modal/useConfirmation';
type Props = {
  row: Row<IDeliveryMethod>,
  confirmation: ConfirmationResult
}

export const DeliveryMethodRowActions = (props: Props) => {
  const { row, confirmation } = props;
  const { _id: mongooseObjectId, name: deliveryMethodName } = row.original as IDeliveryMethod;
  const { showConfirmation } = confirmation;

  const navigate = useNavigate();
  const queryClient = useQueryClient()

  const onDeleteClicked = async (mongooseObjectId: MongooseId) => {
    const confirmed = await showConfirmation({
      title: 'Delete Delivery Method?',
      message: `Are you sure you want to delete this delivery method? This action cannot be undone. (Delivery Method Name: "${deliveryMethodName}")`,
      confirmText: 'Delete',
    });

    if (!confirmed) return;

    axios.delete(`/delivery-methods/${mongooseObjectId}`)
      .then((_: AxiosResponse) => {
        queryClient.invalidateQueries({ queryKey: ['get-delivery-methods'] })
        useSuccessMessage('Deletion was successful')
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }

  const onEditClicked = (mongooseObjectId: MongooseId) => {
    navigate(`/react-ui/forms/delivery-method/${mongooseObjectId}`)
  }

  return (
    <RowActions>
      <RowActionItem text='Edit' Icon={IoCreateOutline} onClick={() => onEditClicked(mongooseObjectId)} />
      <RowActionItem text='Delete' Icon={IoTrashOutline} onClick={() => onDeleteClicked(mongooseObjectId)} />
    </RowActions>
  )
}
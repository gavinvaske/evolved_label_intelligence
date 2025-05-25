import { Row } from '@tanstack/react-table';
import { RowActionItem, RowActions } from '../../../_global/Table/RowActions/RowActions';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../../_hooks/useErrorMessage';
import { IMaterialOrder } from '@shared/types/models';
import { MongooseId } from '@shared/types/typeAliases';
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import { ConfirmationResult } from '../../../_global/Modal/useConfirmation';
type Props = {
  row: Row<IMaterialOrder>
  confirmation: ConfirmationResult
}

export const MaterialOrderRowActions = (props: Props) => {
  const { row, confirmation } = props;
  const { _id: mongooseObjectId, purchaseOrderNumber } = row.original;
  const { showConfirmation } = confirmation;

  const navigate = useNavigate();
  const queryClient = useQueryClient()

  const onDeleteClicked = async (mongooseObjectId: MongooseId) => {
    const confirmed = await showConfirmation({
      title: 'Delete Material Order',
      message: (<span>Are you sure you want to delete "<strong>{purchaseOrderNumber}</strong>"? <br /> This action cannot be undone.</span>),
      confirmText: 'Delete',
    });

    if (!confirmed) return;

    axios.delete(`/material-orders/${mongooseObjectId}`)
      .then((_: AxiosResponse) => {
        queryClient.invalidateQueries({ queryKey: ['get-material-orders'] })
        useSuccessMessage('Deletion was successful')
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }

  const onEditClicked = (mongooseObjectId: MongooseId) => {
    navigate(`/react-ui/forms/material-order/${mongooseObjectId}`)
  }

  return (
    <RowActions>
      <RowActionItem text='Edit' Icon={IoCreateOutline} onClick={() => onEditClicked(mongooseObjectId)} />
      <RowActionItem text='Delete' Icon={IoTrashOutline} onClick={() => onDeleteClicked(mongooseObjectId)} />
    </RowActions>
  )
}
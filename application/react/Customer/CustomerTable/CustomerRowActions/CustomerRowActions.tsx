import { RowActionItem, RowActions } from '../../../_global/Table/RowActions/RowActions';
import { Row } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom'
import { MongooseId } from "@shared/types/typeAliases.ts";
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useErrorMessage } from '../../../_hooks/useErrorMessage';
import { useQueryClient } from '@tanstack/react-query';
import { useSuccessMessage } from '../../../_hooks/useSuccessMessage';
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import { ICustomer } from '@shared/types/models.ts';
import { ConfirmationResult } from '../../../_global/Modal/useConfirmation';
type Props = {
  row: Row<ICustomer>
  confirmation: ConfirmationResult;
}

export const CustomerRowActions = ({ row, confirmation }: Props) => {
  const { _id : mongooseObjectId, customerId } = row.original;
  const { showConfirmation } = confirmation;

  const navigate = useNavigate();
  const queryClient = useQueryClient()

  const onDeleteClicked = async (mongooseObjectId: MongooseId) => {
    const confirmed = await showConfirmation({
      title: 'Delete Customer?',
      message: `Are you sure you want to delete this customer? This action cannot be undone. (Customer ID: "${customerId}")`,
      confirmText: 'Delete',
    });

    if (!confirmed) return;

    axios.delete(`/customers/${mongooseObjectId}`)
      .then((_ : AxiosResponse) => {
        queryClient.invalidateQueries({ queryKey: ['get-customers']})
        useSuccessMessage('Deletion was successful')
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }

  const onEditClicked = (mongooseObjectId: MongooseId) => {
    navigate(`/react-ui/forms/customer/${mongooseObjectId}`)
  }

  return (
    <RowActions>
      <RowActionItem text='Edit' Icon={IoCreateOutline} onClick={() => onEditClicked(mongooseObjectId)} />
      <RowActionItem text='Delete' Icon={IoTrashOutline} onClick={() => onDeleteClicked(mongooseObjectId)} />
    </RowActions>
  )
}
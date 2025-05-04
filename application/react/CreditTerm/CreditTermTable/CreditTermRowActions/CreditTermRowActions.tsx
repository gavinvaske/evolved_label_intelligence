import { RowActionItem, RowActions } from '../../../_global/Table/RowActions/RowActions';
import { Row } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom'
import { MongooseId } from "@shared/types/typeAliases.ts";
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useErrorMessage } from '../../../_hooks/useErrorMessage';
import { useQueryClient } from '@tanstack/react-query';
import { useSuccessMessage } from '../../../_hooks/useSuccessMessage';
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import { ICreditTerm } from '@shared/types/models.ts';
import { ConfirmationResult } from '../../../_global/Modal/useConfirmation';

type Props = {
  row: Row<ICreditTerm>
  confirmation: ConfirmationResult;
}

export const CreditTermRowActions = (props: Props) => {
  const { row, confirmation } = props;
  const { _id: mongooseObjectId } = row.original;
  const { showConfirmation } = confirmation;

  const navigate = useNavigate();
  const queryClient = useQueryClient()

  const onDeleteClicked = async (mongooseObjectId: MongooseId) => {
    const confirmed = await showConfirmation({
      title: 'Delete Credit Term',
      message: 'Are you sure you want to delete this credit term? This action cannot be undone.',
      confirmText: 'Delete',
    });

    if (!confirmed) return;

    axios.delete(`/credit-terms/${mongooseObjectId}`)
      .then((_ : AxiosResponse) => {
        queryClient.invalidateQueries({ queryKey: ['get-credit-terms']})
        useSuccessMessage('Deletion was successful')
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }

  const onEditClicked = (mongooseObjectId: MongooseId) => {
    navigate(`/react-ui/forms/credit-term/${mongooseObjectId}`)
  }

  return (
    <RowActions>
      <RowActionItem text='Edit' Icon={IoCreateOutline} onClick={() => onEditClicked(mongooseObjectId)} />
      <RowActionItem text='Delete' Icon={IoTrashOutline} onClick={() => onDeleteClicked(mongooseObjectId)} />
    </RowActions>
  )
}
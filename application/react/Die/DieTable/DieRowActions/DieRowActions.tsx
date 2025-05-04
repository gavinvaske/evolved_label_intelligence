import { RowActionItem, RowActions } from '../../../_global/Table/RowActions/RowActions';
import { Row } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../../_hooks/useErrorMessage';
import { GET_DIES_QUERY_KEY } from '../DieTable';
import { IoCreateOutline } from "react-icons/io5";
import { IoTrashOutline } from "react-icons/io5";
import { IDie } from '@shared/types/models';
import { MongooseId } from '@shared/types/typeAliases';
import { ConfirmationResult } from '../../../_global/Modal/useConfirmation';

type Props = {
  row: Row<IDie>
  confirmation: ConfirmationResult
}

export const DieRowActions = (props: Props) => {
  const { row, confirmation } = props;
  const { _id: mongooseObjectId } = row.original;
  const { showConfirmation } = confirmation;

  const navigate = useNavigate();
  const queryClient = useQueryClient()

  const onEditClicked = (mongooseObjectId: MongooseId) => {
    navigate(`/react-ui/forms/die/${mongooseObjectId}`)
  }

  const onDeleteClicked = async (mongooseObjectId: MongooseId) => {
    const confirmed = await showConfirmation({
      title: 'Delete Die',
      message: 'Are you sure you want to delete this die? This action cannot be undone.',
      confirmText: 'Delete',
    });

    if (!confirmed) return;

    axios.delete(`/dies/${mongooseObjectId}`)
      .then((_: AxiosResponse) => {
        queryClient.invalidateQueries({ queryKey: [GET_DIES_QUERY_KEY] })
        useSuccessMessage('Deletion was successful')
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }

  return (
    <RowActions>
      <RowActionItem text='Edit' Icon={IoCreateOutline} onClick={() => onEditClicked(mongooseObjectId)} />
      <RowActionItem text='Delete' Icon={IoTrashOutline} onClick={() => onDeleteClicked(mongooseObjectId)} />
    </RowActions>
  )
}
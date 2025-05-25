import { Row } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../../_hooks/useErrorMessage';
import { RowActionItem, RowActions } from '../../../_global/Table/RowActions/RowActions';
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import { MongooseIdStr } from '@shared/types/typeAliases';
import { IMaterialCategory } from '@shared/types/models';
import { ConfirmationResult } from '../../../_global/Modal/useConfirmation';
type Props = {
  row: Row<IMaterialCategory>
  confirmation: ConfirmationResult
}

export const MaterialCategoryRowActions = (props: Props) => {
  const { row, confirmation } = props;
  const { _id: mongooseObjectId, name } = row.original;
  const { showConfirmation } = confirmation;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const onDeleteClicked = async (mongooseObjectId: MongooseIdStr) => {
    const confirmed = await showConfirmation({
      title: 'Delete Material Category',
      message: (<span>Are you sure you want to delete "<strong>{name}</strong>"? <br /> This action cannot be undone.</span>),
      confirmText: 'Delete',
    });

    if (!confirmed) return;

    axios.delete(`/material-categories/${mongooseObjectId}`)
      .then((_: AxiosResponse) => {
        queryClient.invalidateQueries({ queryKey: ['get-material-categories'] })
        useSuccessMessage('Deletion was successful')
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }

  const onEditClicked = (mongooseObjectId: MongooseIdStr) => {
    navigate(`/react-ui/forms/material-category/${mongooseObjectId}`)
  }

  return (
    <RowActions>
      <RowActionItem text='Edit' Icon={IoCreateOutline} onClick={() => onEditClicked(mongooseObjectId as MongooseIdStr)} />
      <RowActionItem text='Delete' Icon={IoTrashOutline} onClick={() => onDeleteClicked(mongooseObjectId as MongooseIdStr)} />
    </RowActions>
  )
}
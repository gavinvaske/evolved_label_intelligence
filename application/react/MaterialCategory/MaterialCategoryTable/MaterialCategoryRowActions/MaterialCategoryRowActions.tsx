import './MaterialCategoryRowActions.scss';
import { Row } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../../_hooks/useErrorMessage';
import { RowActionItem, RowActions } from '../../../_global/Table/RowActions/RowActions';
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import { MongooseIdStr } from '@shared/types/typeAliases';

type Props = {
  row: Row<any>
}

export const MaterialCategoryRowActions = (props: Props) => {
  const { row } = props;
  const { _id: mongooseObjectId } = row.original;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const onDeleteClicked = (mongooseObjectId: MongooseIdStr) => {
    alert('@TODO Storm: Add a confirmation modal before deletion?')
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
      <RowActionItem text='Edit' Icon={IoCreateOutline} onClick={() => onEditClicked(mongooseObjectId)} />
      <RowActionItem text='Delete' Icon={IoTrashOutline} onClick={() => onDeleteClicked(mongooseObjectId)} />
    </RowActions>
  )
}
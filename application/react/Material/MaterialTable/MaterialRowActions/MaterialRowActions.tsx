import { RowActionItem, RowActions } from '../../../_global/Table/RowActions/RowActions';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { MongooseId } from "@shared/types/typeAliases.ts";
import { useNavigate } from 'react-router-dom';
import { useErrorMessage } from '../../../_hooks/useErrorMessage';
import { Row } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { useSuccessMessage } from '../../../_hooks/useSuccessMessage';
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import { IMaterial } from '@shared/types/models.ts';
import { ConfirmationResult } from '../../../_global/Modal/useConfirmation';
type Props = {
  row: Row<IMaterial>
  confirmation: ConfirmationResult
}

export const MaterialRowActions = (props: Props) => {
  const { row, confirmation } = props
  const { _id: mongooseObjectId, name } = row.original;
  const { showConfirmation } = confirmation;

  const navigate = useNavigate();
  const queryClient = useQueryClient()

  const onDeleteClicked = async (mongooseObjectId: MongooseId) => {
    const confirmed = await showConfirmation({
      title: 'Delete Material',
      message: (<span>Are you sure you want to delete "<strong>{name}</strong>"? <br /> This action cannot be undone.</span>),
      confirmText: 'Delete',
    });

    if (!confirmed) return;

    axios.delete(`/materials/${mongooseObjectId}`)
      .then((_: AxiosResponse) => {
        queryClient.invalidateQueries({ queryKey: ['get-materials'] })
        useSuccessMessage('Deletion was successful')
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }

  const onEditClicked = (mongooseObjectId: MongooseId) => {
    navigate(`/react-ui/forms/material/${mongooseObjectId}`)
  }

  return (
    <RowActions>
      <RowActionItem text='Edit' Icon={IoCreateOutline} onClick={() => onEditClicked(mongooseObjectId)} />
      <RowActionItem text='Delete' Icon={IoTrashOutline} onClick={() => onDeleteClicked(mongooseObjectId)} />
    </RowActions>
  )
}
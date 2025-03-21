import React from 'react'
import './MaterialLengthAdjustmentRowActions.scss'
import { Row } from '@tanstack/react-table';
import { MongooseId } from "@ui/types/typeAliases";
import { RowActionItem, RowActions } from '../../../_global/Table/RowActions/RowActions';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { useSuccessMessage } from '../../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../../_hooks/useErrorMessage';
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';

type TODO = any;

type Props = {
  row: Row<TODO>
}

export const MaterialLengthAdjustmentRowActions = (props: Props) => {
  const { row }: { row: any } = props;
  const { _id : mongooseObjectId } = row.original;

  const navigate = useNavigate();
  const queryClient = useQueryClient()


  const onDeleteClicked = (mongooseObjectId: MongooseId) => {
    alert('@TODO Storm: Add a confirmation modal before deletion?')
    axios.delete(`/material-length-adjustments/${mongooseObjectId}`)
      .then((_ : AxiosResponse) => {
        queryClient.invalidateQueries({ queryKey: ['get-material-length-adjustments']})
        useSuccessMessage('Deletion was successful')
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }

  const onEditClicked = (mongooseObjectId: MongooseId) => {
    navigate(`/react-ui/forms/material-length-adjustment/${mongooseObjectId}`)
  }

  return (
    <RowActions>
      <RowActionItem text='Edit' Icon={IoCreateOutline} onClick={() => onEditClicked(mongooseObjectId)} />
      <RowActionItem text='Delete' Icon={IoTrashOutline} onClick={() => onDeleteClicked(mongooseObjectId)} />
    </RowActions>
  )
};
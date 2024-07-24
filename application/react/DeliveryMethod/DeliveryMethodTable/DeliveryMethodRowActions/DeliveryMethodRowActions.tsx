import React from 'react'
import './DeliveryMethodRowActions.scss'
import { RowActions } from '../../../_global/Table/RowActions/RowActions';
import { MongooseId } from '../../../_types/typeAliases';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useErrorMessage } from '../../../_hooks/useErrorMessage';
import { Row } from '@tanstack/react-table';
import { DeliveryMethod } from '../../../_types/databasemodels/deliveryMethod.ts';
import { useQueryClient } from '@tanstack/react-query'
import { useSuccessMessage } from '../../../_hooks/useSuccessMessage';

type Props = {
  row: Row<DeliveryMethod>
}

export const DeliveryMethodRowActions = (props: Props) => {
  const { row }: { row: any } = props;
  const { _id : mongooseObjectId } = row.original;

  const navigate = useNavigate();
  const queryClient = useQueryClient()

  const onDeleteClicked = (mongooseObjectId: MongooseId) => {
    alert('@TODO Storm: Add a confirmation modal before deletion?')
    axios.delete(`/delivery-methods/${mongooseObjectId}`)
      .then((_ : AxiosResponse) => {
        queryClient.invalidateQueries({ queryKey: ['get-delivery-methods']})
        useSuccessMessage('Deletion was successful')
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }

  const onEditClicked = (mongooseObjectId: MongooseId) => {
    navigate(`/react-ui/forms/delivery-method/${mongooseObjectId}`)
  }

  return (
    <RowActions>
      <div onClick={() => onEditClicked(mongooseObjectId)}>Edit</div>
      <div onClick={() => onDeleteClicked(mongooseObjectId)}>Delete</div>
    </RowActions>
  )
}
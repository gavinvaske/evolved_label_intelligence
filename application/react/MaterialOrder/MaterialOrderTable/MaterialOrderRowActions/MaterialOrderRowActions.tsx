import React from 'react';
import { Row } from '@tanstack/react-table';
import { MaterialOrder } from '../../../_types/databaseModels/materialOrder'
import './MaterialOrderRowActions.scss'
import { RowActions } from '../../../_global/Table/RowActions/RowActions';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { MongooseId } from "@ui/types/typeAliases";
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../../_hooks/useErrorMessage';

type Props = {
  row: Row<MaterialOrder>
}

export const MaterialOrderRowActions = (props: Props) => {
  const { row } = props;
  const { _id : mongooseObjectId } = row.original;

  const navigate = useNavigate();
  const queryClient = useQueryClient()

  const onDeleteClicked = (mongooseObjectId: MongooseId) => {
    alert('@TODO Storm: Add a confirmation modal before deletion?')
    axios.delete(`/material-orders/${mongooseObjectId}`)
      .then((_ : AxiosResponse) => {
        queryClient.invalidateQueries({ queryKey: ['get-material-orders']})
        useSuccessMessage('Deletion was successful')
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }

  const onEditClicked = (mongooseObjectId: MongooseId) => {
    navigate(`/react-ui/forms/material-order/${mongooseObjectId}`)
  }

  return (
    <RowActions>
      <div className='dropdown-option' onClick={() => onEditClicked(mongooseObjectId)}><i className="fa-regular fa-pen-to-square"></i>Edit</div>
      <div className='dropdown-option' onClick={() => onDeleteClicked(mongooseObjectId)}><i className="fa-regular fa-trash"></i>Delete</div>
    </RowActions>
  )
}
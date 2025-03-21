import React from 'react';
import { RowActionItem, RowActions } from '../../../_global/Table/RowActions/RowActions';
import { IBaseProduct } from '../../../../api/models/baseProduct'
import { Row } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import './ProductRowActions.scss';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { GET_PRODUCTS_QUERY_KEY } from '../ProductTable';
import { useSuccessMessage } from '../../../_hooks/useSuccessMessage'
import { useErrorMessage } from '../../../_hooks/useErrorMessage';
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';

type Props = {
  row: Row<IBaseProduct>
}

export const ProductRowActions = (props: Props) => {
  const { row } = props;
  const { _id : mongooseObjectId } = row.original;

  const navigate = useNavigate();
  const queryClient = useQueryClient()

  const onEditClicked = (mongooseObjectId) => {
    navigate(`/react-ui/forms/product/${mongooseObjectId}`)
  }
  const onDeleteClicked = (mongooseObjectId) => {
    alert('@TODO Storm: Add a confirmation modal before deletion?')
    axios.delete(`/products/${mongooseObjectId}`)
      .then((_ : AxiosResponse) => {
        queryClient.invalidateQueries({ queryKey: [GET_PRODUCTS_QUERY_KEY]})
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
};
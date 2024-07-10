import React from 'react'
import './CreditTermRowActions.scss'
import { RowActions } from '../../../_global/Table/RowActions/RowActions';
import { Row, RowData } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom'
import { MongooseId } from '../../../_types/typeAliases';
import axios, { AxiosError, AxiosResponse } from 'axios';
import flashMessageStore from '../../../stores/flashMessageStore';
import { useErrorHandler } from '../../../_hooks/useErrorHandler';

export const CreditTermRowActions = (props) => {
  const { row }: { row: Row<RowData> } = props;
  const { _id : mongooseObjectId } = row.original as any;

  const navigate = useNavigate();

  const onDeleteClicked = (mongooseObjectId: MongooseId) => {
    alert('@TODO Storm: Add a confirmation modal before deletion?')
    axios.delete(`/credit-terms/${mongooseObjectId}`)
      .then((_ : AxiosResponse) => flashMessageStore.addSuccessMessage('Deletion was successfully'))
      .catch((error: AxiosError) => useErrorHandler(error))
  }

  const onEditClicked = (mongooseObjectId: MongooseId) => {
    alert('TODO @Gavin: Enable editing via CreditTermForm')
    navigate(`/react-ui/forms/credit-term/${mongooseObjectId}`)
  }

  return (
    <RowActions>
      <div className='dropdown-option' onClick={() => onEditClicked(mongooseObjectId)}><i className="fa-regular fa-pen-to-square"></i>Edit</div>
      <div className='dropdown-option' onClick={() => onDeleteClicked(mongooseObjectId)}><i className="fa-regular fa-trash"></i>Delete</div>
    </RowActions>
  )
}
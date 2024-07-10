import React from 'react';
import './MaterialRowActions.scss';
import { RowActions } from '../../../_global/Table/RowActions/RowActions';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { MongooseId } from '../../../_types/typeAliases';
import flashMessageStore from '../../../stores/flashMessageStore';
import { useNavigate } from 'react-router-dom';
import { useErrorHandler } from '../../../_hooks/useErrorHandler';

type Props = {
  row: any  // TODO: Type this
}

export const MaterialRowActions = (props: Props) => {
  const { row } = props
  const { _id : mongooseObjectId } = row.original as any;

  const navigate = useNavigate();

  const onDeleteClicked = (mongooseObjectId: MongooseId) => {
    alert('@TODO Storm: Add a confirmation modal before deletion?')
    axios.delete(`/materials/${mongooseObjectId}`)
      .then((_ : AxiosResponse) => flashMessageStore.addSuccessMessage('Deletion was successfully'))
      .catch((error: AxiosError) => useErrorHandler(error))
  }

  const onEditClicked = (mongooseObjectId: MongooseId) => {
    navigate(`/react-ui/forms/material/${mongooseObjectId}`)
  }

  return (
    <RowActions>
      <div onClick={() => onEditClicked(mongooseObjectId)}>Edit</div>
      <div onClick={() => onDeleteClicked(mongooseObjectId)}>Delete</div>
    </RowActions>
  )
}
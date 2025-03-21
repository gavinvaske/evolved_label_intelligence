import React from 'react'
import './QuoteRowActions'
import { Row } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { MongooseId } from "@ui/types/typeAliases";
import { RowActionItem, RowActions } from '../../../_global/Table/RowActions/RowActions';
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';

type TODO = any;

type Props = {
  row: Row<TODO>
}

export const QuoteRowActions = (props: Props) => {
  const { row }: { row: any } = props;
  const { _id : mongooseObjectId } = row.original;

  // const navigate = useNavigate();
  // const queryClient = useQueryClient()

  const onViewClicked = (mongooseObjectId: MongooseId) => {
    alert("TODO: Implement view logic")
  }

  const onDeleteClicked = (mongooseObjectId: MongooseId) => {
    alert('@TODO Storm: Add a confirmation modal before deletion?')
    alert("TODO: Implement deletion logic")
  }

  const onEditClicked = (mongooseObjectId: MongooseId) => {
    alert("TODO: Implement edit logic")
  }

  return (
    <RowActions>
      <RowActionItem text='View' onClick={() => onViewClicked(mongooseObjectId)} />
      <RowActionItem text='Edit' Icon={IoCreateOutline} onClick={() => onEditClicked(mongooseObjectId)} />
      <RowActionItem text='Delete' Icon={IoTrashOutline} onClick={() => onDeleteClicked(mongooseObjectId)} />
    </RowActions>
  )
};

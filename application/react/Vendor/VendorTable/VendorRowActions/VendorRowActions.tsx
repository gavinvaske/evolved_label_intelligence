import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../../_hooks/useErrorMessage';
import { Row } from '@tanstack/react-table';
import { RowActionItem, RowActions } from '../../../_global/Table/RowActions/RowActions';
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import { MongooseId } from '@shared/types/typeAliases';
import { IVendor } from '@shared/types/models';
import { ConfirmationResult } from '../../../_global/Modal/useConfirmation';

type Props = {
  row: Row<IVendor>
  confirmation: ConfirmationResult
}

export const VendorRowActions = (props: Props) => {
  const { row, confirmation } = props;
  const { _id: mongooseObjectId } = row.original;
  const { showConfirmation } = confirmation;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const onDeleteClicked = async (mongooseObjectId: MongooseId) => {
    const confirmed = await showConfirmation({
      title: 'Delete Vendor',
      message: 'Are you sure you want to delete this vendor? This action cannot be undone.',
      confirmText: 'Delete',
    });

    if (!confirmed) return;

    axios.delete(`/vendors/${mongooseObjectId}`)
      .then((_: AxiosResponse) => {
        queryClient.invalidateQueries({ queryKey: ['get-vendors'] })
        useSuccessMessage('Deletion was successful')
      })
      .catch((error: AxiosError) => useErrorMessage(error))
  }

  const onEditClicked = (mongooseObjectId: MongooseId) => {
    navigate(`/react-ui/forms/vendor/${mongooseObjectId}`)
  }

  return (
    <RowActions>
      <RowActionItem text='Edit' Icon={IoCreateOutline} onClick={() => onEditClicked(mongooseObjectId)} />
      <RowActionItem text='Delete' Icon={IoTrashOutline} onClick={() => onDeleteClicked(mongooseObjectId)} />
    </RowActions>
  )
}
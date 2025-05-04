import { AdhesiveCategory } from '../../../_types/databasemodels/adhesiveCategory.ts';
import { Row } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { MongooseId } from "@shared/types/typeAliases.ts";
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSuccessMessage } from '../../../_hooks/useSuccessMessage';
import { useErrorMessage } from '../../../_hooks/useErrorMessage';
import { RowActionItem, RowActions } from '../../../_global/Table/RowActions/RowActions';
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import { ConfirmationResult } from '../../../_global/Modal/useConfirmation';

type Props = {
  row: Row<AdhesiveCategory>;
  confirmation: ConfirmationResult;
}

export const AdhesiveCategoryRowActions = (props: Props) => {
  const { row, confirmation } = props;
  const { _id: mongooseObjectId } = row.original;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showConfirmation } = confirmation;

  const onDeleteClicked = async (mongooseObjectId: MongooseId) => {
    const confirmed = await showConfirmation({
      title: 'Delete Adhesive Category',
      message: 'Are you sure you want to delete this adhesive category? This action cannot be undone.',
      confirmText: 'Delete',
    });

    if (!confirmed) return;

    axios.delete(`/adhesive-categories/${mongooseObjectId}`)
      .then((_: AxiosResponse) => {
        queryClient.invalidateQueries({ queryKey: ['get-adhesive-categories'] });
        useSuccessMessage('Deletion was successful');
      })
      .catch((error: AxiosError) => useErrorMessage(error));
  };

  const onEditClicked = (mongooseObjectId: MongooseId) => {
    navigate(`/react-ui/forms/adhesive-category/${mongooseObjectId}`);
  };

  return (
    <RowActions>
      <RowActionItem text='Edit' Icon={IoCreateOutline} onClick={() => onEditClicked(mongooseObjectId)} />
      <RowActionItem text='Delete' Icon={IoTrashOutline} onClick={() => onDeleteClicked(mongooseObjectId)} />
    </RowActions>
  );
};
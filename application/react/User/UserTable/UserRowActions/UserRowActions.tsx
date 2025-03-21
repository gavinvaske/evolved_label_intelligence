import './UserRowActions.scss'
import { RowActionItem, RowActions } from '../../../_global/Table/RowActions/RowActions'
import { Row } from '@tanstack/react-table'
import { MongooseIdStr } from '@shared/types/typeAliases'
import { IUser } from '@shared/types/models'
import axios from 'axios'
import { AuthRoles } from '@shared/enums/auth'
import { useErrorMessage } from '../../../_hooks/useErrorMessage'
import { useSuccessMessage } from '../../../_hooks/useSuccessMessage'
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5'

type Props = {
  row: Row<IUser>
}

export const UserRowActions = (props: Props) => {
  const { row } = props;
  const { _id : mongooseObjectId, authRoles = [] } = row.original;

  const grantRoleToUser = (mongooseObjectId: MongooseIdStr, authRoleToAdd: AuthRoles) => {
    console.log('UserRowActions', row.original)
    axios.put(`/users/${mongooseObjectId}/auth-roles`, {
      authRoles: [
        ...(authRoles || []),
        authRoleToAdd
      ]
    })
    .then(() => useSuccessMessage('User granted admin privileges successfully.'))
    .catch((error) => useErrorMessage(error))
  }

  const removeRoleFromUser = (mongooseObjectId: MongooseIdStr, authRoleToRemove: AuthRoles) => {
    axios.put(`/users/${mongooseObjectId}/auth-roles`, {
      authRoles: authRoles.filter((role) => role!== authRoleToRemove)
    })
   .then(() => useSuccessMessage('User removed admin privileges successfully.'))
   .catch((error) => useErrorMessage(error))
  }

  return (
    <RowActions>
      <RowActionItem text='Grant Admin' Icon={IoCreateOutline} onClick={() => grantRoleToUser(mongooseObjectId.toString(), AuthRoles.ADMIN)} />
      <RowActionItem text='Grant User' Icon={IoCreateOutline} onClick={() => grantRoleToUser(mongooseObjectId.toString(), AuthRoles.USER)} />
      <RowActionItem text='Remove Admin' Icon={IoTrashOutline} onClick={() => removeRoleFromUser(mongooseObjectId.toString(), AuthRoles.ADMIN)} />
      <RowActionItem text='Remove User' Icon={IoTrashOutline} onClick={() => removeRoleFromUser(mongooseObjectId.toString(), AuthRoles.USER)} />
    </RowActions>
  )
}
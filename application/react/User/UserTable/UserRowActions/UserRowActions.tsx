import './UserRowActions.scss'
import { RowActions } from '../../../_global/Table/RowActions/RowActions'
import { Row } from '@tanstack/react-table'
import { MongooseIdStr } from '@shared/types/typeAliases'
import { IUser } from '@shared/types/models'
import axios from 'axios'
import { AuthRoles } from '@shared/enums/auth'
import { useErrorMessage } from '../../../_hooks/useErrorMessage'
import { useSuccessMessage } from '../../../_hooks/useSuccessMessage'

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
      <div className='dropdown-option' onClick={() => grantRoleToUser(mongooseObjectId.toString(), AuthRoles.ADMIN)}><i className="fa-regular fa-pen-to-square"></i>Grant Admin</div>
      <div className='dropdown-option' onClick={() => grantRoleToUser(mongooseObjectId.toString(), AuthRoles.USER)}><i className="fa-regular fa-pen-to-square"></i>Grant User</div>
      <div className='dropdown-option' onClick={() => removeRoleFromUser(mongooseObjectId.toString(), AuthRoles.ADMIN)}><i className="fa-regular fa-pen-to-square"></i>Remove Admin</div>
      <div className='dropdown-option' onClick={() => removeRoleFromUser(mongooseObjectId.toString(), AuthRoles.USER)}><i className="fa-regular fa-pen-to-square"></i>Remove User</div>
    </RowActions>
  )
}
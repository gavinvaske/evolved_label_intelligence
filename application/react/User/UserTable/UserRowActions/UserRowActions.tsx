import './UserRowActions.scss'
import { RowActions } from '../../../_global/Table/RowActions/RowActions'
import { Row } from '@tanstack/react-table'
import { MongooseIdStr } from '@shared/types/typeAliases'
import { IUser } from '@shared/types/models'
import { useNavigate } from 'react-router-dom'

type Props = {
  row: Row<IUser>
}

export const UserRowActions = (props: Props) => {
  const { row } = props;
  const { _id : mongooseObjectId } = row.original;
  const navigate = useNavigate();

  const onUpdateAuthRoles = (mongooseObjectId: MongooseIdStr) => {
    navigate(`/react-ui/forms/user/auth-roles/${mongooseObjectId}`)
  }

  return (
    <RowActions>
      <div className='dropdown-option' onClick={() => onUpdateAuthRoles(mongooseObjectId.toString())}><i className="fa-regular fa-pen-to-square"></i>Edit Roles</div>
    </RowActions>
  )
}
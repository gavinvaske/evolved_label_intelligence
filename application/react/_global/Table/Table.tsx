import { PropsWithChildren } from 'react'
import './Table.scss'

type Props = {
  id?: string
}

export const Table = (props: PropsWithChildren<Props>) => {
  const { children, id } = props;

  return (
    <div className='primary-table' id={id}>
      {children}
    </div>
  )
}
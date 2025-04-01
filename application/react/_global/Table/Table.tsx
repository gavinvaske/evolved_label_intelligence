import { PropsWithChildren } from 'react'

type Props = {
  id?: string
}

export const Table = (props: PropsWithChildren<Props>) => {
  const { children, id } = props;

  return (
    <div id={id}>
      {children}
    </div>
  )
}
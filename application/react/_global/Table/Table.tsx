import { PropsWithChildren } from 'react'

type Props = {
  id?: string
}

export const Table = (props: PropsWithChildren<Props>) => {
  const { children, id, ...rest } = props;

  return (
    <div id={id} {...rest}>
      {children}
    </div>
  )
}
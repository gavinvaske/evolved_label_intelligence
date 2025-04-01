
import { Row as RowType, RowData, flexRender } from '@tanstack/react-table'
import * as styles from './Row.module.scss'
import clsx from 'clsx';

const Row = (props) => {
  const { row }: { row: RowType<RowData> } = props;

  return (
    <div className={clsx(styles.row, styles.rowBody)} key={row.id}>
      {row.getVisibleCells().map(cell => (
        <div className={styles.rowCell} key={cell.id}>
          {
            flexRender(
              cell.column.columnDef.cell,
              cell.getContext()
            )
          }
        </div>
      ))}
    </div>
  )
}

export default Row
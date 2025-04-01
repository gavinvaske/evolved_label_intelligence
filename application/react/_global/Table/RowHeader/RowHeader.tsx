import { Header, RowData, flexRender } from '@tanstack/react-table'
import * as styles from './RowHeader.module.scss'
import { LuArrowUpDown } from "react-icons/lu";
import { FaArrowDown } from "react-icons/fa6";
import { FaArrowUp } from "react-icons/fa6";

const RowHeader = (props) => {
  const { columnHeaders }: { columnHeaders: Header<RowData, unknown>[] } = props;

  const getSortIcon = (sortDirection) => {
    if (sortDirection === 'asc') {
      return <FaArrowDown />
    } else if (sortDirection === 'desc') {
      return <FaArrowUp />
    } else {
      return <LuArrowUpDown />
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.rowHeader}>
        {
          columnHeaders.map(header => (
            <div className={styles.columnHeader} key={header.id} onClick={header.column.getToggleSortingHandler()} style={{ cursor: header.column.getCanSort() ? 'pointer' : '' }}>
              <div className={styles.columnIcon}>
                {
                  header.column.getCanSort() && getSortIcon(header.column.getIsSorted())
                }
              </div>
              <div>
                {
                  header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )
                }
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default RowHeader
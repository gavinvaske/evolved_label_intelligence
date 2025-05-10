import { IoTrashOutline, IoCreateOutline } from 'react-icons/io5';
import clsx from 'clsx';
import * as styles from './DataTableRow.module.scss';

type Column = {
  displayName: string;
  accessor: string;
}

type Props = {
  data: Record<string, any>;
  columns: Column[];
  onDelete?: () => void;
  onEdit?: () => void;
}

const DataTableRow = (props: Props) => {
  const { data, columns, onDelete, onEdit } = props;

  return (
    <div className={styles.dataTableRow}>
      {columns.map((column, index) => {
        // Skip the last two columns if they are Edit/Delete
        if (index >= columns.length - 2 && (columns[columns.length - 2].displayName === 'Edit' || columns[columns.length - 1].displayName === 'Delete')) {
          return null;
        }
        return (
          <div key={column.accessor} className={styles.columnTd}>
            {data[column.accessor]}
          </div>
        );
      })}
      <div className={clsx(styles.columnTd, styles.actionIcons)}>
        {onEdit && <IoCreateOutline onClick={onEdit} />}
        {onDelete && <IoTrashOutline onClick={onDelete} />}
      </div>
    </div>
  );
};

export default DataTableRow; 
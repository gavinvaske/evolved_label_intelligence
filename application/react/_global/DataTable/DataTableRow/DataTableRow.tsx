import { IoTrashOutline, IoCreateOutline } from 'react-icons/io5';
import clsx from 'clsx';
import * as styles from './DataTableRow.module.scss';
import { IconButton } from '../../IconButton/IconButton';

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
      {columns.map((column) => {
        // Skip the last two columns if they are Edit/Delete
        if (column.displayName === 'Edit' || column.displayName === 'Delete') {
          return null;
        }
        return (
          <div key={column.accessor} className={styles.columnTd}>
            {data[column.accessor]}
          </div>
        );
      })}
      <div className={clsx(styles.columnTd, styles.actionIcons)}>
        {onEdit && <IconButton icon={<IoCreateOutline />} onClick={onEdit} color="blue" tooltip="Edit" />}
        {onDelete && <IconButton icon={<IoTrashOutline />} onClick={onDelete} color="red" tooltip="Delete" />}
      </div>
    </div>
  );
};

export default DataTableRow; 
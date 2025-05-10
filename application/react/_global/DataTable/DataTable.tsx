import React from 'react';
import { FaPlus } from 'react-icons/fa';
import clsx from 'clsx';
import * as tableStyles from '@ui/styles/table.module.scss';
import * as styles from './DataTable.module.scss';
import { Button } from '../Button/Button';

type Column = {
  displayName: string;
  accessor: string;
}

type Props = {
  title: string;
  columns: Column[];
  data: any[];
  onAdd: () => void;
  renderRow: (data: any, index: number) => React.ReactNode;
}

export const DataTable = (props: Props) => {
  const { title, columns, data, onAdd, renderRow } = props;

  return (
    <div className={styles.dataTable}>
      <div className={styles.dataTableHeader}>
        <h3>{title}</h3>
        <button onClick={onAdd}>Add</button>
      </div>
      <div className={styles.dataTableContent}>
        <div className={styles.dataTableRow}>
          {columns.map(column => (
            <div key={column.accessor} className={styles.columnTh}>
              {column.displayName}
            </div>
          ))}
        </div>
        {data.map((row, index) => renderRow(row, index))}
      </div>
    </div>
  );
}; 
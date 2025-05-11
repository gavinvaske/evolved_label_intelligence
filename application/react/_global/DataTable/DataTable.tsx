import React from 'react';
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
  const { title, columns, data, onAdd, renderRow, ...rest } = props;

  return (
    <div className={styles.dataTable} {...rest}>
      <div className={styles.dataTableHeader}>
        <h3>{title}</h3>
        <Button onClick={onAdd} type="button" data-test='add-button'>Add</Button>
      </div>
      <div className={styles.dataTableContent}>
        <div className={styles.dataTableHeaderRow}>
          {columns.map(column => {
            // Skip Edit/Delete columns in header too
            if (column.displayName === 'Edit' || column.displayName === 'Delete') {
              return null;
            }
            return (
              <div key={column.accessor} className={styles.columnTh}>
                {column.displayName}
              </div>
            );
          })}
          <div className={styles.actionColumn}>Actions</div>
        </div>
        {data.map((row, index) => renderRow(row, index))}
      </div>
    </div>
  );
}; 
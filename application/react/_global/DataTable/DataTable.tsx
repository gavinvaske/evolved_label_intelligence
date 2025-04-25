import React from 'react';
import { FaPlus } from 'react-icons/fa';
import clsx from 'clsx';
import * as tableStyles from '@ui/styles/table.module.scss';
import * as styles from './DataTable.module.scss';

interface DataTableProps {
  title: string;
  columns: string[];
  data: any[];
  onAdd: () => void;
  onDelete: (index: number) => void;
  renderRow: (data: any, index: number) => React.ReactNode;
}

export const DataTable: React.FC<DataTableProps> = ({
  title,
  columns,
  data,
  onAdd,
  onDelete,
  renderRow
}) => {
  return (
    <div className={styles.dataTableContainer}>
      <div className={styles.titleHeader}>
        <h3>{title}</h3>
      </div>
      <div className={clsx(styles.tableContainer, tableStyles.tblPri)}>
        <div className={tableStyles.tblHdr}>
          {columns.map((column, index) => (
            <div key={index} className={tableStyles.tblCell}>
              {column}
            </div>
          ))}
        </div>
        <div className={styles.tableBody}>
          {data.map((item, index) => (
            <div key={index} className={styles.tableRow}>
              {renderRow(item, index)}
            </div>
          ))}
        </div>
      </div>
      <button 
        className={styles.addButton} 
        type="button" 
        onClick={onAdd}
      >
        <FaPlus /> Add {title}
      </button>
    </div>
  );
}; 
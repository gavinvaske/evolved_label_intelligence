import { ReactNode } from 'react';
import clsx from 'clsx';
import { IoCreateOutline } from 'react-icons/io5';
import { MdOutlinePreview } from 'react-icons/md';
import * as styles from './TableModal.module.scss';
import { IconButton } from '../IconButton/IconButton';
import { useNavigate } from 'react-router-dom';

type TableColumn = {
  width?: string;
  label: string;
  hasPulseIndicator?: boolean;
};

type TableModalProps = {
  title: string;
  createPath: string;
  createState?: Record<string, any>;
  viewAllPath: string;
  columns: TableColumn[];
  children: ReactNode;
};

export const TableModal = ({
  title,
  createPath,
  createState,
  viewAllPath,
  columns,
  children
}: TableModalProps) => {
  const navigate = useNavigate();

  return (
    <div className={styles.modalContent}>
      <div className={styles.titleWrapper}>
        <h4>{title}</h4>
        <IconButton
          icon={<IoCreateOutline />}
          tooltip={`Create New ${title.split(':')[0]}`}
          onClick={() => navigate(createPath, { state: createState })}
        />
        <IconButton
          icon={<MdOutlinePreview />}
          tooltip={`View All ${title.split(':')[0]}s`}
          onClick={() => navigate(viewAllPath)}
        />
      </div>
      <div className={styles.tableWrapper}>
        <div className={styles.table}>
          <div className={styles.header}>
            {columns.map((column, index) => (
              <div 
                key={index}
                className={clsx(
                  styles.cell,
                  styles[`cell${index + 1}`],
                  column.width && styles[`width${column.width}`]
                )}
              >
                {column.hasPulseIndicator && <div className={styles.pulseIndicator} />}
                {column.label}
              </div>
            ))}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}; 
import React, { useEffect, useState } from 'react';
import * as styles from './PageSelect.module.scss'
import { Table } from '@tanstack/react-table';
import { LoadingIndicator } from '../../LoadingIndicator/LoadingIndicator';

interface Props {
  table: Table<any>;
  isLoading: boolean;
}

const MAX_PAGE_SIZE = 200;

export const PageSelect = (props: Props) => {
  const { table, isLoading } = props;
  const pageSize = table.getState().pagination.pageSize;
  const [pageNumberInputField, setPageNumberInputField] = useState<string>('');
  const [pageSizeInputField, setPageSizeInputField] = useState<string>(String(pageSize));
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isLoading) return;

    const { pagination } = table.getState();

    setPageNumberInputField(String(pagination.pageIndex + 1));
  }, [isLoading, table.getState().pagination.pageIndex]);

  const onPageChange = (pageIndex: number) => {
    table.setPageIndex(pageIndex)
  }

  const onPageSizeChange = (pageSize: number) => {
    table.setPageSize(pageSize)
  }

  const totalPages = table.getPageCount();

  const handlePageChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setErrorMessage('');
    if (e.key !== 'Enter') return;

    if (!pageNumberInputField || isNaN(Number(pageNumberInputField))) {
      setPageNumberInputField('1');
    }

    const page = Number(pageNumberInputField);

    if (page < 1) {
      setPageNumberInputField('1');
    }

    if (page > totalPages) {
      setErrorMessage(`Page number must be less than or equal to ${totalPages}`);
      setPageNumberInputField(String(totalPages));
      return;
    }

    const pageIndex = page - 1; // Convert page number to zero-based index
    onPageChange(pageIndex);
  };

  const handlePageSizeChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setErrorMessage('');
    if (e.key !== 'Enter') return;

    const pageSize = Number(pageSizeInputField);

    if (isNaN(pageSize)) {
      setErrorMessage('Page size must be a number');
      return; 2
    }

    if ((pageSize < 1)) {
      setErrorMessage(`Page size must be greater than 0`);
      setPageSizeInputField('1');
      return;
    }

    if ((pageSize > MAX_PAGE_SIZE)) {
      setErrorMessage(`Page size must be less than or equal to ${MAX_PAGE_SIZE}`);
      setPageSizeInputField(String(MAX_PAGE_SIZE));
      return;
    }
    const defaultPageIndex = 0;
    setPageNumberInputField(String(defaultPageIndex + 1));
    onPageChange(defaultPageIndex);
    setPageSizeInputField(String(pageSize))
    onPageSizeChange(pageSize);
  };

  const pageNumberDescription = isLoading ? <LoadingIndicator /> : `Page ${table.getState().pagination.pageIndex + 1} of ${totalPages > 0 ? totalPages : 1}`;

  return (
    <div style={{ marginTop: '1rem' }}>
      <button
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        Previous
      </button>
      <span style={{ margin: '0 1rem' }}>{pageNumberDescription}</span>
      <button
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Next
      </button>
      <div>
        <span className={styles.pageSelectError}>{errorMessage}</span>
        <br></br>
        <label htmlFor="page">Go to Page:</label>
        <input
          name='page'
          type='number'
          value={pageNumberInputField}
          onKeyDown={handlePageChange}
          onChange={(e) => setPageNumberInputField(e.target.value)}
          min={1}
          max={totalPages}
        />
      </div>

      <div>
        <label htmlFor="page">Rows per Page:</label>
        <input
          name='page'
          type='number'
          value={pageSizeInputField}
          onKeyDown={handlePageSizeChange}
          onChange={e => setPageSizeInputField(e.target.value)}
          min={1}
          max={MAX_PAGE_SIZE}
        />
      </div>
    </div>
  )
}

import RowHeader from '../RowHeader/RowHeader';
import { Table } from '@tanstack/react-table';

interface TableHeadProps<TData> {
  table: Table<TData>;
}

export const TableHead = <TData,>(props: TableHeadProps<TData>) => {
  const { table } = props;

  return (
    <RowHeader columnHeaders={table.getFlatHeaders()} />
  )
}

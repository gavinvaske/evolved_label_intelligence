import RowHeader from '../RowHeader/RowHeader';
import { RowData, Table } from '@tanstack/react-table';

interface TableHeadProps {
  table: Table<RowData>;
}

export const TableHead = (props: TableHeadProps) => {
  const { table }: TableHeadProps = props;

  return (
    <RowHeader columnHeaders={table.getFlatHeaders()} />
  )
}

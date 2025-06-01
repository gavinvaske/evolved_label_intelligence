import React from 'react';
import './QuoteTable.scss';
import { createColumnHelper, getCoreRowModel, getFilteredRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import { QuoteRowActions } from './QuoteRowActions/QuoteRowActions';
import { useQuery } from '@tanstack/react-query';
import { getQuotes } from '../../_queries/quote';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { Table } from '../../_global/Table/Table';
import { TableHead } from '../../_global/Table/TableHead/TableHead';
import { TableBody } from '../../_global/Table/TableBody/TableBody';
import Row from '../../_global/Table/Row/Row';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import { TablePageHeader } from '../../_global/Table/TablePageHeader/TablePageHeader';
import { PageSelect } from '../../_global/Table/PageSelect/PageSelect';

type TODO = any;

const columnHelper = createColumnHelper<TODO>()

const columns = [
  columnHelper.accessor('quoteNumber', {
    header: 'Quote Number',
  }),
  columnHelper.accessor('updatedAt', {
    header: 'Updated'
  }),
  columnHelper.accessor('createdAt', {
    header: 'Created'
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: props => <QuoteRowActions row={props.row} />
  })
];

export const QuoteTable = () => {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([])

  const { isError, data: quotes, error, isLoading } = useQuery({
    queryKey: ['get-quotes'],
    queryFn: getQuotes,
    initialData: []
  })

  if (isError) {
    useErrorMessage(error)
  }

  const table = useReactTable({
    data: quotes,
    columns,
    state: {
      globalFilter: globalFilter,
      sorting: sorting,
    },
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getSortedRowModel: getSortedRowModel(),
  })

  const rows = table.getRowModel().rows;

  return (
    <div className={sharedStyles.pageWrapper}>
      <div className={sharedStyles.card}>
      <TablePageHeader
          title="Quotes"
          createButton={{
            to: '/react-ui/forms/quote',
            tooltip: 'Create a new quote'
          }}
          totalResults={quotes?.totalResults || 0}
          currentResults={rows.length}
          searchValue={globalFilter}
          onSearch={(value: string) => {
            setGlobalFilter(value)
            table.resetPageIndex();
          }}
        />

        <Table id='quote-table'>
          <TableHead table={table} />
          
          <TableBody>
            {rows.map(row => (
              <Row row={row} key={row.id}></Row>
            ))}
          </TableBody>
          <PageSelect
            table={table}
            isLoading={isLoading}
          />
        </Table>
      </div>
    </div>
  )
}

export default QuoteTable;
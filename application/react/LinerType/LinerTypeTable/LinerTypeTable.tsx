import React, { useMemo } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  PaginationState,
} from '@tanstack/react-table'
import SearchBar from '../../_global/SearchBar/SearchBar'
import { TableHead } from '../../_global/Table/TableHead/TableHead'
import { TableBody } from '../../_global/Table/TableBody/TableBody'
import { Table } from '../../_global/Table/Table'
import { LinerTypeRowActions } from './LinerTypeRowActions/LinerTypeRowActions'
import { useQuery } from '@tanstack/react-query';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { getDateTimeFromIsoStr } from '@ui/utils/dateTime.ts';
import { SearchResult } from '@shared/types/http';
import { performTextSearch } from '../../_queries/_common';
import Row from '../../_global/Table/Row/Row';
import { PageSelect } from '../../_global/Table/PageSelect/PageSelect';
import { ILinerType } from '@shared/types/models';
import * as tableStyles from '@ui/styles/table.module.scss'
import * as sharedStyles from '@ui/styles/shared.module.scss'
import { useConfirmation } from '../../_global/Modal/useConfirmation';

export const LinerTypeTable = () => {
  const [globalSearch, setGlobalSearch] = React.useState('');
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  })
  const defaultData = useMemo(() => [], [])
  const columnHelper = createColumnHelper<ILinerType>()
  const confirmation = useConfirmation();
  const { ConfirmationDialog } = confirmation;

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name'
    }),
    columnHelper.accessor(row => getDateTimeFromIsoStr(row.updatedAt), {
      header: 'Updated'
    }),
    columnHelper.accessor(row => getDateTimeFromIsoStr(row.createdAt), {
      header: 'Created'
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: props => <LinerTypeRowActions row={props.row} confirmation={confirmation} />
    })
  ];

  const { isError, data: linerTypeSearchResults, error, isLoading } = useQuery({
    queryKey: ['get-liner-types', pagination, sorting, globalSearch],
    queryFn: async () => {
      const sortDirection = sorting.length ? (sorting[0]?.desc ? '-1' : '1') : undefined;
      const sortField = sorting.length ? sorting[0]?.id : undefined;
      const results: SearchResult<ILinerType> = await performTextSearch<ILinerType>('/liner-types/search', {
        query: globalSearch,
        pageIndex: String(pagination.pageIndex),
        limit: String(pagination.pageSize),
        sortField: sortField,
        sortDirection: sortDirection
      }) || {}

      return results
    },
    meta: { keepPreviousData: true, initialData: { results: [], totalPages: 0 } }
  })

  if (isError) {
    useErrorMessage(error)
  }

  const table = useReactTable<ILinerType>({
    data: linerTypeSearchResults?.results ?? defaultData,
    columns,
    rowCount: linerTypeSearchResults?.totalResults ?? 0,
    manualSorting: true,
    manualPagination: true,
    state: {
      globalFilter: globalSearch,
      sorting: sorting,
      pagination: pagination

    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updaterOrValue) => {
      table.resetPageIndex(); // reset to first page when sorting
      setSorting((oldSorting) =>
        typeof updaterOrValue === 'function'
          ? updaterOrValue(oldSorting)
          : updaterOrValue
      );
    },
    onGlobalFilterChange: setGlobalSearch,
    getSortedRowModel: getSortedRowModel(),
  })

  const rows = table.getRowModel().rows;

  return (
    <div className={sharedStyles.pageWrapper}>
      <div className={sharedStyles.card}>
        <div className={tableStyles.headerDescription}>
          <h1 className={sharedStyles.textBlue}>Liner Types</h1>
          <p>Viewing <p className={sharedStyles.textBlue}>{rows.length}</p> of <p className={sharedStyles.textBlue}>{linerTypeSearchResults?.totalResults || 0}</p> results.</p>
        </div>
        <SearchBar value={globalSearch} performSearch={(value: string) => {
          setGlobalSearch(value)
          table.resetPageIndex();
        }} />

        <Table id='liner-type-table'>
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
        <ConfirmationDialog />
      </div>
    </div>
  )
}

export default LinerTypeTable;
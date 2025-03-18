import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, getCoreRowModel, getSortedRowModel, SortingState, useReactTable, PaginationState } from '@tanstack/react-table';
import React, { useMemo } from 'react';
import { useErrorMessage } from '../../../_hooks/useErrorMessage';
import { MaterialLengthAdjustmentRowActions } from '../MaterialLengthAdjustmentRowActions/MaterialLengthAdjustmentRowActions';
import SearchBar from '../../../_global/SearchBar/SearchBar';
import { Table } from '../../../_global/Table/Table';
import { TableHead } from '../../../_global/Table/TableHead/TableHead';
import { TableBody } from '../../../_global/Table/TableBody/TableBody';
import Row from '../../../_global/Table/Row/Row';
import './MaterialLengthAdjustmentTable.scss'
import { PageSelect } from '../../../_global/Table/PageSelect/PageSelect';
import { SearchResult } from '@shared/types/http';
import { getDateTimeFromIsoStr } from '@ui/utils/dateTime';
import { performTextSearch } from '../../../_queries/_common';
import { IMaterial, IMaterialLengthAdjustment } from '@shared/types/models.ts';
import { isRefPopulated } from '@shared/types/_utility';
import * as tableStyles from '@ui/styles/table.module.scss'
import * as sharedStyles from '@ui/styles/shared.module.scss'

const columnHelper = createColumnHelper<IMaterialLengthAdjustment>()

const columns = [
  columnHelper.accessor(row => isRefPopulated<IMaterial>(row.material) ? row.material.name : '', {
    id: 'material.name',
    header: 'Material Name',
  }),
  columnHelper.accessor(row => row.length, {
    header: 'Length',
    cell: ({ getValue }) => {
      const length = getValue();
      return (
        <span style={{ color: length > 0 ? 'green' : 'red' }}>
          {length > 0 ? `${length}` : `(${Math.abs(length)})`}
        </span>
      );
    },
  }),
  columnHelper.accessor('notes', {
    header: 'Notes',
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
    cell: props => <MaterialLengthAdjustmentRowActions row={props.row} />
  })
];

export const MaterialLengthAdjustmentTable = () => {
  const [globalSearch, setGlobalSearch] = React.useState('');
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  })
  const defaultData = useMemo(() => [], [])

  const { isError, data: materialLengthAdjustmentSearchResults, error, isLoading } = useQuery({
    queryKey: ['get-material-length-adjustments', pagination, sorting, globalSearch],
    queryFn: async () => {
      const sortDirection = sorting.length ? (sorting[0]?.desc ? '-1' : '1') : undefined;
      const sortField = sorting.length ? sorting[0]?.id : undefined;
      const results: SearchResult<IMaterialLengthAdjustment> = await performTextSearch('/material-length-adjustments/search', {
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

  const table = useReactTable<any>({
    data: materialLengthAdjustmentSearchResults?.results ?? defaultData,
    columns,
    rowCount: materialLengthAdjustmentSearchResults?.totalResults ?? 0,
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
          <h1 className={sharedStyles.textBlue}>Material Length Adjustments</h1>
          <p>Viewing <p className={sharedStyles.textBlue}>{rows.length}</p> of <p className={sharedStyles.textBlue}>{materialLengthAdjustmentSearchResults?.totalResults || 0}</p> results.</p>
        </div>
         <SearchBar value={globalSearch} performSearch={(value: string) => {
          setGlobalSearch(value)
          table.resetPageIndex();
        }} />

        <Table id='material-length-adjustment-table'>
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

export default MaterialLengthAdjustmentTable;
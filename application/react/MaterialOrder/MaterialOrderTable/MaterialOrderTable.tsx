import React, { useMemo } from 'react';
import './MaterialOrderTable.scss'
import { createColumnHelper, getCoreRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable } from '@tanstack/react-table';
import { MaterialOrderRowActions } from './MaterialOrderRowActions/MaterialOrderRowActions';
import { useQuery } from '@tanstack/react-query';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import SearchBar from '../../_global/SearchBar/SearchBar';
import { Table } from '../../_global/Table/Table';
import { TableHead } from '../../_global/Table/TableHead/TableHead';
import { TableBody } from '../../_global/Table/TableBody/TableBody';
import Row from '../../_global/Table/Row/Row';
import { getDateFromIsoStr, getDateTimeFromIsoStr } from '@ui/utils/dateTime';
import { SearchResult } from '@shared/types/http';
import { PageSelect } from '../../_global/Table/PageSelect/PageSelect';
import { performTextSearch } from '../../_queries/_common';
import { IMaterial, IMaterialOrder, IVendor } from '@shared/types/models';

const columnHelper = createColumnHelper<IMaterialOrder>()

const columns = [
  columnHelper.accessor('purchaseOrderNumber', {
    header: 'P.O Number',
  }),
  columnHelper.accessor(row => (row.material as IMaterial | null)?.materialId, {
    id: 'material.materialId',
    header: 'Material ID',
  }),
  columnHelper.accessor(row => (row.vendor as IVendor).name, {
    id: 'vendor.name',
    header: 'Vendor',
  }),
  columnHelper.accessor(row => getDateFromIsoStr(row.orderDate), {
    header: 'Order Date'
  }),
  columnHelper.accessor(row => getDateFromIsoStr(row.arrivalDate), {
    header: 'Arrival Date'
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
    cell: props => <MaterialOrderRowActions row={props.row} />
  })
];

export const MaterialOrderTable = () => {
  const [globalSearch, setGlobalSearch] = React.useState('');
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  })
  const defaultData = useMemo(() => [], [])

  const { isError, data: materialOrderResults, error, isLoading } = useQuery({
    queryKey: ['get-material-orders', pagination, sorting, globalSearch],
    queryFn: async () => {
      const sortDirection = sorting.length ? (sorting[0]?.desc ? '-1' : '1') : undefined;
      const sortField = sorting.length ? sorting[0]?.id : undefined;
      const results: SearchResult<IMaterial> = await performTextSearch<IMaterial>('/material-orders/search', {
        query: globalSearch,
        pageIndex: String(pagination.pageIndex),
        limit: String(pagination.pageSize),
        sortField: sortField,
        sortDirection: sortDirection,
      }) || {}

      return results
    },
    meta: { keepPreviousData: true, initialData: { results: [], totalPages: 0 } }
  })

  if (isError) {
    useErrorMessage(error)
  }

  const table = useReactTable<any>({
    data: materialOrderResults?.results ?? defaultData,
    columns,
    rowCount: materialOrderResults?.totalResults ?? 0,
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
    <div className='page-wrapper credit-term-table'>
      <div className='card table-card'>
        <div className="header-description">
          <h1 className="text-blue">Material Orders</h1>
          <p>Viewing <p className='text-blue'>{rows.length}</p> of <p className='text-blue'>{materialOrderResults?.totalResults || 0}</p> results.</p>
        </div>
        <SearchBar value={globalSearch} performSearch={(value: string) => {
          setGlobalSearch(value)
          table.resetPageIndex();
        }} />

        <Table id='material-order-table'>
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

export default MaterialOrderTable;
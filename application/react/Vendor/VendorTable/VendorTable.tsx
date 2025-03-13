import React, { useMemo } from 'react';
import { createColumnHelper, getCoreRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable } from '@tanstack/react-table';
import { getDateTimeFromIsoStr } from '@ui/utils/dateTime';
import { VendorRowActions } from './VendorRowActions/VendorRowActions';
import SearchBar from '../../_global/SearchBar/SearchBar';
import { Table } from '../../_global/Table/Table';
import { TableHead } from '../../_global/Table/TableHead/TableHead';
import { TableBody } from '../../_global/Table/TableBody/TableBody';
import Row from '../../_global/Table/Row/Row';
import { useQuery } from '@tanstack/react-query';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { PageSelect } from '../../_global/Table/PageSelect/PageSelect';
import { SearchResult } from '@shared/types/http';
import { performTextSearch } from '../../_queries/_common';
import { IVendor } from '@shared/types/models';

const columnHelper = createColumnHelper<any>()

const columns = [
  columnHelper.accessor('name', {
    header: 'Name'
  }),
  columnHelper.accessor('email', {
    header: 'Email'
  }),
  columnHelper.accessor('primaryContactName', {
    header: 'P.C Name'
  }),
  columnHelper.accessor('primaryContactEmail', {
    header: 'P.C Email'
  }),
  columnHelper.accessor('mfgSpecNumber', {
    header: 'MFG Spec #'
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
    cell: props => <VendorRowActions row={props.row}/>
  })
];
export const VendorTable = () => {
  const [globalSearch, setGlobalSearch] = React.useState('');
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  })
  const defaultData = useMemo(() => [], [])

  const { isError, data: vendorSearchResults, error, isLoading } = useQuery({
    queryKey: ['get-vendors', pagination, sorting, globalSearch],
    queryFn: async () => {
      const sortDirection = sorting.length ? (sorting[0]?.desc ? '-1' : '1') : undefined;
      const sortField = sorting.length ? sorting[0]?.id : undefined;
      const results: SearchResult<IVendor> = await performTextSearch<IVendor>('/vendors/search', {
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
    data: vendorSearchResults?.results ?? defaultData,
    columns,
    rowCount: vendorSearchResults?.totalResults ?? 0,
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
    <div className='page-wrapper'>
      <div className='card table-card'>
        <div className="header-description">
          <h1 className="text-blue">Vendors</h1>
          <p>Viewing <p className='text-blue'>{rows.length}</p> of <p className='text-blue'>{vendorSearchResults?.totalResults || 0}</p> results.</p>
        </div>
         <SearchBar value={globalSearch} performSearch={(value: string) => {
          setGlobalSearch(value)
          table.resetPageIndex();
        }} />

        <Table id='vendor-table'>
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

export default VendorTable;
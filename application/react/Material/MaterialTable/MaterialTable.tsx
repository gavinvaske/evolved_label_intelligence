import React, { useMemo } from 'react';
import { PaginationState, SortingState, createColumnHelper, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { MaterialRowActions } from './MaterialRowActions/MaterialRowActions';
import { Table } from '../../_global/Table/Table';
import { TableHead } from '../../_global/Table/TableHead/TableHead';
import { TableBody } from '../../_global/Table/TableBody/TableBody';
import { useQuery } from '@tanstack/react-query';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { getDateTimeFromIsoStr } from '@ui/utils/dateTime.ts';
import { PageSelect } from '../../_global/Table/PageSelect/PageSelect';
import Row from '../../_global/Table/Row/Row';
import { SearchResult } from '@shared/types/http';
import { ILinerType, IMaterial, IVendor } from '@shared/types/models';
import { performTextSearch } from '../../_queries/_common';
import { isRefPopulated } from '@shared/types/_utility';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import { useConfirmation } from '../../_global/Modal/useConfirmation';
import { TablePageHeader } from '../../_global/Table/TablePageHeader/TablePageHeader';

export const MaterialTable = () => {
  const [globalSearch, setGlobalSearch] = React.useState('');
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  })
  const defaultData = useMemo(() => [], [])
  const columnHelper = createColumnHelper<IMaterial>()
  const confirmation = useConfirmation();
  const { ConfirmationDialog } = confirmation;

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name'
    }),
    columnHelper.accessor('materialId', {
      header: 'Material ID'
    }),
    columnHelper.accessor('productNumber', {
      header: 'Product Number'
    }),
    columnHelper.accessor(row => isRefPopulated(row.linerType) ? (row.linerType as ILinerType).name : '', {
      header: 'Liner Type'
    }),
    columnHelper.accessor('description', {
      header: 'Description'
    }),
    columnHelper.accessor(row => isRefPopulated(row.vendor) ? (row.vendor as IVendor).name : '', {
      header: 'Vendor Name'
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
      cell: props => <MaterialRowActions row={props.row} confirmation={confirmation} />
    })
  ];

  const { isError, data: materialSearchResults, error, isLoading } = useQuery({
    queryKey: ['get-materials', pagination, sorting, globalSearch],
    queryFn: async () => {
      const sortDirection = sorting.length ? (sorting[0]?.desc ? '-1' : '1') : undefined;
      const sortField = sorting.length ? sorting[0]?.id : undefined;
      const results: SearchResult<IMaterial> = await performTextSearch<IMaterial>('/materials/search', {
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

  const table = useReactTable<IMaterial>({
    data: materialSearchResults?.results ?? defaultData,
    columns,
    rowCount: materialSearchResults?.totalResults ?? 0,
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
        <TablePageHeader
          title="Materials"
          createButton={{
            to: '/react-ui/forms/material',
            tooltip: 'Create a new material'
          }}
          totalResults={materialSearchResults?.totalResults || 0}
          currentResults={rows.length}
          searchValue={globalSearch}
          onSearch={(value: string) => {
            setGlobalSearch(value)
            table.resetPageIndex();
          }}
        />

        <Table data-test='material-table'>
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

export default MaterialTable;
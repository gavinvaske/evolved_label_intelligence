import React, { useEffect, useMemo } from 'react';
import { createColumnHelper, getCoreRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable } from '@tanstack/react-table';
import { MaterialOrderRowActions } from './MaterialOrderRowActions/MaterialOrderRowActions';
import { useQuery } from '@tanstack/react-query';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { Table } from '../../_global/Table/Table';
import { TableHead } from '../../_global/Table/TableHead/TableHead';
import { TableBody } from '../../_global/Table/TableBody/TableBody';
import Row from '../../_global/Table/Row/Row';
import { getDateFromIsoStr, getDateTimeFromIsoStr } from '@ui/utils/dateTime';
import { SearchResult } from '@shared/types/http';
import { PageSelect } from '../../_global/Table/PageSelect/PageSelect';
import { performTextSearch } from '../../_queries/_common';
import { IMaterial, IMaterialOrder, IVendor } from '@shared/types/models';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import { useLocation } from 'react-router-dom';
import { useConfirmation } from '../../_global/Modal/useConfirmation';
import { TablePageHeader } from '../../_global/Table/TablePageHeader/TablePageHeader';

export const MaterialOrderTable = () => {
  const [globalSearch, setGlobalSearch] = React.useState('');
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  })
  const defaultData = useMemo(() => [], [])
  const columnHelper = createColumnHelper<IMaterialOrder>()
  const confirmation = useConfirmation();
  const { ConfirmationDialog } = confirmation;

  const columns = [
    columnHelper.accessor('purchaseOrderNumber', {
      header: 'P.O Number',
    }),
    columnHelper.accessor(row => (row.material as IMaterial | null)?.name, {
      id: 'material.name',
      header: 'Material',
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
      cell: props => <MaterialOrderRowActions row={props.row} confirmation={confirmation} />
    })
  ];

  const { state } = useLocation();
  const { query } = state || {};

  useEffect(() => {
    if (query) {
      setGlobalSearch(query);
    }
  }, [query]);

  const { isError, data: materialOrderResults, error, isLoading } = useQuery({
    queryKey: ['get-material-orders', pagination, sorting, globalSearch],
    queryFn: async () => {
      const sortDirection = sorting.length ? (sorting[0]?.desc ? '-1' : '1') : undefined;
      const sortField = sorting.length ? sorting[0]?.id : undefined;
      const results: SearchResult<IMaterialOrder> = await performTextSearch<IMaterialOrder>('/material-orders/search', {
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

  const table = useReactTable<IMaterialOrder>({
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
    <div className={sharedStyles.pageWrapper}>
      <div className={sharedStyles.card}>
        <TablePageHeader
          title="Material Orders"
          createButton={{
            to: '/react-ui/forms/material-order',
            tooltip: 'Create a new material order'
          }}
          totalResults={materialOrderResults?.totalResults || 0}
          currentResults={rows.length}
          searchValue={globalSearch}
          onSearch={(value: string) => {
            setGlobalSearch(value)
            table.resetPageIndex();
          }}
        />

        <Table id='material-order-table' data-test='material-order-table'>
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

export default MaterialOrderTable;
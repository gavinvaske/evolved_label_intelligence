import React, { useMemo } from 'react';
import { createColumnHelper, getCoreRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { IMaterialCategory } from '@shared/types/models';
import { SearchResult } from '@shared/types/http';
import { performTextSearch } from '../../_queries/_common';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { getDateTimeFromIsoStr } from '@ui/utils/dateTime';
import { MaterialCategoryRowActions } from './MaterialCategoryRowActions/MaterialCategoryRowActions';
import { Table } from '../../_global/Table/Table';
import { TableHead } from '../../_global/Table/TableHead/TableHead';
import { TableBody } from '../../_global/Table/TableBody/TableBody';
import Row from '../../_global/Table/Row/Row';
import { PageSelect } from '../../_global/Table/PageSelect/PageSelect';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import { useConfirmation } from '../../_global/Modal/useConfirmation';
import { TablePageHeader } from '../../_global/Table/TablePageHeader/TablePageHeader';
export const MaterialCategoryTable = () => {
  const [globalSearch, setGlobalSearch] = React.useState('');
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  })
  const defaultData = useMemo(() => [], [])
  const columnHelper = createColumnHelper<IMaterialCategory>()
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
      cell: props => <MaterialCategoryRowActions row={props.row} confirmation={confirmation} />
    })
  ];

  const { isError, data: materialCategorySearchResults, error, isLoading } = useQuery({
    queryKey: ['get-material-categories', pagination, sorting, globalSearch],
    queryFn: async () => {
      const sortDirection = sorting.length ? (sorting[0]?.desc ? '-1' : '1') : undefined;
      const sortField = sorting.length ? sorting[0]?.id : undefined;
      const results: SearchResult<IMaterialCategory> = await performTextSearch<IMaterialCategory>('/material-categories/search', {
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
    data: materialCategorySearchResults?.results ?? defaultData,
    columns,
    rowCount: materialCategorySearchResults?.totalResults ?? 0,
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
          title="Material Categories"
          createButton={{
            to: '/react-ui/forms/material-category',
            tooltip: 'Create a new material category'
          }}
          totalResults={materialCategorySearchResults?.totalResults || 0}
          currentResults={rows.length}
          searchValue={globalSearch}
          onSearch={(value: string) => {
            setGlobalSearch(value)
            table.resetPageIndex();
          }}
        />

        <Table id='material-category-table' data-test='material-category-table'>
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

export default MaterialCategoryTable;
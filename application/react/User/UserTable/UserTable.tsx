
import { IUser } from '@shared/types/models';
import './UserTable.scss';
import { createColumnHelper, getCoreRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable } from '@tanstack/react-table';
import { getDateTimeFromIsoStr } from '@ui/utils/dateTime';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { performTextSearch } from '../../_queries/_common';
import { SearchResult } from '@shared/types/http';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { LoadingIndicator } from '../../_global/LoadingIndicator/LoadingIndicator';
import SearchBar from '../../_global/SearchBar/SearchBar';
import { Table } from '../../_global/Table/Table';
import { TableHead } from '../../_global/Table/TableHead/TableHead';
import { TableBody } from '../../_global/Table/TableBody/TableBody';
import Row from '../../_global/Table/Row/Row';
import { PageSelect } from '../../_global/Table/PageSelect/PageSelect';
import { UserRowActions } from './UserRowActions/UserRowActions';
import tableStyles from '@ui/styles/table.module.scss'

const columnHelper = createColumnHelper<IUser>()

const columns = [
  columnHelper.accessor('email', {
    header: 'email',
  }),
  columnHelper.accessor(row => getFullName(row.firstName, row.lastName), {
    header: 'Name'
  }),
  columnHelper.accessor(row => row.authRoles?.join(', ') || '', {
    header: 'Auth Roles'
  }),
  columnHelper.accessor(row => getDateTimeFromIsoStr(row.lastLoginDateTime), {
    header: 'Last Login'
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
    cell: props => <UserRowActions row={props.row} />
  })
];

export const UserTable = () => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  })
  const defaultData = useMemo(() => [], [])

  const { isError, data: userResults, error, isLoading } = useQuery({
    queryKey: ['get-users', pagination, sorting, globalSearch],
    queryFn: async () => {
      const sortDirection = sorting.length ? (sorting[0]?.desc ? '-1' : '1') : undefined;
      const sortField = sorting.length ? sorting[0]?.id : undefined;
      const results: SearchResult<IUser> = await performTextSearch<IUser>('/users/search', {
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

  const table = useReactTable<any>({
    data: userResults?.results ?? defaultData,
    columns,
    rowCount: userResults?.totalResults ?? 0,
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

  if (isError) {
    useErrorMessage(error)
  }

  if (isLoading) {
    return <LoadingIndicator />
  }


  return (
    <div className='page-wrapper user-table'>
      <div className='card'>
        <div className={tableStyles.headerDescription}>
          <h1 className="text-blue">Users</h1>
          <p>Viewing <p className='text-blue'>{rows.length}</p> of <p className='text-blue'>{userResults?.totalResults || 0}</p> results.</p>
        </div>
        <SearchBar value={globalSearch} performSearch={(value: string) => {
          setGlobalSearch(value)
          table.resetPageIndex();
        }} />

        <Table id='user-table'>
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

function getFullName(firstName: string, lastName: string) {
  if (!firstName && !lastName) return ''
  return `${firstName || ''} ${lastName || ''}`
}

export default UserTable;
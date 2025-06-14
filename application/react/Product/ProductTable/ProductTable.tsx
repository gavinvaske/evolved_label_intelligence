import React from 'react';
import { createColumnHelper, getCoreRowModel, getFilteredRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import { ProductRowActions } from './ProductRowActions/ProductRowActions';
import { getProducts } from '../../_queries/product';
import { useQuery } from '@tanstack/react-query';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import SearchBar from '../../_global/SearchBar/SearchBar';
import { Table } from '../../_global/Table/Table';
import { TableHead } from '../../_global/Table/TableHead/TableHead';
import { TableBody } from '../../_global/Table/TableBody/TableBody';
import Row from '../../_global/Table/Row/Row';
import { getDateTimeFromIsoStr } from '@ui/utils/dateTime';
import * as tableStyles from '@ui/styles/table.module.scss'
import * as sharedStyles from '@ui/styles/shared.module.scss'
import { IBaseProduct } from '../../../api/models/baseProduct';
import { TablePageHeader } from '../../_global/Table/TablePageHeader/TablePageHeader';
import { PageSelect } from '../../_global/Table/PageSelect/PageSelect';
const columnHelper = createColumnHelper<IBaseProduct>()

export const GET_PRODUCTS_QUERY_KEY = 'get-products'

const columns = [
  columnHelper.accessor('productNumber', {
    header: 'Product Number',
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
    cell: props => <ProductRowActions row={props.row} />
  })
];

export const ProductTable = () => {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [sorting, setSorting] = React.useState<SortingState>([])

  const { isError, data: products, error, isLoading } = useQuery({
    queryKey: [GET_PRODUCTS_QUERY_KEY],
    queryFn: getProducts,
    initialData: []
  })

  if (isError) {
    useErrorMessage(error)
  }

  const table = useReactTable({
    data: products,
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
    <div id='product-table-page-wrapper' className={sharedStyles.pageWrapper}>
      <div className={sharedStyles.card}>
      <TablePageHeader
          title="Products"
          createButton={{
            to: '/react-ui/forms/product',
            tooltip: 'Create a new product'
          }}
          totalResults={products?.totalResults || 0}
          currentResults={rows.length}
          searchValue={globalFilter}
          onSearch={(value: string) => {
            setGlobalFilter(value)
            table.resetPageIndex();
          }}
        />

        <Table id='product-table'>
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
};

export default ProductTable
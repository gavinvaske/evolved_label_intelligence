import * as React from 'react'
import './DeliveryMethodTable.scss'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table'
import { TableHead } from '../../_global/Table/TableHead/TableHead'
import { TableBody } from '../../_global/Table/TableBody/TableBody'
import { Table } from '../../_global/Table/Table'
import { DeliveryMethodRowActions } from './DeliveryMethodRowActions/DeliveryMethodRowActions'
import { getDeliveryMethods } from '../../_queries/deliveryMethod'
import { useQuery } from '@tanstack/react-query'
import { useErrorMessage } from '../../_hooks/useErrorMessage'
import { getDateTimeFromIsoStr } from '@ui/utils/dateTime.ts'
import * as tableStyles from '@ui/styles/table.module.scss'
import Row from '../../_global/Table/Row/Row'
import * as sharedStyles from '@ui/styles/shared.module.scss'

const columnHelper = createColumnHelper<any>()

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
    cell: props => <DeliveryMethodRowActions row={props.row} />
  })
];

function DeliveryMethodTable() {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([])

  const { isError, data: deliveryMethods, error } = useQuery({
    queryKey: ['get-delivery-methods'],
    queryFn: getDeliveryMethods,
    initialData: []
  })

  if (isError) {
    useErrorMessage(error)
  }

  const table = useReactTable({
    data: deliveryMethods,
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
      <div className='card'>
        <div className={tableStyles.headerDescription}>
          <h1 className="text-blue">Delivery Methods</h1>
          <p>Viewing <p className='text-blue'>{rows.length}</p> of <p className='text-blue'>{deliveryMethods?.length || 0}</p> results.</p>
        </div>

        <Table id='delivery-method-table'>
          <TableHead table={table} />

          <TableBody>
            {rows.map(row => (
              <Row row={row} key={row.id}></Row>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default DeliveryMethodTable;
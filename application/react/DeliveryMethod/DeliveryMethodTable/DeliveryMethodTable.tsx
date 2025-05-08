import * as React from 'react'
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
import Row from '../../_global/Table/Row/Row'
import * as sharedStyles from '@ui/styles/shared.module.scss'
import { IDeliveryMethod } from '@shared/types/models'
import { useConfirmation } from '../../_global/Modal/useConfirmation';
import { useMemo } from 'react'
import { TablePageHeader } from '../../_global/Table/TablePageHeader/TablePageHeader'

function DeliveryMethodTable() {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([])
  const columnHelper = createColumnHelper<IDeliveryMethod>()
  const defaultData = useMemo(() => [], []);
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
      cell: props => <DeliveryMethodRowActions row={props.row} confirmation={confirmation} />
    })
  ];

  const { isError, data: deliveryMethods, error } = useQuery({
    queryKey: ['get-delivery-methods'],
    queryFn: getDeliveryMethods,
    initialData: []
  })

  if (isError) {
    useErrorMessage(error)
  }

  const table = useReactTable({
    data: deliveryMethods || defaultData,
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
      <div className={sharedStyles.card}>
        <TablePageHeader
          title="Delivery Methods"
          createButton={{
            to: '/react-ui/forms/delivery-method',
            tooltip: 'Create a new delivery method'
          }}
          totalResults={deliveryMethods?.length || 0}
          currentResults={rows.length}
          searchValue={globalFilter}
          onSearch={(value: string) => {
            setGlobalFilter(value)
            table.resetPageIndex();
          }}
        />

        <Table id='delivery-method-table'>
          <TableHead table={table} />

          <TableBody>
            {rows.map(row => (
              <Row row={row} key={row.id}></Row>
            ))}
          </TableBody>
        </Table>
        <ConfirmationDialog />
      </div>
    </div>
  )
}

export default DeliveryMethodTable;
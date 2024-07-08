import React from 'react'
import { Row, RowData, flexRender } from '@tanstack/react-table'
import './Row.scss'

const Row = (props) => {
  const { row } : {row: Row<RowData>} = props;

  return (
    <div className='row row-body' key={row.id}>
      {row.getVisibleCells().map(cell => (
        <div className='row-cell' key={cell.id}>
          {
            flexRender(
              cell.column.columnDef.cell, 
              cell.getContext()
            )
          }
        </div>
      ))}
    </div>
  )
}

export default Row
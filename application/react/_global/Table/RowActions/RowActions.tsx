import React from 'react'
import { RxDotsVertical } from "react-icons/rx";
import './RowActions.scss';

export const RowActions = (props) => {
  const [isOpened, setIsOpened] = React.useState(false);
  const { children }: {children: React.ReactNode} = props;
  
  const toggleRowActions = () => setIsOpened(!isOpened)

  return (
    <div className='row-actions'>
      <div className={`dropdown-btn ${isOpened ? 'active' : ''}`} onClick={toggleRowActions}>
        <RxDotsVertical />
        <div className={`dropdown-options ${isOpened ? 'show' : ''}`}>
          { children }
        </div>
      </div>
    </div>
  )
}
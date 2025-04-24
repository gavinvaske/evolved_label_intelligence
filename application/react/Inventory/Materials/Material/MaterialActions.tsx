import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPenToSquare, FaEye } from 'react-icons/fa6';
import { BsPlusSlashMinus } from 'react-icons/bs';
import { IconButton } from '../../../_global/IconButton/IconButton';
import { Dropdown } from '../../../_global/Dropdown/Dropdown';
import { IMaterial } from '@shared/types/models';
import * as styles from './MaterialActions.module.scss';
import clsx from 'clsx';

interface MaterialActionsProps {
  material: IMaterial;
  numMaterialOrders: number;
  numLengthAdjustments: number;
}

export const MaterialActions: React.FC<MaterialActionsProps> = ({
  material,
  numMaterialOrders,
  numLengthAdjustments,
}) => {
  const navigate = useNavigate();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const viewButtonRef = useRef<HTMLDivElement>(null);
  const createButtonRef = useRef<HTMLDivElement>(null);

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsViewOpen(!isViewOpen);
  };

  const handleCreateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCreateOpen(!isCreateOpen);
  };

  const handleViewActionClick = (e: React.MouseEvent, action: (e: React.MouseEvent) => void) => {
    e.stopPropagation();
    action(e);
    setIsViewOpen(false);
  };

  const handleCreateActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setIsCreateOpen(false);
  };

  const viewActions = [
    {
      label: 'Orders',
      count: numMaterialOrders,
      onClick: () => navigate(`/react-ui/tables/material-order`, { state: { query: material.materialId } }),
      disabled: numMaterialOrders === 0,
    },
    {
      label: 'Length Adjustments',
      count: numLengthAdjustments,
      onClick: () => navigate(`/react-ui/tables/material-length-adjustment`, { state: { query: material.materialId } }),
      disabled: numLengthAdjustments === 0,
    },
  ];

  const createActions = [
    {
      label: 'Order',
      onClick: () => navigate(`/react-ui/forms/material-order`, { state: { material: material._id } }),
    },
    {
      label: 'Length Adjustment',
      onClick: () => navigate(`/react-ui/forms/material-length-adjustment`, { state: { material: material._id } }),
    },
  ];

  return (
    <div className={styles.actionsContainer}>
      <div className={styles.actionGroup} ref={viewButtonRef}>
        <IconButton
          icon={<FaEye />}
          tooltip="View Actions"
          onClick={handleViewClick}
          color="blue"
        />
        <Dropdown
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          align="right"
          triggerRef={viewButtonRef}
          className="actionDropdown"
        >
          {viewActions.map((action, index) => (
            <div
              key={index}
              className={clsx(styles.dropdownItem, action.disabled && styles.disabled)}
              onClick={(e) => !action.disabled && handleViewActionClick(e, action.onClick)}
            >
              <span className={styles.label}>View {action.label}</span>
              <span className={styles.count}>({action.count})</span>
            </div>
          ))}
        </Dropdown>
      </div>

      <div className={styles.actionGroup} ref={createButtonRef}>
        <IconButton
          icon={<BsPlusSlashMinus />}
          tooltip="Create Actions"
          onClick={handleCreateClick}
          color="green"
        />
        <Dropdown
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          align="right"
          triggerRef={createButtonRef}
          className="actionDropdown"
        >
          {createActions.map((action, index) => (
            <div
              key={index}
              className={styles.dropdownItem}
              onClick={(e) => handleCreateActionClick(e, action.onClick)}
            >
              <span className={styles.label}>Create {action.label}</span>
            </div>
          ))}
        </Dropdown>
      </div>

      <IconButton
        icon={<FaPenToSquare />}
        tooltip="Edit material details"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/react-ui/forms/material/${material._id}`);
        }}
        color="magenta"
      />
    </div>
  );
}; 
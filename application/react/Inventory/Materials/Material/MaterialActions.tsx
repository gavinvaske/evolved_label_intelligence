import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPenToSquare, FaEye } from 'react-icons/fa6';
import { BsPlusSlashMinus } from 'react-icons/bs';
import { IconButton } from '../../../_global/IconButton/IconButton';
import { IMaterial } from '@shared/types/models';
import styles from './MaterialActions.module.scss';
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
  };

  const handleCreateActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const viewActions = [
    {
      label: 'Material Orders',
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
      label: 'Material Order',
      onClick: () => navigate(`/react-ui/forms/material-order`, { state: { material: material._id } }),
    },
    {
      label: 'Length Adjustment',
      onClick: () => navigate(`/react-ui/forms/material-length-adjustment`, { state: { material: material._id } }),
    },
  ];

  return (
    <div className={styles.actionsContainer}>
      <div className={styles.actionGroup}>
        <IconButton
          icon={<FaEye />}
          tooltip="View Actions"
          onClick={handleViewClick}
          variant="blue"
        />
        {isViewOpen && (
          <div className={styles.dropdown}>
            {viewActions.map((action, index) => (
              <div
                key={index}
                className={clsx(styles.dropdownItem, action.disabled && styles.disabled)}
                onClick={(e) => !action.disabled && handleViewActionClick(e, action.onClick)}
              >
                <span className={styles.label}>View {action.label}</span>
                {action.count > 0 && <span className={styles.count}>({action.count})</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.actionGroup}>
        <IconButton
          icon={<BsPlusSlashMinus />}
          tooltip="Create Actions"
          onClick={handleCreateClick}
          variant="green"
        />
        {isCreateOpen && (
          <div className={styles.dropdown}>
            {createActions.map((action, index) => (
              <div
                key={index}
                className={styles.dropdownItem}
                onClick={(e) => handleCreateActionClick(e, action.onClick)}
              >
                <span className={styles.label}>Create {action.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <IconButton
        icon={<FaPenToSquare />}
        tooltip="Edit material details"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/react-ui/forms/material/${material._id}`);
        }}
        variant="magenta"
      />
    </div>
  );
}; 
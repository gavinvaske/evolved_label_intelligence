import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPenToSquare, FaEye } from 'react-icons/fa6';
import { BsPlusSlashMinus } from 'react-icons/bs';
import { IconButton } from '../../../_global/IconButton/IconButton';
import { IMaterial } from '../../../../types/material';
import styles from './MaterialActions.module.scss';

interface MaterialActionsProps {
  material: IMaterial;
  numMaterialOrders: number;
  numLengthAdjustments: number;
  showPurchaseOrderModal: (e: React.MouseEvent) => void;
  showLengthAdjustmentsModal: (e: React.MouseEvent) => void;
}

export const MaterialActions: React.FC<MaterialActionsProps> = ({
  material,
  numMaterialOrders,
  numLengthAdjustments,
  showPurchaseOrderModal,
  showLengthAdjustmentsModal,
}) => {
  const navigate = useNavigate();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const viewActions = [
    {
      label: 'Purchase Orders',
      icon: <div className={styles.poCounter}>{numMaterialOrders}</div>,
      onClick: (e: React.MouseEvent) => showPurchaseOrderModal(e),
      disabled: numMaterialOrders === 0,
      variant: 'green' as const,
    },
    {
      label: 'Length Adjustments',
      icon: <BsPlusSlashMinus />,
      onClick: (e: React.MouseEvent) => showLengthAdjustmentsModal(e),
      disabled: numLengthAdjustments === 0,
      variant: 'blue' as const,
    },
  ];

  const createActions = [
    {
      label: 'Purchase Order',
      icon: <FaPenToSquare />,
      onClick: () => navigate(`/react-ui/forms/material-order`, { state: { material: material._id } }),
      variant: 'darkGrey' as const,
    },
    {
      label: 'Length Adjustment',
      icon: <FaPenToSquare />,
      onClick: () => navigate(`/react-ui/forms/material-length-adjustment`, { state: { material: material._id } }),
      variant: 'purple' as const,
    },
  ];

  return (
    <div className={styles.actionsContainer}>
      <div className={styles.actionGroup}>
        <IconButton
          icon={<FaEye />}
          tooltip="View Actions"
          onClick={() => setIsViewOpen(!isViewOpen)}
          variant="blue"
        />
        {isViewOpen && (
          <div className={styles.dropdown}>
            {viewActions.map((action, index) => (
              <IconButton
                key={index}
                icon={action.icon}
                tooltip={action.disabled ? `No ${action.label}` : `View ${action.label}`}
                onClick={action.onClick}
                disabled={action.disabled}
                variant={action.variant}
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.actionGroup}>
        <IconButton
          icon={<FaPenToSquare />}
          tooltip="Create Actions"
          onClick={() => setIsCreateOpen(!isCreateOpen)}
          variant="green"
        />
        {isCreateOpen && (
          <div className={styles.dropdown}>
            {createActions.map((action, index) => (
              <IconButton
                key={index}
                icon={action.icon}
                tooltip={`Create ${action.label}`}
                onClick={action.onClick}
                variant={action.variant}
              />
            ))}
          </div>
        )}
      </div>

      <IconButton
        icon={<FaPenToSquare />}
        tooltip="Edit material details"
        onClick={() => navigate(`/react-ui/forms/material/${material._id}`)}
        variant="magenta"
      />
    </div>
  );
}; 
import React from 'react';
import { GoPlus } from "react-icons/go";
import { IconButton } from '../../IconButton/IconButton';
import SearchBar from '../../SearchBar/SearchBar';
import * as sharedStyles from '@ui/styles/shared.module.scss';
import * as styles from './TablePageHeader.module.scss';

interface TablePageHeaderProps {
  title: string;
  createButton?: {
    to: string;
    tooltip?: string;
  };
  totalResults?: number;
  currentResults?: number;
  searchValue: string;
  onSearch: (value: string) => void;
}

export const TablePageHeader: React.FC<TablePageHeaderProps> = ({ 
  title, 
  createButton,
  totalResults = 0,
  currentResults = 0,
  searchValue,
  onSearch
}) => {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.titleRow}>
        <h1 className={sharedStyles.textBlue}>{title}</h1>
        <p>Viewing <span className={sharedStyles.textBlue}>{currentResults}</span> of <span className={sharedStyles.textBlue}>{totalResults}</span> results.</p>
      </div>
      <div className={styles.controlsRow}>
        <SearchBar 
          value={searchValue} 
          performSearch={onSearch} 
        />
        {createButton && (
          <IconButton
            color="purple"
            to={createButton.to}
            tooltip={createButton.tooltip || `Create new ${title.toLowerCase()}`}
            icon={<GoPlus />}
            size="large"
            data-test="create-icon-button"
          />
        )}
      </div>
    </div>
  );
}; 
import { useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ConditionalFilter, ConditionalFilterFunction, Filter, TextFilter, TextFilterOption } from "@ui/types/filters";
import { ConditionalQuickFilter } from '../QuickFilterModal/ConditionalQuickFilter/ConditionalQuickFilter';
import { TextQuickFilter } from '../QuickFilterModal/TextQuickFilter/QuickFilterButton';
import SearchBar from '../SearchBar/SearchBar';
import clsx from 'clsx';
import * as flexboxStyles from '@ui/styles/flexbox.module.scss'
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as styles from './FilterBar.module.scss';
import { FaChevronDown } from "react-icons/fa6";
import { VscFilter } from "react-icons/vsc";
import { TbZoomReset } from "react-icons/tb";

import { TfiClose } from "react-icons/tfi";
import { SlMagnifier } from "react-icons/sl";
import inventoryStore from '../../stores/inventoryStore';
import { Button } from '../Button/Button';
import { Dropdown } from '../Dropdown/Dropdown';

const renderTextQuickFilters = <T extends any>(textQuickFilters: TextFilter[], store: Filter<T>) => {
  return (
    textQuickFilters.map((quickFilter: TextFilter) => {
      const { description, options } = quickFilter;
      return (
        <div className={styles.filterSection}>
          <span className={styles.filterDescription}>{description}</span>
          {options.map((option: TextFilterOption) => (
            <TextQuickFilter
              uuid={option.uuid}
              filterValue={option.value}
              onDisabled={(uuid) => store.removeTextQuickFilter(uuid)}
              onEnabled={(uuid, filterValue) => store.setTextQuickFilter(uuid, filterValue)}
              key={option.uuid}
              filtersStore={store}
            />
          ))}
        </div>)
    })
  )
}

const renderConditionalQuickFilters = <T extends any>(conditionalFilterFunctions: ConditionalFilter<T>[], store: Filter<T>) => {
  return (
    conditionalFilterFunctions.map((filterFunction: ConditionalFilter<T>) => {
      const { uuid, textToDisplay, conditionalFilter } = filterFunction;
      return (
        <div>
          <ConditionalQuickFilter
            uuid={uuid}
            conditionalFilterFunction={conditionalFilter}
            textToDisplay={textToDisplay}
            onDisabled={(uuid: string) => store.removeConditionalFilter(uuid)}
            onEnabled={(uuid: string, conditionalFilterFunction: ConditionalFilterFunction<T>) => store.setConditionalQuickFilter(uuid, conditionalFilterFunction)}
            key={uuid}
            filtersStore={store}
          />
        </div>)
    })
  )
}

type Props<T> = {
  conditionalQuickFilters: ConditionalFilter<T>[];
  textQuickFilters: TextFilter[];
  store: Filter<T>
  filterableItemsCount: number
}

export const FilterBar = observer(<T extends any>(props: Props<T>) => {
  const { conditionalQuickFilters, textQuickFilters, store, filterableItemsCount } = props
  const [isDropdownDisplayed, setIsDropdownDisplayed] = useState(false)
  const [isAdvancedDropdownDisplayed, setIsAdvancedDropdownDisplayed] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  const quickFilterButtonRef = useRef<HTMLButtonElement>(null);
  const advancedFilterButtonRef = useRef<HTMLButtonElement>(null);

  function toggleQuickFilterMenu() {
    setIsAdvancedDropdownDisplayed(false);
    setIsDropdownDisplayed(!isDropdownDisplayed);
  }

  function toggleAdvancedQuickFilterMenu() {
    setIsDropdownDisplayed(false);
    setIsAdvancedDropdownDisplayed(!isAdvancedDropdownDisplayed);
  }

  function toggleSearchActive() {
    if (ref.current) {
      ref.current.focus();
    }
  }

  function clearSearchBar(e: React.MouseEvent) {
    store.setSearchBarInput('')
    if (ref.current) {
      ref.current.value = '';
    }
    setIsSearchFocused(false)
    setIsDropdownDisplayed(false)
    setIsAdvancedDropdownDisplayed(false)
    e.stopPropagation();
  }

  return (
    <>
      <div className={clsx(styles.searchWrapper, flexboxStyles.flexCenterLeftRow, store.getSearchBarInput() && styles.hasText, isSearchFocused && styles.active)} onClick={toggleSearchActive}>
        <div>
          <SlMagnifier />
        </div>
        <SearchBar
          ref={ref}
          value={store.getSearchBarInput()}
          performSearch={(userInput: string) => store.setSearchBarInput(userInput)}
          instantSearch={true}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        <div>
          <TfiClose
            className={clsx(styles.clearButton, isSearchFocused && styles.active)}
            onClick={(e) => clearSearchBar(e)}
          />
        </div>
      </div>

      <div className={clsx(flexboxStyles.flexCenterCenterRow)} style={{ gap: '10px' }}>
        <div className={clsx(styles.filterWrapper)}>
          <div className={clsx(flexboxStyles.flexCenterCenterRow)} style={{ gap: '10px' }}>
            <Button
              variant="action"
              style="white"
              onClick={() => toggleQuickFilterMenu()}
              icon={<VscFilter />}
              ref={quickFilterButtonRef}
            >
              Quick Filters
            </Button>
            <Button 
              variant="action"
              style="white"
              onClick={() => toggleAdvancedQuickFilterMenu()}
              icon={<FaChevronDown />}
              ref={advancedFilterButtonRef}
            >
              Advanced Filters
            </Button>
          </div>
          <Dropdown
            isOpen={isDropdownDisplayed}
            onClose={() => setIsDropdownDisplayed(false)}
            triggerRef={quickFilterButtonRef}
          >
            <div className={styles.dropdownContent}>
              <h5 className={styles.dropdownTitle}>Quick filters</h5>
              {renderTextQuickFilters(textQuickFilters, store)}
            </div>
          </Dropdown>

          <Dropdown
            isOpen={isAdvancedDropdownDisplayed}
            onClose={() => setIsAdvancedDropdownDisplayed(false)}
            align="right"
            triggerRef={advancedFilterButtonRef}
          >
            <div className={styles.dropdownContent}>
              <h5 className={styles.dropdownTitle}>Advanced Filter</h5>
              {renderConditionalQuickFilters(conditionalQuickFilters, store)}
            </div>
          </Dropdown>
        </div>

        <div className={clsx(sharedStyles.tooltipTop)}>
          <span className={clsx(sharedStyles.tooltipText)}>See all materials</span>
          <Button
            variant="action"
            style="white"
            icon={<TbZoomReset />}
            onClick={(e) => {
              store.resetAllFilters();
              clearSearchBar(e);
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>
      <div className={styles.viewingResults}>
        Viewing <span className={sharedStyles.textBlue}>{inventoryStore.getFilteredMaterials().length}</span> of <span className={sharedStyles.textBlue}>{filterableItemsCount}</span> results.
      </div>
    </>
  );
})
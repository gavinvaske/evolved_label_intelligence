import { useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Filter } from "@ui/types/filters";
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
import { QuickSearchDropdown } from './QuickSearchDropdown/QuickSearchDropdown';
import { AdvancedFilterDropdown } from './AdvancedFilterDropdown/AdvancedFilterDropdown';

type Props<T> = {
  store: Filter<T>
  filterableItemsCount: number
}

export const FilterBar = observer(<T extends any>(props: Props<T>) => {
  const { store, filterableItemsCount } = props
  const [isDropdownDisplayed, setIsDropdownDisplayed] = useState(false)
  const [isAdvancedDropdownDisplayed, setIsAdvancedDropdownDisplayed] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  const quickSearchButtonRef = useRef<HTMLButtonElement>(null);
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
              color="white"
              onClick={() => toggleQuickFilterMenu()}
              icon={<VscFilter />}
              ref={quickSearchButtonRef}
            >
              Quick Search <span 
                className={styles.filterBadge} 
                data-has-filters={Object.keys(store.getTextFilters() || {}).length > 0}
              >
                {Object.keys(store.getTextFilters() || {}).length}
              </span>
            </Button>
            <Button
              color="white"
              onClick={() => toggleAdvancedQuickFilterMenu()}
              icon={<FaChevronDown />}
              ref={advancedFilterButtonRef}
            >
              Advanced Filters <span 
                className={styles.filterBadge}
                data-has-filters={Object.keys(store.getConditionalFilters() || {}).length > 0}
              >
                {Object.keys(store.getConditionalFilters() || {}).length}
              </span>
            </Button>
          </div>
          {/* Display the quick search dropdown */}
          <QuickSearchDropdown
            isOpen={isDropdownDisplayed}
            setIsOpen={setIsDropdownDisplayed}
            triggerRef={quickSearchButtonRef}
          />
          {/* Display the advanced filter dropdown */}
          <AdvancedFilterDropdown
            isOpen={isAdvancedDropdownDisplayed}
            setIsOpen={setIsAdvancedDropdownDisplayed}
            triggerRef={advancedFilterButtonRef}
          />
        </div>

        <div className={clsx(sharedStyles.tooltipTop)}>
          <span className={clsx(sharedStyles.tooltipText)}>See all materials</span>
          <Button
            color="white"
            icon={<TbZoomReset />}
            onClick={(e) => {
              store.resetAllFilters();
              clearSearchBar(e);
            }}
            data-test='clear-filters-button'
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
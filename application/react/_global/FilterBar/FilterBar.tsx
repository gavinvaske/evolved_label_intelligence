import { useRef, useState } from 'react';
import './FilterBar.scss';
import { observer } from 'mobx-react-lite';
import { ConditionalFilter, ConditionalFilterFunction, Filter, TextFilter, TextFilterOption } from "@ui/types/filters";
import { ConditionalQuickFilter } from '../QuickFilterModal/ConditionalQuickFilter/ConditionalQuickFilter';
import { TextQuickFilter } from '../QuickFilterModal/TextQuickFilter/QuickFilterButton';
import SearchBar from '../SearchBar/SearchBar';
import clsx from 'clsx';
import * as flexboxStyles from '@ui/styles/flexbox.module.scss'
import * as sharedStyles from '@ui/styles/shared.module.scss'

const renderTextQuickFilters = <T extends any>(textQuickFilters: TextFilter[], store: Filter<T>) => {
  return (
    textQuickFilters.map((quickFilter: TextFilter) => {
      const { description, options } = quickFilter;
      return (
        <div className={clsx('quick-filters-list')}>
          <span className={clsx('filter-description')}>Description: {description}</span>
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
        <div className={clsx('quick-conditional-filters-list')}>
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
  const [isSearchBarActive, setIsSearchBarActive] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  function toggleQuickFilterMenu() {
    setIsAdvancedDropdownDisplayed(false)
    setIsDropdownDisplayed(!isDropdownDisplayed)
  }

  function toggleAdvancedQuickFilterMenu() {
    setIsDropdownDisplayed(false)
    setIsAdvancedDropdownDisplayed(!isAdvancedDropdownDisplayed)
  }

  function toggleSearchActive() {
    setIsSearchBarActive(!isSearchBarActive)
    if (ref.current) {
      ref.current.focus();
    }
  }

  return (
    <>
      <div className={clsx('search-wrapper', flexboxStyles.flexCenterLeftRow, store.getSearchBarInput() && 'has-text', isSearchBarActive && 'active')} onClick={toggleSearchActive}>
        <i className={clsx('fa-regular', 'fa-magnifying-glass', flexboxStyles.flexCenterCenterRow)}></i>
        <SearchBar
          ref={ref}
          value={store.getSearchBarInput()}
          performSearch={(userInput: string) => store.setSearchBarInput(userInput)}
          instantSearch={true}
        />
        <i className={clsx('fa-light', 'fa-xmark')} onClick={() => store.resetAllFilters()}></i>
      </div>

      <div className={clsx('split-btn-frame', 'btn-filter', flexboxStyles.flexCenterCenterRow, sharedStyles.tooltipTop)}>
        <span className={clsx(sharedStyles.tooltipText)}>Filter materials</span>
        <div className={clsx('filter-btn-wrapper', flexboxStyles.flexCenterCenterRow, (isDropdownDisplayed || isAdvancedDropdownDisplayed) && 'active')}>
          <button className={clsx('btn-split', 'quick-filter', flexboxStyles.flexCenterCenterRow)} onClick={() => toggleQuickFilterMenu()}>
            <i className={clsx('fa-light', 'fa-filter')}></i>Filter
          </button>
          <button className={clsx('btn-split-arrow-dropdown', 'btn-advanced-filter')} onClick={() => toggleAdvancedQuickFilterMenu()}>
            <i className={clsx('fa-regular', 'fa-chevron-down')}></i>
          </button>
        </div>
        <div className={clsx('quick-filter-dropdown', 'quick-filter-drpdwn', 'dropdown', isDropdownDisplayed && 'active')}>
          <h5><b>Quick filters</b></h5>
          {renderTextQuickFilters(textQuickFilters, store)}
        </div>

        <div className={clsx('advanced-filter-dropdown', 'dropdown', isAdvancedDropdownDisplayed && 'active')}>
          <h5><b>Advanced Filter</b></h5>
          {renderConditionalQuickFilters(conditionalQuickFilters, store)}
        </div>

      </div>
      <div className={clsx('all-wrapper', sharedStyles.tooltipTop)}>
        <span className={clsx(sharedStyles.tooltipText)}>See all materials</span>
        <button className={clsx('sort', 'btn-sort', 'see-all')} onClick={() => store.resetAllFilters()}>
          <i className={clsx('fa-solid', 'fa-layer-group')}></i> See All ({<span>{filterableItemsCount}</span>})
        </button>
      </div>
    </>
  );
})
import { Dropdown } from "../../Dropdown/Dropdown"
import * as styles from './QuickSearchDropdown.module.scss'
import inventoryStore from '../../../stores/inventoryStore';
import { QuickSearchDropdownOption } from '../QuickSearchDropdown/QuickSearchDropdownOption/QuickSearchDropdownOption';
import { Filter, TextFilter, TextFilterOption } from "@ui/types/filters";
import { v4 as uuidv4 } from 'uuid';

interface Props {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement>
}

export const QuickSearchDropdown = (props: Props) => {
  const { isOpen, setIsOpen, triggerRef } = props
  return (
    <Dropdown
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      triggerRef={triggerRef}
    >
      <div className={styles.dropdownContent}>
        <h5 className={styles.dropdownTitle}>Quick Search</h5>
        {renderTextQuickFilters(textQuickFilters, inventoryStore)}
      </div>
    </Dropdown>
  )
}

const renderTextQuickFilters = <T extends any>(textQuickFilters: TextFilter[], store: Filter<T>) => {
  return (
    textQuickFilters.map((quickFilter: TextFilter) => {
      const { description, options } = quickFilter;
      return (
        <div className={styles.filterSection}>
          <span className={styles.filterDescription}>{description}</span>
          <div className={styles.filterOptions}>
            {options.map((option: TextFilterOption) => (
              <QuickSearchDropdownOption
                uuid={option.uuid}
                filterValue={option.value}
                onDisabled={(uuid) => store.removeTextQuickFilter(uuid)}
                onEnabled={(uuid, filterValue) => store.setTextQuickFilter(uuid, filterValue)}
                key={option.uuid}
                filtersStore={store}
              />
            ))}
          </div>
        </div>)
    })
  )
}

const textQuickFilters: TextFilter[] = [
  {
    description: 'Vendors',
    options: [
      {
        uuid: uuidv4(),
        value: 'hy-vee'
      },
      {
        uuid: uuidv4(),
        value: 'walmart'
      },
      {
        uuid: uuidv4(),
        value: 'cpg'
      },
    ]
  },
  {
    description: 'Material Category',
    options: [
      {
        uuid: uuidv4(),
        value: 'test'
      },
      {
        uuid: uuidv4(),
        value: 'cardboard'
      },
      {
        uuid: uuidv4(),
        value: 'plastic'
      },
    ]
  },
  {
    description: 'Liner Type',
    options: [
      {
        uuid: uuidv4(),
        value: 'test'
      },
      {
        uuid: uuidv4(),
        value: 'AAA'
      },
      {
        uuid: uuidv4(),
        value: 'FFF'
      },
    ]
  }
]
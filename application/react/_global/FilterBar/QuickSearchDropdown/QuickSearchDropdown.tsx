import { Dropdown } from "../../Dropdown/Dropdown"
import * as styles from './QuickSearchDropdown.module.scss'
import inventoryStore from '../../../stores/inventoryStore';
import { TextQuickFilter } from '../../QuickFilterModal/TextQuickFilter/QuickFilterButton';
import { Filter, TextFilter, TextFilterOption } from "@ui/types/filters";
import { v4 as uuidv4 } from 'uuid';

interface Props {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement>
}

export const QuickSearchDropdown = (props: Props) => {
  const {isOpen,  setIsOpen, triggerRef} = props
  return (
    <Dropdown
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    triggerRef={triggerRef}
  >
    <div className={styles.dropdownContent}>
      <h5 className={styles.dropdownTitle}>Quick filters</h5>
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
              <TextQuickFilter
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

export const textQuickFilters: TextFilter[] = [
  {
    description: 'materials',
    options: [
      {
        uuid: uuidv4(),
        value: 'semi-gloss'
      },
      {
        uuid: uuidv4(),
        value: 'matte'
      },
    ]
  },
  {
    description: 'Foo',
    options: [
      {
        uuid: uuidv4(),
        value: 'bar'
      },
    ]
  }
]
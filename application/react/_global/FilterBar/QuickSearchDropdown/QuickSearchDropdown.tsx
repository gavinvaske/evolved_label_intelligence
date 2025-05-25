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
      options.sort((a, b) => a.value.localeCompare(b.value)); // Sort options alphabetically
      return (
        <div className={styles.filterSection}>
          <span className={styles.filterDescription}>{description}</span>
          <div className={styles.filterOptions}>
            {options.map((option: TextFilterOption) => (
              <QuickSearchDropdownOption
                uuid={option.uuid}
                filterValue={option.value}
                onDisabled={(uuid) => store.removeTextFilter(uuid)}
                onEnabled={(uuid, filterValue) => store.setTextFilter(uuid, filterValue)}
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
        value: 'Avery Dennison'
      },
      {
        uuid: uuidv4(),
        value: 'Technicote'
      },
      {
        uuid: uuidv4(),
        value: '3M'
      },
      {
        uuid: uuidv4(),
        value: 'Rexam'
      },
      {
        uuid: uuidv4(),
        value: 'Bemis'
      },
      {
        uuid: uuidv4(),
        value: 'UPM Raflatac'
      },
    ]
  },
  {
    description: 'Material Category',
    options: [
      {
        uuid: uuidv4(),
        value: 'Specialty'
      },
      {
        uuid: uuidv4(),
        value: 'Film'
      },
      {
        uuid: uuidv4(),
        value: 'Thermal'
      },
      {
        uuid: uuidv4(),
        value: 'Paper'
      },
      {
        uuid: uuidv4(),
        value: 'Vinyl'
      },
      {
        uuid: uuidv4(),
        value: 'Polyester'
      }
    ]
  },
  {
    description: 'Liner Type',
    options: [
      {
        uuid: uuidv4(),
        value: 'Matte'
      },
      {
        uuid: uuidv4(),
        value: 'Gloss'
      },
      {
        uuid: uuidv4(),
        value: 'UV'
      },
      {
        uuid: uuidv4(),
        value: 'BOPP'
      },
      {
        uuid: uuidv4(),
        value: 'PET'
      },
      {
        uuid: uuidv4(),
        value: 'Polyester'
      },
      {
        uuid: uuidv4(),
        value: 'Kraft'
      },
      {
        uuid: uuidv4(),
        value: 'Glassine'
      }
    ]
  },
  {
    description: 'Adhesive Category',
    options: [
      {
        uuid: uuidv4(),
        value: 'Medical'
      },
      {
        uuid: uuidv4(),
        value: 'Hot'
      },
      {
        uuid: uuidv4(),
        value: 'Cold'
      },
      {
        uuid: uuidv4(),
        value: 'Removable'
      }
    ]
  }
]
import { Dropdown } from "../../Dropdown/Dropdown"
import * as styles from './AdvancedFilterDropdown.module.scss'
import { ConditionalFilter, ConditionalFilterOption, Filter } from "@ui/types/filters"
import { ConditionalFilterDropdownOption } from "./ConditionalFilterDropdownOption/ConditionalFilterDropdownOption"
import inventoryStore from "../../../stores/inventoryStore"
import { v4 as uuidv4 } from 'uuid';
import { IMaterial } from "@shared/types/models"

interface Props {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement>
}

export const AdvancedFilterDropdown = (props: Props) => {
  const { isOpen, setIsOpen, triggerRef } = props
  return (
    <Dropdown
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      align="right"
      triggerRef={triggerRef}
    >
      <div className={styles.dropdownContent}>
        <h5 className={styles.dropdownTitle}>Advanced Filter</h5>
        {renderConditionalQuickFilters(conditionalQuickFilters, inventoryStore)}
      </div>
    </Dropdown>
  )
}

const renderConditionalQuickFilters = <T extends any>(conditionalFilters: ConditionalFilter<T>[], store: Filter<T>) => {
  return (
    conditionalFilters.map((filterGroup: ConditionalFilter<T>) => {
      const { description, options } = filterGroup

      return (
        <div className={styles.filterSection}>
          <span className={styles.filterDescription}>{description}</span>
          <div className={styles.filterOptions}>
            {options.map((option: ConditionalFilterOption<T>) => (
              <ConditionalFilterDropdownOption
                uuid={option.uuid}
                conditionalFilterFunction={option.conditionalFilter}
                textToDisplay={option.textToDisplay}
                onDisabled={(uuid) => store.removeConditionalFilter(uuid)}
                onEnabled={(uuid, conditionalFilterFunction) => store.setConditionalFilter(uuid, conditionalFilterFunction)}
                key={option.uuid}
                filtersStore={store}
              />
            ))}
          </div>
        </div>)
    })
  )
}

const conditionalQuickFilters: ConditionalFilter<IMaterial>[] = [
  {
    description: "Stock Status",
    options: [
      {
        uuid: uuidv4(),
        textToDisplay: 'Available to Use',
        conditionalFilter: (materials: Partial<IMaterial>[]) => {
          return materials.filter((material) => {
            return material?.inventory?.netLengthAvailable && material?.inventory?.netLengthAvailable > 0
          })
        }
      },
      {
        uuid: uuidv4(),
        textToDisplay: 'Negative Net Inventory',
        conditionalFilter: (materials: Partial<IMaterial>[]) => {
          return materials.filter((material) => {
            return material?.inventory?.netLengthAvailable && material?.inventory?.netLengthAvailable < 0
          })
        }
      }
    ]
  },
  {
    description: "Widths",
    options: [
      {
        uuid: uuidv4(),
        textToDisplay: 'Large (>10)',
        conditionalFilter: (materials: Partial<IMaterial>[]) => {
          return materials.filter((material) => {
            return material?.width && material?.width > 10
          })
        }
      },
      {
        uuid: uuidv4(),
        textToDisplay: 'Small (<10)',
        conditionalFilter: (materials: Partial<IMaterial>[]) => {
          return materials.filter((material) => {
            return material?.width && material?.width < 10
          })
        }
      }
    ]
  }
]
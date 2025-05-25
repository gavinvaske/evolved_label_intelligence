import { Dropdown } from "../../Dropdown/Dropdown"
import * as styles from './AdvancedFilterDropdown.module.scss'
import { ConditionalFilter, ConditionalFilterOption, Filter } from "@ui/types/filters"
import { ConditionalFilterDropdownOption } from "./ConditionalFilterDropdownOption/ConditionalFilterDropdownOption"
import inventoryStore from "../../../stores/inventoryStore"
import { v4 as uuidv4 } from 'uuid';
import { IMaterial } from "@shared/types/models"
import { isInventoryLevelCritical, isInventoryLevelLow } from "../../../Inventory/Materials/Material/MaterialCard"

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
    description: 'Inventory Levels',
    options: [
      {
        uuid: uuidv4(),
        textToDisplay: 'Critical',
        conditionalFilter: (materials: Partial<IMaterial>[]) => {
          return materials.filter((material) => {
            return isInventoryLevelCritical(material as IMaterial)
          })
        }
      },
      {
        uuid: uuidv4(),
        textToDisplay: 'Warning',
        conditionalFilter: (materials: Partial<IMaterial>[]) => {
          return materials.filter((material) => {
            return isInventoryLevelLow(material as IMaterial)
          })
        }
      },
      {
        uuid: uuidv4(),
        textToDisplay: 'Good',
        conditionalFilter: (materials: Partial<IMaterial>[]) => {
          return materials.filter((material) => {
            return !isInventoryLevelCritical(material as IMaterial) && !isInventoryLevelLow(material as IMaterial)
          })
        }
      }
    ]
  },
  {
    description: "Thickness",
    options: [
      {
        uuid: uuidv4(),
        textToDisplay: '1-2 mils',
        conditionalFilter: (materials: Partial<IMaterial>[]) => {
          return materials.filter((material) => {
            return material?.thickness && material?.thickness >= 1 && material?.thickness <= 2
          })
        }
      },
      {
        uuid: uuidv4(),
        textToDisplay: '2-3 mils',
        conditionalFilter: (materials: Partial<IMaterial>[]) => {
          return materials.filter((material) => {
            return material?.thickness && material?.thickness >= 2 && material?.thickness <= 3
          })
        }
      },
      {
        uuid: uuidv4(),
        textToDisplay: '3-4 mils',
        conditionalFilter: (materials: Partial<IMaterial>[]) => {
          return materials.filter((material) => {
            return material?.thickness && material?.thickness >= 3 && material?.thickness <= 4
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
        textToDisplay: 'Large (>=6")',
        conditionalFilter: (materials: Partial<IMaterial>[]) => {
          return materials.filter((material) => {
            return material?.width && material?.width >= 6
          })
        }
      },
      {
        uuid: uuidv4(),
        textToDisplay: 'Small (<6")',
        conditionalFilter: (materials: Partial<IMaterial>[]) => {
          return materials.filter((material) => {
            return material?.width && material?.width < 6
          })
        }
      }
    ]
  }
]
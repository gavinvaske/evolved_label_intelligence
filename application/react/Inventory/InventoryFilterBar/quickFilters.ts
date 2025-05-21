import { ConditionalFilter } from "@ui/types/filters";
import { v4 as uuidv4 } from 'uuid';
import { IMaterial } from '@shared/types/models';

export const conditionalQuickFilters: ConditionalFilter<IMaterial>[] = [
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
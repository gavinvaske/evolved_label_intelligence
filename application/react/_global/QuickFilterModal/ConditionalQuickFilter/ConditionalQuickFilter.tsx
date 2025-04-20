import { observer } from 'mobx-react-lite';
import { ConditionalFilterFunction } from "@ui/types/filters";
import { Button } from '../../Button/Button';
import * as styles from './ConditionalQuickFilter.module.scss';

type Props<T> = {
  uuid: string,
  textToDisplay: string,
  conditionalFilterFunction: (objects: Partial<T>[]) => Partial<T>[],
  onEnabled: (
    uuid: string,
    conditionalFilterFunction: ConditionalFilterFunction<T>
  ) => void,
  onDisabled: (uuid: string) => void,
  filtersStore: any
}

export const ConditionalQuickFilter = observer(<T extends any>(props: Props<T>) => {
  const { uuid, conditionalFilterFunction, textToDisplay, onEnabled, onDisabled, filtersStore } = props;

  const enabledConditionalFilters = filtersStore.getConditionalQuickFilters();

  function isEnabled(): boolean {
    return Boolean(enabledConditionalFilters[uuid])
  }

  function onClick() {
    const needsToBecomeEnabled = !isEnabled();

    if (needsToBecomeEnabled) onEnabled(uuid, conditionalFilterFunction)
    else onDisabled(uuid)
  }

  return (
    <Button
      variant="action"
      style={isEnabled() ? "default" : "white"}
      onClick={onClick}
      className={styles.filterButton}
    >
      {textToDisplay}
    </Button>
  )
});
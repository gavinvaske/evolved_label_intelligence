import { observer } from 'mobx-react-lite';
import { ConditionalFilterFunction } from "@ui/types/filters";
import { Button } from '../../../Button/Button';

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

export const ConditionalFilterDropdownOption = observer(<T extends any>(props: Props<T>) => {
  const { uuid, conditionalFilterFunction, textToDisplay, onEnabled, onDisabled, filtersStore } = props;

  const enabledConditionalFilters = filtersStore.getConditionalFilters();

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
      color='white'
      onClick={onClick}
      enabled={isEnabled()}
    >
      {textToDisplay}
    </Button>
  )
});
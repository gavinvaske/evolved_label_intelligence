import { observer } from 'mobx-react-lite';
import { Button } from '../../Button/Button';

type Props = {
  uuid: string,
  filterValue: string,
  onEnabled: (uuid: string, filter: string) => void,
  onDisabled: (uuid: string) => void,
  filtersStore: any
}

export const TextQuickFilter = observer((props: Props) => {
  const { uuid, filterValue, onEnabled, onDisabled, filtersStore } = props;

  const enabledQuickFilters = filtersStore.getTextQuickFilters();

  function isEnabled(): boolean {
    return Boolean(enabledQuickFilters[uuid])
  }

  function onClick() {
    const needsToBecomeEnabled = !isEnabled();

    if (needsToBecomeEnabled) onEnabled(uuid, filterValue)
    else onDisabled(uuid)
  }

  return (
    <Button
      color='white'
      onClick={onClick}
      enabled={isEnabled()}
    >
      {filterValue}
    </Button>
  )
});
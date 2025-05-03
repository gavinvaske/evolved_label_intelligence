import axios from 'axios';
import { useSuccessMessage } from '../_hooks/useSuccessMessage';
import { useErrorMessage } from '../_hooks/useErrorMessage';
import { Button } from '../_global/Button/Button';
import * as sharedStyles from '@ui/styles/shared.module.scss';

export const AdminPanel = () => {
  function calculateInventory() {
    axios.get('/materials/recalculate-inventory')
      .then(() => useSuccessMessage('Inventory successfully calculated!'))
      .catch((error) => useErrorMessage(new Error(`Error calculating inventory: ${error.message}`)))
  }

  return (
    <div className={sharedStyles.pageWrapper}>
      <h2>Admin Panel</h2>
      <div>
        <Button color='blue' size='large' onClick={calculateInventory}>Force Inventory Recalculation</Button>
      </div>

    </div>
  )
};

export default AdminPanel;
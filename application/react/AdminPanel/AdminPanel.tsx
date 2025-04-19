import axios from 'axios';
import { useSuccessMessage } from '../_hooks/useSuccessMessage';
import { useErrorMessage } from '../_hooks/useErrorMessage';
import { useNavigate } from 'react-router-dom';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as styles from './AdminPanel.module.scss';

export const AdminPanel = () => {
  const navigate = useNavigate();
  
  function calculateInventory() {
    axios.get('/materials/recalculate-inventory')
      .then(() => useSuccessMessage('Inventory successfully calculated!'))
      .catch((error) => useErrorMessage(new Error(`Error calculating inventory: ${error.message}`)))
  }

  return (
    <div className={styles.pageWrapper}>
      <h2>Admin Panel</h2>
      <div>
        <button className={sharedStyles.submitButton} onClick={calculateInventory}>Force Inventory Recalculation</button>
      </div>

    </div>
  )
};

export default AdminPanel;
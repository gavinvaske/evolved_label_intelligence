import axios from 'axios';
import * as styles from './AdminPanel.module.scss';
import { useSuccessMessage } from '../_hooks/useSuccessMessage';
import { useErrorMessage } from '../_hooks/useErrorMessage';
import { useNavigate } from 'react-router-dom';
import * as sharedStyles from '@ui/styles/shared.module.scss'

export const AdminPanel = () => {
  const navigate = useNavigate();
  
  function calculateInventory() {
    axios.get('/materials/recalculate-inventory')
      .then(() => useSuccessMessage('Inventory successfully calculated!'))
      .catch((error) => useErrorMessage(new Error(`Error calculating inventory: ${error.message}`)))
  }

  return (
    <div className={styles.adminPanel}>
      <h2>Admin Panel</h2>
      <div>
        <button className={sharedStyles.submitButton} onClick={calculateInventory}>Force Inventory Recalculation</button>
        <button className={sharedStyles.submitButton} onClick={() => navigate('/react-ui/tables/user')}>View Users</button>
      </div>

    </div>
  )
};

export default AdminPanel;
import React from 'react'
import axios from 'axios';
import './AdminPanel.scss';
import { useSuccessMessage } from '../_hooks/useSuccessMessage';
import { useErrorMessage } from '../_hooks/useErrorMessage';
import { useNavigate } from 'react-router-dom';

export const AdminPanel = () => {
  const navigate = useNavigate();
  
  function calculateInventory() {
    axios.get('/materials/recalculate-inventory')
      .then(() => useSuccessMessage('Inventory successfully calculated!'))
      .catch((error) => useErrorMessage(new Error(`Error calculating inventory: ${error.message}`)))
  }

  return (
    <div id='admin-panel'>
      <h2>Admin Panel</h2>
      <div>
        <button className='submit-button' onClick={calculateInventory}>Force Inventory Recalculation</button>
        <button className='submit-button' onClick={() => navigate('/react-ui/tables/user')}>View Users</button>
      </div>

    </div>
  )
};

export default AdminPanel;
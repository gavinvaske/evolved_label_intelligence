import { Outlet } from 'react-router-dom';
import { Navbar } from '../Navbars/Navbar/Navbar';

export const TopNavbarLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
};

export default TopNavbarLayout;
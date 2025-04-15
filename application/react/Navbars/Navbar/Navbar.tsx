import { useState } from 'react';
import './Navbar.scss';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Image } from '../../_global/Image/Image';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { useLoggedInUser } from '../../_hooks/useLoggedInUser';
import { AuthRoles } from '@shared/enums/auth';
import * as flexboxStyles from '@ui/styles/flexbox.module.scss'
import clsx from 'clsx';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as styles from './Navbar.module.scss';

export const Navbar = () => {
  const navigate = useNavigate();
  const [isUserOptionsDropdownDisplayed, setIsUserOptionsDropdownDisplayed] = useState(false)

  const { user, error } = useLoggedInUser()
  const profilePictureUrl = `data:image/${user?.profilePicture?.contentType};base64,${user?.profilePicture?.data.toString('base64')}`

  if (error) {
    useErrorMessage(error);
  }

  const logoutUser = async () => {
    await axios.get('/auth/logout');
    navigate('/react-ui/login', { replace: true });
  }

  function toggleUserOptionsDrpdwnMenu() {
    setIsUserOptionsDropdownDisplayed(!isUserOptionsDropdownDisplayed)
  }

  return (
    <nav className={styles.navbarMain}>
      <div className={clsx(styles.column, styles.columnLeft)}>
        <div className={flexboxStyles.flexCenterCenterRow} onClick={() => navigate('/react-ui/inventory')} style={{ cursor: 'pointer' }}>
          <NavbarSvgIcon />
          Eli
        </div>
      </div>
      <div className={clsx(styles.column, styles.columnCenter)}>
        <ul className={clsx(sharedStyles.fullWidth, flexboxStyles.flexCenterCenterRow)}>
          <li className={styles.navbarLinks}>
            <NavLink className={({ isActive }) =>
              clsx(
                flexboxStyles.flexCenterCenterRow,
                isActive && styles.active
              )} to='/react-ui/production'>
              <i className="fa-regular fa-table-tree"></i>
              Production
            </NavLink>
          </li>
          <li className={clsx(styles.navbarLinks, styles.materialDropdownTrigger)}>
            <NavLink className={({ isActive }) =>
              clsx(
                styles.material,
                flexboxStyles.flexCenterCenterRow,
                isActive && styles.active
              )} to='/react-ui/inventory'>
              <i className="fa-regular fa-toilet-paper"></i>
              Inventory
            </NavLink>
          </li>
          <li className={clsx(styles.navbarLinks, styles.insightsDropdownTrigger)}>
            <NavLink className={({ isActive }) => clsx(styles.recipes, flexboxStyles.flexCenterCenterRow, isActive && styles.active)} to='/react-ui/recipes'>
              <i className="fa-regular fa-chart-network"></i>
              Recipes
            </NavLink>
          </li>
          <li className={clsx(styles.navbarLinks, styles.insightsDropdownTrigger)}>
            <NavLink className={({ isActive }) => clsx(flexboxStyles.flexCenterCenterRow, isActive && styles.active)} to='/react-ui/vitals'>
              <i className="fa-regular fa-wave-pulse"></i>
              Vitals
            </NavLink>
          </li>
        </ul>
      </div>
      <div className={clsx(styles.column, styles.columnRight)}>
        <ul className={styles.primary}>
          <li onClick={() => toggleUserOptionsDrpdwnMenu()}>
            <div className={styles.userFrame}>
              <div className={clsx(styles.userProfilePicture)}>
                {profilePictureUrl && <Image img={profilePictureUrl} width={250} />}
                <div className={styles.activeUser}></div>
              </div>
            </div>
            <div className={clsx(styles.dropdownMenu, styles.userOptions, isUserOptionsDropdownDisplayed ? styles.active : '')}>
              <NavLink className={({ isActive }) => clsx(styles.userOptionsDropdownHeader, isActive && styles.active)} to="/react-ui/profile">
                <div className={styles.userOptionsDropdownHeaderContainer}>
                  <div className={styles.userPictureColumn}>
                    <div className={styles.userPictureContainer}>
                      <div className={styles.userPictureBackground}>
                        {profilePictureUrl && <Image img={profilePictureUrl} width={250} />}
                        <div className={styles.activeIndicator}></div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.userTitleColumn}>
                    <h6 className={styles.userName}>{`${user?.firstName} ${user?.lastName}`}</h6>
                    <span className={styles.userTitle}>{user?.jobRole}</span>
                  </div>
                </div>
              </NavLink>
              <div className={styles.lineDivide}></div>
              <div className={styles.userOptionsList}>
                <NavLink to="/react-ui/profile" className={({ isActive }) => clsx(isActive ? styles.active : '', styles.userOptionRow)}>
                  My Account
                </NavLink>
                {user?.authRoles.some((role) => [AuthRoles.ADMIN, AuthRoles.SUPER_ADMIN].includes(role)) && (
                  <NavLink to="/react-ui/admin"
                    className={({ isActive }) => clsx(isActive ? styles.active : '', styles.userOptionRow)}
                  >
                    Admin Panel
                  </NavLink>
                )}
              </div>
              <div className={styles.lineDivide}></div>
              <div className={styles.userLogoutFooter}>
                <button onClickCapture={logoutUser}>Log Out <i className="fa-regular fa-right-from-bracket"></i></button>
              </div>
            </div>
          </li>
        </ul>

      </div>
    </nav>
  )
}

const NavbarSvgIcon = () => {
  return (
    <svg
      id="Layer_2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 106 109.52">
      <defs>
        <style>
          {
            ".cls-1{fill:#7367f0;stroke-width:0px;}.cls-2{fill:none;opacity:.9;stroke:#7367f0;stroke-miterlimit:10;}"
          }
        </style>
      </defs>
      <g id="Layer_1-2">
        <line className="cls-2" x1={23} y1={22} x2={42.5} y2={29.5} />
        <line className="cls-2" x1={42.5} y1={29.5} x2={79.5} y2={53.5} />
        <line className="cls-2" x1={32.5} y1={46.5} x2={52.5} y2={56.5} />
        <line className="cls-2" x1={13.5} y1={39.5} x2={32.5} y2={46.5} />
        <line className="cls-2" x1={53.5} y1={55.5} x2={75.5} y2={76.5} />
        <line className="cls-2" x1={55.5} y1={85.5} x2={77.39} y2={93.19} />
        <line className="cls-2" x1={5.5} y1={67.5} x2={31.5} y2={70.5} />
        <line className="cls-2" x1={12.39} y1={43.19} x2={31.5} y2={70.5} />
        <line className="cls-2" x1={31.5} y1={71.5} x2={55.5} y2={104.5} />
        <line className="cls-2" x1={32.5} y1={71.5} x2={54.5} y2={85.5} />
        <line className="cls-2" x1={80.5} y1={53.5} x2={99.5} y2={71.5} />
        <line className="cls-2" x1={66.5} y1={29.5} x2={79.5} y2={53.5} />
        <line className="cls-2" x1={67.5} y1={29.5} x2={97.5} y2={37.5} />
        <line className="cls-2" x1={32.5} y1={45.5} x2={32.5} y2={70.5} />
        <line className="cls-2" x1={43.5} y1={29.5} x2={53.5} y2={55.5} />
        <line className="cls-2" x1={66.5} y1={29.5} x2={53.5} y2={55.5} />
        <line className="cls-2" x1={53.5} y1={55.5} x2={54.5} y2={85.5} />
        <line className="cls-2" x1={77.5} y1={76.5} x2={82.5} y2={93.5} />
        <line className="cls-2" x1={44.5} y1={28.5} x2={67.5} y2={29.5} />
        <line className="cls-2" x1={42.5} y1={29.5} x2={78.5} y2={14.5} />
        <line className="cls-2" x1={78.5} y1={14.5} x2={67.5} y2={29.5} />
        <line className="cls-2" x1={46.5} y1={4.5} x2={43.5} y2={29.5} />
        <line className="cls-2" x1={42.5} y1={29.5} x2={32.5} y2={46.5} />
        <line className="cls-2" x1={9.5} y1={36.5} x2={42.5} y2={29.5} />
        <line className="cls-2" x1={97.5} y1={37.5} x2={77.5} y2={75.5} />
        <line className="cls-2" x1={97.5} y1={37.5} x2={79.5} y2={53.5} />
        <line className="cls-2" x1={52.5} y1={56.5} x2={79.5} y2={53.5} />
        <line className="cls-2" x1={26.5} y1={95.5} x2={55.5} y2={85.5} />
        <line className="cls-2" x1={31.5} y1={71.5} x2={53.5} y2={55.5} />
        <line className="cls-2" x1={54.5} y1={85.5} x2={80.5} y2={53.5} />
        <line className="cls-2" x1={54.5} y1={85.5} x2={55.5} y2={105.5} />
        <line className="cls-2" x1={55.5} y1={85.5} x2={77.5} y2={75.5} />
        <line className="cls-2" x1={77.5} y1={76.5} x2={99.5} y2={71.5} />
        <line className="cls-2" x1={24.5} y1={94.5} x2={31.5} y2={69.5} />
        <circle className="cls-1" cx={46} cy={8} r={8} />
        <circle className="cls-1" cx={98} cy={37} r={8} />
        <circle className="cls-1" cx={53} cy={57} r={8} />
        <circle className="cls-1" cx={8} cy={38} r={8} />
        <circle className="cls-1" cx={24} cy={96} r={8} />
        <circle className="cls-1" cx={83} cy={95} r={8} />
        <circle className="cls-1" cx={67.45} cy={28.84} r={4.55} />
        <circle className="cls-1" cx={79.89} cy={53.69} r={4.55} />
        <circle className="cls-1" cx={54.89} cy={85.69} r={4.55} />
        <circle className="cls-1" cx={42.89} cy={29.69} r={4.55} />
        <circle className="cls-1" cx={20.17} cy={20.97} r={3.83} />
        <circle className="cls-1" cx={78.89} cy={14.69} r={3.83} />
        <circle className="cls-1" cx={99.89} cy={71.69} r={3.83} />
        <circle className="cls-1" cx={76.89} cy={76.69} r={3.83} />
        <circle className="cls-1" cx={55.89} cy={105.69} r={3.83} />
        <circle className="cls-1" cx={31.89} cy={46.69} r={3.83} />
        <circle className="cls-1" cx={5.89} cy={67.69} r={3.83} />
        <circle className="cls-1" cx={31} cy={71} r={7} />
      </g>
    </svg>
  )
}

import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Image } from '../../_global/Image/Image';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { useLoggedInUser } from '../../_hooks/useLoggedInUser';
import { AuthRoles } from '@shared/enums/auth';
import * as flexboxStyles from '@ui/styles/flexbox.module.scss'
import clsx from 'clsx';
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as styles from './Navbar.module.scss';
import { FaAngleDown } from "react-icons/fa6";
import pluralize from 'pluralize';

pluralize.addIrregularRule('die', 'dies');

type DropdownItem = {
  path: string;
  label: string;
};

const FORM_ITEMS: DropdownItem[] = [
  { path: '/react-ui/forms/adhesive-category', label: 'Adhesive Category' },
  { path: '/react-ui/forms/credit-term', label: 'Credit Term' },
  { path: '/react-ui/forms/customer', label: 'Customer' },
  { path: '/react-ui/forms/delivery-method', label: 'Delivery Method' },
  { path: '/react-ui/forms/die', label: 'Die' },
  { path: '/react-ui/forms/liner-type', label: 'Liner Type' },
  { path: '/react-ui/forms/material', label: 'Material' },
  { path: '/react-ui/forms/material-category', label: 'Material Category' },
  { path: '/react-ui/forms/material-length-adjustment', label: 'Material Length Adjustment' },
  { path: '/react-ui/forms/material-order', label: 'Material Order' },
  { path: '/react-ui/forms/vendor', label: 'Vendor' },
];

const TABLE_ITEMS: DropdownItem[] = FORM_ITEMS.map(item => ({
  path: item.path.replace('/forms/', '/tables/'),
  label: pluralize(item.label)
}));


export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserOptionsDropdownDisplayed, setIsUserOptionsDropdownDisplayed] = useState(false);
  const [isFormsDropdownDisplayed, setIsFormsDropdownDisplayed] = useState(false);
  const [isTablesDropdownDisplayed, setIsTablesDropdownDisplayed] = useState(false);

  const { user, error } = useLoggedInUser();
  const profilePictureUrl = `data:image/${user?.profilePicture?.contentType};base64,${user?.profilePicture?.data.toString('base64')}`;

  if (error) {
    useErrorMessage(error);
  }

  const handleLogout = async () => {
    await axios.get('/auth/logout');
    navigate('/react-ui/login', { replace: true });
  };

  const isFormsActive = FORM_ITEMS.some(item => location.pathname === item.path);
  const isTablesActive = TABLE_ITEMS.some(item => location.pathname === item.path);

  return (
    <nav className={styles.navbarMain}>
      {/* Left Column */}
      <div className={clsx(styles.column, styles.columnLeft)}>
        <div className={flexboxStyles.flexCenterCenterRow} onClick={() => navigate('/react-ui/inventory')} style={{ cursor: 'pointer' }}>
          <NavbarSvgIcon />
          Eli
        </div>
      </div>

      {/* Center Column */}
      <div className={clsx(styles.column, styles.columnCenter)}>
        <ul className={clsx(sharedStyles.fullWidth, flexboxStyles.flexCenterCenterRow)}>
          <li className={styles.navbarLinks}>
            <NavLink className={({ isActive }) => clsx(flexboxStyles.flexCenterCenterRow, styles.navButton, isActive && styles.active)} to='/react-ui/inventory'>
              Inventory
            </NavLink>
          </li>
          <li className={styles.navbarLinks}>
            <div 
              className={clsx(flexboxStyles.flexCenterCenterRow, styles.navButton, isFormsActive ? styles.active : '')}
              onClick={() => setIsFormsDropdownDisplayed(!isFormsDropdownDisplayed)}
              style={{ cursor: 'pointer' }}
            >
              Create
              <FaAngleDown className={clsx(styles.dropdownArrow, isFormsDropdownDisplayed && styles.rotated)} />
            </div>
            <Dropdown 
              isOpen={isFormsDropdownDisplayed} 
              items={FORM_ITEMS} 
              onClose={() => setIsFormsDropdownDisplayed(false)} 
            />
          </li>
          <li className={styles.navbarLinks}>
            <div 
              className={clsx(flexboxStyles.flexCenterCenterRow, styles.navButton, isTablesActive ? styles.active : '')}
              onClick={() => setIsTablesDropdownDisplayed(!isTablesDropdownDisplayed)}
              style={{ cursor: 'pointer' }}
            >
              View
              <FaAngleDown className={clsx(styles.dropdownArrow, isTablesDropdownDisplayed && styles.rotated)} />
            </div>
            <Dropdown 
              isOpen={isTablesDropdownDisplayed} 
              items={TABLE_ITEMS} 
              onClose={() => setIsTablesDropdownDisplayed(false)} 
            />
          </li>
        </ul>
      </div>

      {/* Right Column */}
      <div className={clsx(styles.column, styles.columnRight)}>
        <div className={styles.userFrame} onClick={() => setIsUserOptionsDropdownDisplayed(!isUserOptionsDropdownDisplayed)}>
          <UserProfile user={user} profilePictureUrl={profilePictureUrl} />
        </div>
        <UserOptionsDropdown 
          isOpen={isUserOptionsDropdownDisplayed}
          user={user}
          profilePictureUrl={profilePictureUrl}
          onClose={() => setIsUserOptionsDropdownDisplayed(false)}
          onLogout={handleLogout}
        />
      </div>
    </nav>
  );
};

const UserProfile = ({ user, profilePictureUrl }: { user: any, profilePictureUrl: string }) => (
  <div className={styles.userPictureContainer}>
    <div className={styles.userPictureBackground}>
      {profilePictureUrl && <Image img={profilePictureUrl} width={250} />}
      <div className={styles.activeIndicator}></div>
    </div>
  </div>
);

const Dropdown = ({ 
  isOpen, 
  items, 
  onClose 
}: { 
  isOpen: boolean, 
  items: DropdownItem[], 
  onClose: () => void 
}) => (
  <div className={clsx(styles.dropdown, isOpen ? styles.active : '')}>
    {items.map(item => (
      <NavLink 
        key={item.path}
        to={item.path}
        className={({ isActive }) => clsx(styles.dropdownRow, isActive ? styles.active : '')}
        onClick={onClose}
      >
        {item.label}
      </NavLink>
    ))}
  </div>
);

const UserOptionsDropdown = ({ 
  isOpen, 
  user, 
  profilePictureUrl,
  onClose,
  onLogout 
}: { 
  isOpen: boolean, 
  user: any, 
  profilePictureUrl: string, 
  onClose: () => void,
  onLogout: () => void,
}) => (
  <div className={clsx(styles.dropdown, styles.userOptions, isOpen ? styles.active : '')}>
    <NavLink className={({ isActive }) => clsx(styles.userOptionsDropdownHeader, isActive && styles.active)} to="/react-ui/profile">
      <div className={styles.userOptionsDropdownHeaderContainer}>
        <div className={styles.userPictureColumn}>
          <UserProfile user={user} profilePictureUrl={profilePictureUrl} />
        </div>
        <div className={styles.userTitleColumn}>
          <h6 className={styles.userName}>{`${user?.firstName} ${user?.lastName}`}</h6>
          <span className={styles.userTitle}>{user?.jobRole}</span>
        </div>
      </div>
    </NavLink>
    <div className={styles.lineDivide}></div>
    <div className={styles.userOptionsList}>
      <NavLink to="/react-ui/profile" className={({ isActive }) => clsx(styles.dropdownRow, isActive ? styles.active : '')} onClick={onClose}>
        My Account
      </NavLink>
      {user?.authRoles.some((role: AuthRoles) => [AuthRoles.ADMIN, AuthRoles.SUPER_ADMIN].includes(role)) && (
        <NavLink to="/react-ui/admin" className={({ isActive }) => clsx(styles.dropdownRow, isActive ? styles.active : '')} onClick={onClose}>
          Admin Panel
        </NavLink>
      )}
      {user?.authRoles.some((role: AuthRoles) => [AuthRoles.ADMIN, AuthRoles.SUPER_ADMIN].includes(role)) && (
        <NavLink to="/react-ui/tables/user" className={({ isActive }) => clsx(styles.dropdownRow, isActive ? styles.active : '')} onClick={onClose}>
          Manage Users
        </NavLink>
      )}
    </div>
    <div className={styles.lineDivide}></div>
    <div className={styles.userLogoutFooter}>
      <button onClick={onLogout}>
        Log Out
      </button>
    </div>
  </div>
);

const NavbarSvgIcon = () => (
  <svg id="Layer_2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 106 109.52">
    <defs>
      <style>
        {".cls-1{fill:#7367f0;stroke-width:0px;}.cls-2{fill:none;opacity:.9;stroke:#7367f0;stroke-miterlimit:10;}"}
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
);
import React, { useEffect, useState } from 'react';
import './Navbar.scss';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Image } from '../../_global/Image/Image';
import { getLoggedInUserProfilePictureUrl } from '../../_queries/users';
import { useQuery } from '@tanstack/react-query';
import { useErrorMessage } from '../../_hooks/useErrorMessage';
import { Dropdown } from '../../_global/Dropdown/Dropdown';

export const Navbar = () => {
  const navigate = useNavigate();
  const [isUserOptionsDropdownDisplayed, setIsUserOptionsDropdownDisplayed] = useState(false)
  const [isUserNotificationsDropdownDisplayed, setIsUserNotificationsDropdownDisplayed] = useState(false)
  const [isShortcutDropdownDisplayed, setIsShortcutDropdownDisplayed] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null);


  const { data: profilePictureUrl, error } = useQuery({
    queryKey: ['get-profile-picture'],
    queryFn: getLoggedInUserProfilePictureUrl,
    initialData: {}
  })

  if (error) {
    useErrorMessage(error);
  }

  const logoutUser = async () => {
    await axios.get('/auth/logout');
    navigate('/react-ui/login', { replace: true });
  }

  useEffect(() => {
    setSelectedImage(profilePictureUrl)
  }, [profilePictureUrl])

  function toggleUserOptionsDrpdwnMenu() {
    setIsUserNotificationsDropdownDisplayed(false)
    setIsShortcutDropdownDisplayed(false)
    setIsUserOptionsDropdownDisplayed(!isUserOptionsDropdownDisplayed)
  }
  function toggleUserNotificationsDrpdwnMenu() {
    setIsUserOptionsDropdownDisplayed(false)
    setIsShortcutDropdownDisplayed(false)
    setIsUserNotificationsDropdownDisplayed(!isUserNotificationsDropdownDisplayed)
  }
  function toggleShortcutDrpdwnMenu() {
    setIsUserOptionsDropdownDisplayed(false)
    setIsUserNotificationsDropdownDisplayed(false)
    setIsShortcutDropdownDisplayed(!isShortcutDropdownDisplayed)
  }

  const dropdownLists = [
    <ul className='shortcut-body-create'>
      <li><NavLink to='/react-ui/forms/ticket'>Create Ticket</NavLink></li>
      <li><NavLink to='/react-ui/forms/quote'>Create Quote</NavLink></li>
      <li><NavLink to='/react-ui/forms/product'>Create Product</NavLink></li>
      <li><NavLink to='/react-ui/forms/customer' className={({ isActive, isPending }) => `${isPending ? "pending" : isActive ? "active" : ""}`}>Create Customer</NavLink></li>
      <li><NavLink to='/react-ui/forms/die'>Create Die</NavLink></li>
      <li><NavLink to='/'>Create Plate</NavLink></li>
      <li><NavLink to='/'>Create PO</NavLink></li>
    </ul>,
    <ul className='shortcut-body-view'>
      <li><NavLink to='/react-ui/tables/ticket'>View Ticket</NavLink></li>
      <li><NavLink to='/react-ui/tables/quote'>View Quote</NavLink></li>
      <li><NavLink to='/react-ui/tables/product'>View Product</NavLink></li>
      <li><NavLink to='/react-ui/tables/customer'>View Customer</NavLink></li>
      <li><NavLink to='/react-ui/tables/die'>View Die</NavLink></li>
      <li><NavLink to='/react-ui/tables/plate'>View Plate</NavLink></li>
      <li><NavLink to='/react-ui/tables/po'>View PO</NavLink></li>
    </ul>,
    <ul className='shortcut-body-purchase'>
      <li><NavLink to='/'>Purchase Plates</NavLink></li>
      <li><NavLink to='/'>Purchase Dies</NavLink></li>
      <li><NavLink to='/'></NavLink></li>
      <li><NavLink to='/'></NavLink></li>
      <li><NavLink to='/'></NavLink></li>
      <li><NavLink to='/'></NavLink></li>
      <li><NavLink to='/'></NavLink></li>
    </ul>,
  ];

  const listName = [
    'Create',
    'View',
    'Purchase'
  ];


  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentNameIndex, setCurrentNameIndex] = useState(0);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? dropdownLists.length - 1 : prevIndex - 1
    );
    setCurrentNameIndex((prevIndex) =>
      prevIndex === 0 ? listName.length - 1 : prevIndex - 1
    );
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === dropdownLists.length - 1 ? 0 : prevIndex + 1
    );
    setCurrentNameIndex((prevIndex) =>
      prevIndex === listName.length - 1 ? 0 : prevIndex + 1
    );
  };


  return (
    <nav className="navbar-main">
      <div className="column column-left">
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
        Eli
      </div>
      <div className="column column-center">
        <ul className="full-width flex-center-center-row main-navbar-links">
          <li className="navbar-links">
            <NavLink className={({ isActive, isPending }) => `production flex-center-center-row ${isPending ? "pending" : isActive ? "active" : ""}`} to='/react-ui/production'><i className="fa-regular fa-table-tree"></i> Production</NavLink>
          </li>
          <li className="navbar-links nav-dropdown-trigger" id="material-dropdown-trigger">
            <NavLink className={({ isActive, isPending }) => `material flex-center-center-row ${isPending ? "pending" : isActive ? "active" : ""}`} to='/react-ui/inventory'><i className="fa-regular fa-toilet-paper"></i> Inventory</NavLink>
          </li>
          <li className="navbar-links nav-dropdown-trigger" id="insights-dropdown-trigger">
            <NavLink className={({ isActive, isPending }) => `recipes flex-center-center-row ${isPending ? "pending" : isActive ? "active" : ""}`} to='/react-ui/recipes'><i className="fa-regular fa-chart-network"></i>Recipes</NavLink>
          </li>
          <li className="navbar-links nav-dropdown-trigger" id="insights-dropdown-trigger">
            <NavLink className={({ isActive, isPending }) => `vitals flex-center-center-row ${isPending ? "pending" : isActive ? "active" : ""}`} to='/react-ui/vitals'><i className="fa-regular fa-wave-pulse"></i>Vitals</NavLink>
          </li>
        </ul>
      </div>
      <div className="column column-right">
      <ul className="primary">
        <li className={`secondary-navbar-links settings-option settings tooltip-bottom ${isShortcutDropdownDisplayed ? 'active' : ''}`} onClick={() => toggleShortcutDrpdwnMenu()}>
          <span className='tooltiptext'>Shortcuts</span>
          <i className="navbar-icon fa-solid fa-grid-2-plus"></i>
          <Dropdown
              className='shortcut-options'
              isActive={isShortcutDropdownDisplayed}
              onClose={() => {
                setIsShortcutDropdownDisplayed(false); 

              }}
            >
            <div className="header">
              <div className='left'>
              {listName[currentNameIndex]}
              </div>
              <div className='right'>
                <div className='shortcut-mark-all-wrapper'>
                  {/* <NavLink to='/react-ui/crud-navigation'><i class="fa-solid fa-grid"></i></NavLink> */}
                  <div className='shortcut-controls-container'>
                    <button className="carousel-control prev" onClick={handlePrev}>
                      <i className="fa-regular fa-arrow-left"></i>
                    </button>
                    <button className="carousel-control next" onClick={handleNext}>
                      <i className="fa-regular fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className='carousel-container'>
              {dropdownLists[currentIndex]}
            </div>
          </Dropdown>
        </li>
        <li className="secondary-navbar-links activity-option tooltip-bottom">
          <span className="tooltiptext">Intelligence</span>
          <i className="navbar-icon fa-solid fa-brain-circuit"></i>
        </li>
        <li className={`secondary-navbar-links notification-option tooltip-bottom ${isUserNotificationsDropdownDisplayed ? 'active' : ''}`} onClick={() => toggleUserNotificationsDrpdwnMenu()}>
          <span className="tooltiptext">Notifications</span>
          <div className='notification-counter'>1</div>
          <i className="navbar-icon fa-regular fa-bell"></i>
          <Dropdown
            className={`notification-teaser`}
            isActive={isUserNotificationsDropdownDisplayed}
            onClose={() => setIsUserNotificationsDropdownDisplayed(false)}
            >
            <div className="header">
              <div className='left'>
                Notifications
              </div>
              <div className='right'>
                <div className='notification-mark-all-wrapper'>
                  <i className="fa-light fa-envelope"></i>
                </div>
              </div>
            </div>
            <ul className='notification-body'>
              <li>Sam Tarrant asked you do better</li>
              <li>Sam Tarrant asked you do better</li>
              <li>Sam Tarrant asked you do better</li>
              <li>Sam Tarrant asked you do better</li>
              <li>Sam Tarrant asked you do better</li>
            </ul>
            <div className="footer flex-center-center-row">
              <a href='#' className="btn btn-primary">See All Notifications</a>
            </div>
          </Dropdown>
        </li>
        <li className="list-item-user-detail nav-dropdown-trigger" onClick={() => toggleUserOptionsDrpdwnMenu()}>
            <div className="user-frame">
              <div className="user-profile-picture profile-picture">
                  <Image img={selectedImage} width={250}/>
                  <div className="active-user"></div>
              </div>
            </div>
            <div className={`dropdown-menu user-options ${isUserOptionsDropdownDisplayed ? 'active' : ''}`}>
              <NavLink className={({ isActive, isPending }) => `user-options-dropdown-header ${isPending ? "pending" : isActive ? "active" : ""}`} to="/react-ui/profile">
                <div className='user-options-dropdown-header-container'>
                  <div className='user-picture-column'>
                    <div className='user-picture-container'>
                      <div className='user-picture-background'>
                        <Image img={selectedImage} width={250} />
                        <div className='active-indicator'></div>
                      </div>
                    </div>
                  </div>
                  <div className='user-title-column'>
                    <h6 className='user-name'>Storm Vaske</h6>
                    <span className='user-title'>CEO</span>
                  </div>
                </div>
              </NavLink>
              <div className='line-divide'></div>
              <ul className='user-options-list'>
                <li>
                  <NavLink to="/react-ui/profile" className={({ isActive, isPending }) => isPending ? "pending" : isActive ? "active" : ""}>
                    <i className="fa-regular fa-user"></i>
                    My Account
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/react-ui/admin" 
                    className={({ isActive, isPending }) => isPending ? "pending" : isActive ? "active" : ""}
                  >
                      <i className="fa-regular fa-crown"></i>
                      Admin Panel
                  </NavLink></li>
                <li>
                  <a href="#">
                    <i className="fa-regular fa-books"></i>
                    Resources
                  </a>
                </li>
              </ul>
              <div className='line-divide'></div>
              <div className='user-logout-footer'>
                <button onClickCapture={logoutUser}>Log Out <i className="fa-regular fa-right-from-bracket"></i></button>
              </div>
            </div>
          </li>
        </ul>

      </div>
    </nav>
  )
}

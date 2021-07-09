import React, {useEffect, useState} from 'react';
import SidebarItem from './SidebarItem';
import { RouteItem, RoutePath } from '../../routes';
import Logo from '../../logo.png';
import './Sidebar.scss';
import { Link, useLocation } from 'react-router-dom';
import { useAuthorizedUserState } from '../../state/authorized-user/authorized-user-state';
import NestedSidebarNav from '../NestedSidebarNav/NestedSidebarNav';

function Sidebar({ items }: { items: RouteItem[] }) {
  const authorizedUserState = useAuthorizedUserState();
  const location = useLocation();
  const [openedMenu, setOpenedMenu] = useState('');

  useEffect(() => {
    for (const item of items) {
      if (item.childRoutes != null && item.childRoutes.length > 0) {
        for (const child of item.childRoutes) {
          const pathMatch = new RegExp('^' + child.path, 'g');
          if (location.pathname.match(pathMatch)) {
            setOpenedMenu(item.name);
          }
        }
      }
    }
  }, [location]);

  const handleMenuToggleClicked = (id: string) => {
    // don't toggle just open
    setOpenedMenu(id);
  };

  return (
    <div className="sidebar" data-testid="sidebar">
      <div className="sidebar__logo-section">
        <Link to={RoutePath.HOME} className="logo-section__link">
          <img
            alt=""
            src={Logo}
            height="30"
            className="d-inline-block align-top mr-4"
          />
        </Link>
      </div>
      <nav className="sidebar__nav">
        {items.map((item) => {
          if (authorizedUserState.authorizedUserHasAnyPrivilege(item.requiredPrivileges)){
            if (item.childRoutes != null && item.childRoutes.length > 0) {
              return (<NestedSidebarNav key={item.name}
                                        id={item.name}
                                        title={item.name}
                                        isOpened={openedMenu === item.name}
                                        onToggleClicked={handleMenuToggleClicked}>
                {
                  item.childRoutes.map((child) => {
                    if (authorizedUserState.authorizedUserHasAnyPrivilege(child.requiredPrivileges)) {
                      return <SidebarItem key={child.name} path={child.path} name={child.name} />
                    }
                  })
                }
              </NestedSidebarNav>);
            }
            else {
              return <SidebarItem key={item.name} path={item.path} name={item.name} />
            }
          }
        })}
      </nav>
    </div>
  );
}

export default Sidebar;

import { useHookstate } from '@hookstate/core';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../../logo.png';
import { RouteItem, RoutePath } from '../../routes';
import { useAuthorizedUserState } from '../../state/authorized-user/authorized-user-state';
import AppInfoTag from '../AppInfoTag/AppInfoTag';
import NestedSidebarNav from '../NestedSidebarNav/NestedSidebarNav';
import './Sidebar.scss';
import SidebarContainer from './SidebarContainer';
import SidebarItem from './SidebarItem';
import {Popup} from 'semantic-ui-react';
import {useNavCollapsed} from '../../hooks/PagePreferenceHooks';
import SidebarCollapsedItem from './SidebarCollapsedItem';
import SidebarItemWithChildren from './SidebarItemWithChildren';

function Sidebar({ items }: { items: RouteItem[] }) {
  const authorizedUserState = useAuthorizedUserState();
  const location = useLocation();
  const [openedMenu, setOpenedMenu] = useState('');
  const [isNavCollapsed, setIsNavCollapsed] = useNavCollapsed();
  const activeItem = useHookstate('');

  useEffect(() => {
    for (const item of items) {
      if (item.childRoutes != null && item.childRoutes.length > 0) {
        for (const child of item.childRoutes) {
          const pathMatch = new RegExp('^' + child.path, 'g');
          if (location.pathname.match(pathMatch)) {
            setOpenedMenu(item.name);
            activeItem.set(child.name);
            break;
          }
        }
      } else {
        if (location.pathname === item.path) {
          activeItem.set(item.name);
          break;
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
                alt="Tron Common API Logo"
                src={Logo}
                height="30"
                className="d-inline-block align-top mr-4"
            />
          </Link>
          <AppInfoTag />
        </div>
        <nav className="sidebar__nav">
          {
            items.map((item) => {
                  if (authorizedUserState.authorizedUserHasAnyPrivilege(item.requiredPrivileges)) {
                    return (item.childRoutes != null && item.childRoutes.length > 0) ?
                        <SidebarItemWithChildren
                            item={item}
                            isNavCollapsed={isNavCollapsed}
                            onToggleClicked={handleMenuToggleClicked}
                            openedMenu={openedMenu}
                        /> :
                        <SidebarContainer key={item.name} isActive={activeItem.value === item.name}>
                          <SidebarItem key={item.name} path={item.path} name={item.name} icon={item.icon} />
                        </SidebarContainer>
                  }
                }
            )
          }
        </nav>
      </div>
  );
}

export default Sidebar;

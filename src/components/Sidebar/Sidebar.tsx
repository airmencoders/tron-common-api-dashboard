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
import {useNavCollapsed} from '../../hooks/PagePreferenceHooks';
import {Popup} from 'semantic-ui-react';
import Button from '../Button/Button';

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
            alt=""
            src={Logo}
            height="30"
            className="d-inline-block align-top mr-4"
          />
        </Link>
        <AppInfoTag />
      </div>
      <nav className="sidebar__nav">
        {
          items.map(({name, childRoutes, icon: Icon, requiredPrivileges, path}) => {
          if (authorizedUserState.authorizedUserHasAnyPrivilege(requiredPrivileges)){
            if (childRoutes != null && childRoutes.length > 0) {
              return (
                <SidebarContainer key={name} containsNestedItems isActive={openedMenu === name}>
                  {
                    isNavCollapsed ?
                        <Popup
                            trigger={
                              <div className="sidebar-container__icon-wrapper">
                                {
                                  Icon &&
                                  <Icon size={1.25} iconTitle={name} className="container__icon" />
                                }

                              </div>
                            }
                            on="click"
                            position="right center"
                            wide
                        >
                          <Popup.Content
                              className="sidebar__items--collapsed"
                          >
                            {
                              childRoutes.map((child) => {
                                if (authorizedUserState.authorizedUserHasAnyPrivilege(child.requiredPrivileges)) {
                                  return <SidebarItem key={child.name} path={child.path} name={child.name}
                                                      showActiveBorder/>
                                }
                              })
                            }
                          </Popup.Content>
                        </Popup> :

                        <NestedSidebarNav key={name}
                                          id={name}
                                          title={name}
                                          isOpened={openedMenu === name}
                                          onToggleClicked={handleMenuToggleClicked}
                                          icon={Icon}
                        >
                          {
                            childRoutes.map((child) => {
                              if (authorizedUserState.authorizedUserHasAnyPrivilege(child.requiredPrivileges)) {
                                return <SidebarItem key={child.name} path={child.path} name={child.name}
                                                    showActiveBorder/>
                              }
                            })
                          }
                        </NestedSidebarNav>
                  }

                </SidebarContainer>
              );
            }
            else {
              return (
                <SidebarContainer key={name} isActive={activeItem.value === name}>
                  <SidebarItem key={name} path={path} name={name} icon={Icon} />
                </SidebarContainer>
              )
            }
          }
        }
        )
        }
      </nav>
    </div>
  );
}

export default Sidebar;

import React from 'react';
import {Popup} from 'semantic-ui-react';
import SidebarCollapsedItem from './SidebarCollapsedItem';
import SidebarItem from './SidebarItem';
import SidebarContainer from './SidebarContainer';
import NestedSidebarNav from '../NestedSidebarNav/NestedSidebarNav';
import {SidebarItemWithChildrenProps} from './SidebarItemWithChildrenProps';
import {useAuthorizedUserState} from '../../state/authorized-user/authorized-user-state';
import PuzzleIcon from '../../icons/PuzzleIcon';

function SidebarItemWithChildren(props: SidebarItemWithChildrenProps) {
  const authorizedUserState = useAuthorizedUserState();

  return (
      <div className="sidebar-item-with-children">
        {
          props.isNavCollapsed ?
              <Popup
                  trigger={<div><SidebarCollapsedItem name={props.item.name} currentOpenedMenu={props.openedMenu}
                                                      icon={props.item.icon ?? PuzzleIcon}/></div>}
                  on="click"
                  className="sidebar__nav-popup"
                  position="right center"
                  offset={[(props.item.childRoutes?.length ?? 0 * 9), -6]}
                  wide
              >
                <Popup.Content
                    className="sidebar__items--collapsed"
                >
                  {
                    props.item.childRoutes?.map((child) => {
                      if (authorizedUserState.authorizedUserHasAnyPrivilege(child.requiredPrivileges)) {
                        return <SidebarItem key={child.name} path={child.path} name={child.name}
                                            showActiveBorder/>
                      }
                    })
                  }
                </Popup.Content>
              </Popup> :
              <SidebarContainer key={props.item.name} containsNestedItems isActive={props.openedMenu === props.item.name}>

                <NestedSidebarNav key={props.item.name}
                                  id={props.item.name}
                                  title={props.item.name}
                                  isOpened={props.openedMenu === props.item.name}
                                  onToggleClicked={props.onToggleClicked}
                                  icon={props.item.icon}
                >
                  {
                    props.item.childRoutes?.map((child) => {
                      if (authorizedUserState.authorizedUserHasAnyPrivilege(child.requiredPrivileges)) {
                        return <SidebarItem key={child.name} path={child.path} name={child.name}
                                            showActiveBorder/>
                      }
                    })
                  }
                </NestedSidebarNav>
              </SidebarContainer>
        }
      </div>
  );
}

export default SidebarItemWithChildren;

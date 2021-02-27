import React from 'react';
import SidebarItem from './SidebarItem';
import { ProtectedStatus, RouteItem, RoutePath } from '../../routes';
import Logo from '../../logo.png';

import './Sidebar.scss';
import { Link } from 'react-router-dom';
import { useAuthorizedUserState } from '../../state/authorized-user/authorized-user-state';
import { PrivilegeType } from '../../state/app-clients/interface/privilege-type';

function Sidebar({ items }: { items: RouteItem[] }) {
  const useDashboardState = useAuthorizedUserState();

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
          if ((item.protectedStatus === ProtectedStatus.ADMIN && !useDashboardState.error && useDashboardState.authorizedUser?.privileges?.find(privilege => privilege.name === PrivilegeType.DASHBOARD_ADMIN)) || item.protectedStatus === ProtectedStatus.USER || item.protectedStatus === ProtectedStatus.ANONYMOUS)
            return <SidebarItem key={item.name} path={item.path} name={item.name} />
        })}
      </nav>
    </div>
  );
}

export default Sidebar;

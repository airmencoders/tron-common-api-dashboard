import React from 'react';
import { NavLink } from 'react-router-dom';
import { RoutePath } from '../../routes';
import './SidebarItem.scss';

export interface SidebarItemProps {
  path: string,
  name: string
}

function SidebarItem({ path, name }: SidebarItemProps) {
  return (
    <NavLink exact={path === RoutePath.HOME ? true : false} to={path} activeClassName="active" className="sidebar-item" data-testid="sidebar-item">
      <h5 className="sidebar-item__name">{name}</h5>
    </NavLink>
  );
}

export default SidebarItem;

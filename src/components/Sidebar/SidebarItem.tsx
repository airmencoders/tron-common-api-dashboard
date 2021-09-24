import React from 'react';
import { NavLink } from 'react-router-dom';
import { RoutePath } from '../../routes';
import './SidebarItem.scss';
import { SidebarItemProps } from './SidebarItemProps';

function SidebarItem({ path, name, icon: Icon, iconTitle, showActiveBorder }: SidebarItemProps) {
  return (
    <NavLink
      exact={path === RoutePath.HOME ? true : false}
      to={path}
      activeClassName={`${showActiveBorder ? 'sidebar-item--active sidebar-item--active-border' : 'sidebar-item--active'}`}
      className="sidebar-item"
      data-testid="sidebar-item"
    >
      <div className="sidebar-item__container">
        {Icon ?
          <Icon size={1.25} iconTitle={iconTitle} className="container__icon" />
          :
          <i className="container__icon"></i>
        }
        <span className="container__name">{name}</span>
      </div>
    </NavLink>
  );
}

export default SidebarItem;

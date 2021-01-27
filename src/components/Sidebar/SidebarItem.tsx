import React from 'react';
import { NavLink } from 'react-router-dom';
import './SidebarItem.scss';

export interface SidebarItemProps {
    path: string,
    name: string
}

function SidebarItem({ path, name }: SidebarItemProps) {
    return (
        <NavLink exact={path === "/" ? true : false} to={path} activeClassName="active" className="sidebar-item" data-testid="sidebar-item">
            <h3 className="sidebar-item__name">{name}</h3>
        </NavLink>
    );
}

export default SidebarItem;

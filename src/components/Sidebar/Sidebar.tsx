import React from 'react';
import SidebarItem from './SidebarItem';
import { RouteItem } from '../../routes';

function Sidebar({ items }: { items: RouteItem[] }) {
    return (
        <nav className="sidebar">
            { items.map((item) => <SidebarItem key={item.name} path={item.path} name={item.name} />)}
        </nav>
    );
}

export default Sidebar;

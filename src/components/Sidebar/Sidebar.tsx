import React from 'react';
import SidebarItem from './SidebarItem';
import { RouteItem } from '../../routes';
import Logo from '../../logo.png';

import './Sidebar.scss';
import { Link } from 'react-router-dom';

function Sidebar({ items }: { items: RouteItem[] }) {
  return (
    <div className="sidebar" data-testid="sidebar">
      <div className="sidebar__logo-section">
        <Link to="/" className="logo-section__link">
          <img
            alt=""
            src={Logo}
            height="30"
            className="d-inline-block align-top mr-4"
          />
        </Link>
      </div>
      <nav className="sidebar__nav">
        {items.map((item) => <SidebarItem key={item.name} path={item.path} name={item.name} />)}
      </nav>
    </div>
  );
}

export default Sidebar;

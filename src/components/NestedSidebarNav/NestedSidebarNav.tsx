import React from 'react';

import './NestedSidebarNav.scss';
import {NestedSidebarNavProps} from './NestedSidebarNavProps';
import ChevronDownIcon from '../../icons/ChevronDownIcon';
import ChevronUpIcon from '../../icons/ChevronUpIcon';

function NestedSidebarNav(props: NestedSidebarNavProps) {
  const toggleClicked = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    props.onToggleClicked(props.id);
  }
  return (
      <div className="nested-sidebar-nav">
        <div className="nested-sidebar-nav__header">
          <a className="header__link" href="#" onClick={toggleClicked}
             data-testid="header__link"
          >
            <h5 className="header__label">{props.title}</h5>
            <div className="header__icon">
              {
                props.isOpened ?
                  <ChevronUpIcon  size={.75}/>
                  :
                  <ChevronDownIcon  size={.75}/>
              }
            </div>
          </a>
        </div>
        <div className={`nested-sidebar-nav__children ${props.isOpened ? 'opened' : ''}`}
             data-testid="nested-sidebar-nav__children"
        >
          {props.children}
        </div>
      </div>
  );
}

export default NestedSidebarNav;

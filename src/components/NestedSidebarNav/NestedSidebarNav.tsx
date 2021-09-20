import React from 'react';

import './NestedSidebarNav.scss';
import {NestedSidebarNavProps} from './NestedSidebarNavProps';
import UpArrowIcon from '../../icons/UpArrowIcon';
import DownArrowIcon from '../../icons/DownArrowIcon';

function NestedSidebarNav({ isOpened, className, icon: Icon, ...props }: NestedSidebarNavProps) {
  const toggleClicked = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    props.onToggleClicked(props.id);
  }
  return (
    <div className={`nested-sidebar-nav${className ? ' ' + className : ''}`}>
        <div className="nested-sidebar-nav__header">
          <a className="header__link" href="#" onClick={toggleClicked}
             data-testid="header__link"
          >
            {Icon ?
              <Icon size={1.25} iconTitle={props.iconTitle} className="header__link-icon" />
              :
              <i className="header__link-icon"></i>
            }
            <div className="header__label">{props.title}</div>
            {
            isOpened ?
                <UpArrowIcon className="header__icon" size={0.9}/>
                :
                <DownArrowIcon className="header__icon" size={0.9}/>
            }
          </a>
        </div>
      <div className={`nested-sidebar-nav__children ${isOpened ? 'opened' : ''}`}
             data-testid="nested-sidebar-nav__children"
        >
          {props.children}
        </div>
      </div>
  );
}

export default NestedSidebarNav;

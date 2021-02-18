import React from 'react';
import CloseIcon from '../../icons/CloseIcon';
import BackdropOverlay from '../BackdropOverlay/BackdropOverlay';

import './SideDrawer.scss';
import { SideDrawerProps } from './SideDrawerProps';

function SideDrawer(props: SideDrawerProps) {
  return (
    <>
      {props.isOpen ? <BackdropOverlay /> : null}
      <div className={props.isOpen ? "side-drawer default-panel-padding open" : "side-drawer"} data-testid="side-drawer">
        <div className="side-drawer__header">
          <h4 className="header__title">{props.title}</h4>
          <button className="header__close-icon close-btn" onClick={props.onCloseHandler} title="close-sidedrawer">
            <CloseIcon size={1.75} />
          </button>
        </div>
        <div className="side-drawer__content">
          {props.children}
        </div>
      </div>
    </>
  );
}

export default SideDrawer;

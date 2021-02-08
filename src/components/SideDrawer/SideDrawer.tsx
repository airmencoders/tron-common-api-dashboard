import React, { useRef } from 'react';
import { useInsideClickHandler } from '../../hooks/InsideClickHandler';
import BackdropOverlay from '../BackdropOverlay/BackdropOverlay';
import Button from '../Button/Button';

import './SideDrawer.scss';
import { SideDrawerProps } from './SideDrawerProps';

function SideDrawer(props: SideDrawerProps) {
  const ref = useRef(null);

  useInsideClickHandler(ref, props.onCloseHandler);

  return (
    <>
      {props.isOpen ? <BackdropOverlay ref={ref} /> : null}
      <div className={props.isOpen ? "side-drawer open" : "side-drawer"} data-testid="side-drawer">
        <div className="side-drawer__header">
          <h5 className="header__title">{props.title}</h5>
          <Button type={"button"} onClick={props.onCloseHandler}>X</Button>
        </div>
        <div className="side-drawer__content">
          {props.children}
        </div>
      </div>
    </>
  );
}

export default SideDrawer;

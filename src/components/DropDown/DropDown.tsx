import { useHookstate } from '@hookstate/core';
import { Button } from '@trussworks/react-uswds';
import React, { ReactChild, ReactNode } from 'react';
import './DropDown.scss';

export interface DropDownProps {
  anchorContent: string | ReactNode;
  children: ReactChild | ReactChild[];
}

export default function DropDown(props: DropDownProps) {
  const showMenu = useHookstate(false);
  let timeoutHdl: any = null;

  function mouseLeft() {
    timeoutHdl = setTimeout(closeMenu, 2000);
  }

  function mouseEnter() {
    if (timeoutHdl !== null) clearTimeout(timeoutHdl);
    timeoutHdl = null;
  }

  function closeMenu() {
    showMenu.set(false);
    timeoutHdl = null;
  }

  return (
    <div className="menu-container" onMouseLeave={mouseLeft} onMouseEnter={mouseEnter}>
      <Button type="button" onClick={() => showMenu.set(!showMenu.get())}>
        {props.anchorContent}
      </Button>

      {showMenu.get() && (
        <div className="drop-down-container">{props.children}</div>
      )}
    </div>
  );
}

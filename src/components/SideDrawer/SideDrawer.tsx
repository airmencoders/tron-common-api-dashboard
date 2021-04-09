import React from 'react';
import withLoading from '../../hocs/UseLoading/WithLoading';
import { WithLoadingProps } from '../../hocs/UseLoading/WithLoadingProps';
import CloseIcon from '../../icons/CloseIcon';
import BackdropOverlay from '../BackdropOverlay/BackdropOverlay';

import './SideDrawer.scss';
import { SideDrawerProps } from './SideDrawerProps';

function SideDrawer(props: SideDrawerProps) {
  if (props.isOpen) {
    document.body.classList.add('side-drawer--open');
  } else {
    document.body.classList.remove('SideDrawer--open');
  }

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
          <SideDrawerChildrenWithLoading isLoading={props.isLoading ?? false}>
            {props.children}
          </SideDrawerChildrenWithLoading>
        </div>
      </div>
    </>
  );
}

function SideDrawerChildren(props: { children: React.ReactNode | React.ReactNode[] }) {
  return (
    <>
      {props.children}
    </>
  );
}

const WithLoadingSideDrawerChildren = withLoading(SideDrawerChildren);

function SideDrawerChildrenWithLoading(props: WithLoadingProps & { children: React.ReactNode | React.ReactNode[] }) {
  return (
    <WithLoadingSideDrawerChildren {...props} />
  );
}

export default SideDrawer;

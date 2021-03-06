import React from 'react';
import withLoading from '../../hocs/UseLoading/WithLoading';
import {WithLoadingProps} from '../../hocs/UseLoading/WithLoadingProps';
import CloseIcon from '../../icons/CloseIcon';
import BackdropOverlay from '../BackdropOverlay/BackdropOverlay';

import './SideDrawer.scss';
import {SideDrawerProps} from './SideDrawerProps';
import {SideDrawerSize} from './side-drawer-size';

function SideDrawer(props: SideDrawerProps) {
  const sideDrawerClassName = 'side-drawer';

  if (props.isOpen) {
    document.body.classList.add('side-drawer--open');
  } else {
    document.body.classList.remove('side-drawer--open');
  }

  const componentClassName = props.size === SideDrawerSize.WIDE ?
      `${sideDrawerClassName} ${sideDrawerClassName}--wide` :
      `${sideDrawerClassName}`;
  return (
    <>
      <BackdropOverlay show={props.isOpen} />
      <div className={props.isOpen ? `${componentClassName} default-panel-padding open` : `${componentClassName} default-panel-padding`}
           data-testid="side-drawer">
        <div className="side-drawer__header">
          {props.preTitleNode}
          <h4 className="header__title" style={props.titleStyle}>{props.title}</h4>
          {props.postTitleNode}
          <button disabled={props.isLoading} className="header__close-icon close-btn" onClick={props.onCloseHandler} title={`Close ${props.title}`}>
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

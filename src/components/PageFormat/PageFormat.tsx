import React, { ReactNode, useEffect } from 'react';
import HeaderUserInfoContainer from '../../containers/HeaderUserInfoContainer';
import { routes } from '../../routes';
import { useAppVersionState } from '../../state/app-info/app-info-state';
import PageTitle from '../PageTitle/PageTitle';
import Sidebar from '../Sidebar/Sidebar';
import './PageFormat.scss';
import CloseNavIcon from '../../icons/CloseNavIcon';
import Button from '../Button/Button';


export interface PageFormatProps {
  pageTitle: string;
  children: ReactNode;
}

function PageFormat(props: any) {
  const appInfoService = useAppVersionState();

  function getBackgroundClass() {
    if (appInfoService.state.enclave?.get()?.match(/il4/i)) {
      return 'page-format__nav-menu-il4';
    }
    else if (appInfoService.state.enclave?.get()?.match(/il2/i)) {
      return 'page-format__nav-menu-il2';
    }
    else {
      return '';
    }
  }

  useEffect(() => {
    appInfoService.fetchVersion();
  }, []);

  return (
      <div className={`page-format ${props.className ?? ''}`}>
        <div className={`page-format__nav-menu ${getBackgroundClass()}`}>
          <Sidebar items={routes} />
          <div className="nav-menu__user-info">
            <HeaderUserInfoContainer />
          </div>
          <Button type="button" className="nav-menu__collapse-toggle" transparentBackground>
            <CloseNavIcon size={1} />
          </Button>
        </div>
        <div className="page-format__page-body-container">
          <div className="page-format__page-body">
            <div className="page-body__title-section">
              <PageTitle title={props.pageTitle} />
            </div>
            <div className="page-body__content default-panel-padding">
              {props.children}
            </div>
          </div>
        </div>
      </div>
  );
}

export default PageFormat;

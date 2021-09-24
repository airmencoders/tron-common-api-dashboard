import React, {ReactNode} from 'react';
import { routes } from '../../routes';
import PageTitle from '../PageTitle/PageTitle';
import Sidebar from '../Sidebar/Sidebar';

import './PageFormat.scss';
import HeaderUserInfoContainer from '../../containers/HeaderUserInfoContainer';

export interface PageFormatProps {
  pageTitle: string;
  children: ReactNode;
}

function PageFormat(props: any) {
  return (
      <div className={`page-format ${props.className ?? ''}`}>
        <div className="page-format__nav-menu">
          <Sidebar items={routes} />
          <div className="nav-menu__user-info">
            <HeaderUserInfoContainer />
          </div>
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

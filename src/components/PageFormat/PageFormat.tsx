import React, {ReactNode} from 'react';
import PageTitle from '../PageTitle/PageTitle';

import './PageFormat.scss';

export interface PageFormatProps {
  pageTitle: string;
  children: ReactNode;
}

function PageFormat(props: any) {
  return (
      <div className="page-format">
        <div className="page-format__nav-menu default-panel-padding">
          <h3 style={{color: 'white'}}>Nav Menu</h3>
        </div>
        <div className="page-format__page-body-container">
          <div className="page-format__top-nav  default-panel-padding">
            <h4>Top Nav</h4>
          </div>
          <div className="page-format__page-body">
            <div className="page-body__title-section default-panel-padding">
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

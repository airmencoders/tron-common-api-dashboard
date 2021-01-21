import React, {ReactNode} from 'react';

export interface PageFormatProps {
  pageTitle: string;
  children: ReactNode;
}

function PageFormat(props: any) {
  return (
      <div className="page-format">
        <div className="page-format__nav-menu">
          Nav Menu
        </div>
        <div className="page-format__page-body-container">

        </div>
        {props.children}
      </div>
  );
}

export default PageFormat;

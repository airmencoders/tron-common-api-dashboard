import React from 'react';
import {PageTitleProps} from './PageTitleProps';

function PageTitle({title}: PageTitleProps) {
  return (
      <div className="page-title">
        <h3>{title}</h3>
      </div>
  );
}

export default PageTitle;

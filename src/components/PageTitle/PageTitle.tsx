import React from 'react';

export interface PageTitleProps {
  title: string;
}

function PageTitle({title}: PageTitleProps) {
  return (
      <div className="page-title">
        <h3>{title}</h3>
      </div>
  );
}

export default PageTitle;

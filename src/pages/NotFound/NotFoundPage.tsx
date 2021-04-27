import React from 'react';
import PageFormat from '../../components/PageFormat/PageFormat';

export function NotFoundPage(props: any) {
  return (
    <PageFormat pageTitle="Not Found">
      <div className="not-found-page">
        <h1 className="not-found-page__title">404</h1>
        <p className="not-found-page__content">The requested page was not found!</p>
      </div>
    </PageFormat>
  )
}

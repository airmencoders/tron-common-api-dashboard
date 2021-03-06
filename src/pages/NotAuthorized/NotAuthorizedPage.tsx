import React from 'react';
import PageFormat from '../../components/PageFormat/PageFormat';

export function NotAuthorizedPage(props: any) {
  return (
    <PageFormat pageTitle="Not Authorized">
      <div className="not-authorized-page">
        <h1 className="not-authorized-page__title">403</h1>
        <p className="not-authorized-page__content">{`You don't have permissions to access the requested page.`}</p>
      </div>
    </PageFormat>
  )
}

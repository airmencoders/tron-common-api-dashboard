import React from 'react';
import { Redirect } from 'react-router';
import { RoutePath } from '../../../routes';
import { getEnumKeyByEnumValue } from '../../../utils/enum-utils';
import { decodeUri } from './metric-page-utils';
import { MetricPage } from './MetricPage';
import { MetricPageMatchProps } from './MetricPageMatchProps';
import { MetricType } from './MetricType';

export function MetricPageProtectedWrapper(props: MetricPageMatchProps) {
  const params = props.match.params;

  const metricTypeKey = getEnumKeyByEnumValue(MetricType, params.type);

  if (metricTypeKey == null) {
    return (
      <Redirect
        to={RoutePath.NOT_FOUND}
      />
    );
  }

  const metricType = MetricType[metricTypeKey];
  const revertName = decodeUri(params.name);

  return (
    <MetricPage
      id={params.id}
      name={revertName}
      type={metricType}
    />
  );
}
import { Link } from 'react-router-dom';
import { RoutePath } from '../../../routes';
import { generateMetricsLink } from './metric-page-utils';
import { MetricPageProps } from './MetricPageProps';
import { MetricType } from './metric-type';

export function MetricPageBreadcrumb({ id, type, name, method, appSourceName }: MetricPageProps & { appSourceName: string }) {
  const appSources = <Link to={RoutePath.APP_SOURCE}>App Sources</Link>;
  return (
    <div className="app-source-metrics__breadcrumbs">
      {type === MetricType.APPSOURCE ?
        <>
          {appSources}
          {` > ${appSourceName} Overview`}
        </>
        :
        <>
          {appSources}
          {` > `}
          <Link to={generateMetricsLink(id, MetricType.APPSOURCE)}>{`${appSourceName}`} Overview</Link>
          {` > ${method ? method + ':' : ''}${name}`}
        </>
      }
    </div>
  );
}
import React, { useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useAppSourceMetricState } from '../../../state/metrics/app-source-metric-state';
import SimpleAppClientMetricChart from './SimpleAppClientMetricChart';
import SimpleEndpointMetricChart from './SimpleEndpointMetricChart';
import { findChartHeight, translateData, translateOptionsForAppClient, translateOptionsForEndpoint } from './simple-metric-chart-utils';
import PageFormat from '../../../components/PageFormat/PageFormat';
import Spinner from '../../../components/Spinner/Spinner';
import { Redirect, useHistory } from 'react-router';
import { generateMetricsLink } from './metric-page-utils';
import { MetricType } from './metric-type';
import { RoutePath } from '../../../routes';
import './MetricPage.scss';
import { isRequestMethod, RequestMethod } from '../../../state/metrics/metric-service';
import { MetricPageProps } from './MetricPageProps';
import { MetricPageBreadcrumb } from './MetricPageBreadcrumb';

export function MetricPage({ id, type, name, method }: MetricPageProps) {
  const metricsService = useAppSourceMetricState();
  const history = useHistory();

  useEffect(() => {
    metricsService.fetchAndStoreAppSourceData(id);
  }, []);

  const handleOnClickChartEventAppClient = (config: any) => {
    handleOnClickChartEvent(MetricType.APPCLIENT, config.w.config.xaxis.categories[config.dataPointIndex]);
  };

  const handleOnClickChartEventEndpoint = (config: any) => {
    const splitCategory = (config.w.config.xaxis.categories[config.dataPointIndex] as string).split(':');
    const methodIndex = splitCategory.findIndex(item => isRequestMethod(item));
    const endpointMethod = splitCategory.splice(methodIndex, 1)[0] as RequestMethod;    
    const endpointName = splitCategory.join();

    handleOnClickChartEvent(MetricType.ENDPOINT, endpointName, endpointMethod);
  };

  const handleOnClickChartEvent = (metricType: MetricType, metricName: string, metricMethod?: RequestMethod | undefined) => {
    history.push(generateMetricsLink(id, metricType, metricName, metricMethod));
  }

  if (metricsService.error) {
    return (
      <Redirect
        to={RoutePath.NOT_FOUND}
      />
    );
  }

  return (
    <PageFormat pageTitle='App Source Metrics'>
      {metricsService.isPromised ? <Spinner centered /> :
        <div className="app-source-metrics">
          <MetricPageBreadcrumb id={id} name={name} type={type} method={method} appSourceName={metricsService.appSourceMetric.name ?? ''} />
          {type === MetricType.APPSOURCE ?
            <>
              <hr></hr>
              <ReactApexChart
                options={translateOptionsForEndpoint(metricsService.appSourceMetric.endpoints, handleOnClickChartEventEndpoint)}
                series={translateData(metricsService.appSourceMetric.endpoints)}
                type="bar"
                height={findChartHeight(translateOptionsForEndpoint(metricsService.appSourceMetric.endpoints, handleOnClickChartEventEndpoint))}
                width="75%"
              />
              <hr></hr>
              <ReactApexChart
                options={translateOptionsForAppClient(metricsService.appSourceMetric.appClients, handleOnClickChartEventAppClient)}
                series={translateData(metricsService.appSourceMetric.appClients)}
                type="bar"
                height={findChartHeight(translateOptionsForAppClient(metricsService.appSourceMetric.appClients, handleOnClickChartEventAppClient))}
                width="75%"
              />
            </>
            :
            type === MetricType.ENDPOINT ?
              <SimpleEndpointMetricChart
                id={id}
                name={name}
                method={method!}
                onClick={handleOnClickChartEventAppClient}
              />
              :
              <SimpleAppClientMetricChart
                id={id}
                name={name}
                onClick={handleOnClickChartEventEndpoint}
              />
          }
        </div>
      }
    </PageFormat>
  );
}

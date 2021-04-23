import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useAppSourceMetricState } from '../../../state/metrics/app-source-metric-state';
import SimpleAppClientMetricChart from './SimpleAppClientMetricChart';
import SimpleEndpointMetricChart from './SimpleEndpointMetricChart';
import { findChartHeight, translateData, translateOptions } from './simple-metric-chart-utils';
import PageFormat from '../../../components/PageFormat/PageFormat';
import Spinner from '../../../components/Spinner/Spinner';
import { Redirect, useHistory } from 'react-router';
import { generateMetricsLink } from './metric-page-utils';
import { MetricType } from './MetricType';
import { RoutePath } from '../../../routes';
import { Link } from 'react-router-dom';
import './MetricPage.scss';

export function MetricPage({ id, type, name }: { id: string, type: MetricType, name: string }) {
  const metricsService = useAppSourceMetricState();
  const [selectedSource, setSelectedSource] = useState({ appSourceId: id, name, type });

  const history = useHistory();

  useEffect(() => {
    metricsService.fetchAndStoreAppSourceData(id);
  }, []);

  useEffect(() => {
    setSelectedSource({
      appSourceId: id,
      name,
      type
    });
  }, [id, type, name])

  const handleOnClickChartEventAppClient = (config: any) => {
    handleOnClickChartEvent(config, MetricType.APPCLIENT);
  };

  const handleOnClickChartEventEndpoint = (config: any) => {
    handleOnClickChartEvent(config, MetricType.ENDPOINT);
  };

  const handleOnClickChartEvent = (config: any, type: MetricType) => {
    const name = config.w.config.xaxis.categories[config.dataPointIndex];
    setSelectedSource({
      appSourceId: id,
      name,
      type
    });

    history.push(generateMetricsLink(id, type, name));
  }

  if (metricsService.error) {
    return (
      <Redirect
        to={RoutePath.NOT_FOUND}
      />
    );
  }


  function createBreadcrumbs() {
    const appSources = <Link to={RoutePath.APP_SOURCE}>App Sources</Link>;

    if (selectedSource.type === MetricType.APPSOURCE) {
      return (
        <div className='app-source-metrics__breadcrumbs'>
          {appSources}
          {` > ${metricsService.appSourceMetric.name} Overview`}
        </div>
      )
    } else {
      return (
        <div className='app-source-metrics__breadcrumbs'>
          {appSources}
          {` > `}
          <Link to={generateMetricsLink(id, MetricType.APPSOURCE, '')}>{metricsService.appSourceMetric.name} Overview</Link>
          {` > ${selectedSource.name}`}
        </div>
      )
    }
  }

  return (
    <PageFormat pageTitle='App Source Metrics'>
      {metricsService.isPromised ? <Spinner centered /> :
        <div className="app-source-metrics">
          {createBreadcrumbs()}
          {selectedSource.type === MetricType.APPSOURCE ?
            <>
              <hr></hr>
              <ReactApexChart
                options={translateOptions(metricsService.appSourceMetric.endpoints, 'endpoint', handleOnClickChartEventEndpoint)}
                series={translateData(metricsService.appSourceMetric.endpoints)}
                type="bar"
                height={findChartHeight(translateOptions(metricsService.appSourceMetric.endpoints, 'endpoint', handleOnClickChartEventEndpoint))}
                width="75%"
              />
              <hr></hr>
              <ReactApexChart
                options={translateOptions(metricsService.appSourceMetric.appClients, 'appclient', handleOnClickChartEventAppClient)}
                series={translateData(metricsService.appSourceMetric.appClients)}
                type="bar"
                height={findChartHeight(translateOptions(metricsService.appSourceMetric.appClients, 'appclient', handleOnClickChartEventAppClient))}
                width="75%"
              />
            </>
            :
            selectedSource.type === MetricType.ENDPOINT ?
              <SimpleEndpointMetricChart
                id={selectedSource.appSourceId}
                name={selectedSource.name}
                onClick={handleOnClickChartEventAppClient}
              />
              :
              <SimpleAppClientMetricChart
                id={selectedSource.appSourceId}
                name={selectedSource.name}
                onClick={handleOnClickChartEventEndpoint}
              />
          }
        </div>
      }
    </PageFormat>
  );
}
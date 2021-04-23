import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useAppSourceMetricState } from '../../../state/metrics/app-source-metric-state';
import SimpleAppClientMetricChart from './SimpleAppClientMetricChart';
import SimpleEndpointMetricChart from './SimpleEndpointMetricChart';
import { findChartHeight, translateData, translateOptionsForAppClient, translateOptionsForEndpoint } from "./simple-metric-chart-utils";
import PageFormat from '../../../components/PageFormat/PageFormat';
import Spinner from '../../../components/Spinner/Spinner';
import { Redirect, useHistory } from 'react-router';
import { generateMetricsLink } from './metric-page-utils';
import { MetricType } from './MetricType';
import { RoutePath } from '../../../routes';
import { Link } from 'react-router-dom';
import './MetricPage.scss';
import { isRequestMethod, RequestMethod } from "../../../state/metrics/metric-service";

type SelectedSource = { appSourceId: string, name: string, type: string, method?: RequestMethod };

export function MetricPage({ id, type, name, method }: { id: string, type: MetricType, name: string, method: RequestMethod | undefined }) {
  const defaultSelectedSource: SelectedSource = {appSourceId: id, name: '', type, method: undefined};
  const metricsService = useAppSourceMetricState();
  const [selectedSource, setSelectedSource] = useState<SelectedSource>({ appSourceId: id, name, type, method: undefined });

  const history = useHistory();

  useEffect(() => {
    metricsService.fetchAndStoreAppSourceData(id);
  }, []);

  useEffect(() => {
    setSelectedSource({
      appSourceId: id,
      name,
      type,
      method
    });
  }, [id, type, name, method])

  const handleOnClickChartEventAppClient = (config: any) => {
    handleOnClickChartEvent(MetricType.APPCLIENT, config.w.config.xaxis.categories[config.dataPointIndex]);
  };

  const handleOnClickChartEventEndpoint = (config: any) => {
    const splitCategory = (config.w.config.xaxis.categories[config.dataPointIndex] as string).split(':');
    const methodIndex = splitCategory.findIndex(item => isRequestMethod(item));
    const method = splitCategory.splice(methodIndex, 1)[0] as RequestMethod;    
    const name = splitCategory.join();

    handleOnClickChartEvent(MetricType.ENDPOINT, name, method);
  };

  const handleOnClickChartEvent = (type: MetricType, name: string, method?: RequestMethod | undefined) => {
    setSelectedSource({
      appSourceId: id,
      name,
      type,
      method
    });

    history.push(generateMetricsLink(id, type, name, method));
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
          <Link to={generateMetricsLink(id, MetricType.APPSOURCE)}>{metricsService.appSourceMetric.name} Overview</Link>
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
            selectedSource.type === MetricType.ENDPOINT ?
              <SimpleEndpointMetricChart
                id={selectedSource.appSourceId}
                name={selectedSource.name}
                method={selectedSource.method!}
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

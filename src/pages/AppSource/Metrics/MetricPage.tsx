import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Link } from "react-router-dom";
import { useAppSourceMetricState } from "../../../state/metrics/app-source-metric-state";
import SimpleAppClientMetricChart from "./SimpleAppClientMetricChart";
import SimpleEndpointMetricChart from "./SimpleEndpointMetricChart";
import { findChartHeight, translateData, translateOptions } from "./simple-metric-chart-utils";

export function MetricPage(props: {id: string, name: string, titleChange: (newTitle: string) => void, linkChange: (newLink?: JSX.Element) => void}) {
  const metricsService = useAppSourceMetricState();
  const [selectedSource, setSelectedSource] = useState({appSourceId: props.id, name: '', type: 'appsource'});

  useEffect(() => {
      metricsService.fetchAndStoreAppSourceData(props.id);
      props.titleChange('App Sources > ' + props.name);
  }, []);
  
  const handleOnClickChartEventAppClient = (config: any) => {
    handleOnClickChartEvent(config, 'appclient');
  };

  const handleOnClickChartEventEndpoint = (config: any) => {
    handleOnClickChartEvent(config, 'endpoint');
  };

  const handleOnClickChartEvent = (config: any, type: string) => {
    setSelectedSource({
      appSourceId: props.id,
      name: config.w.config.xaxis.categories[config.dataPointIndex],
      type: type
    });    
    props.linkChange(<Link to="/app-source" onClick={resetToDefault}>Go back to <i>{props.name}</i> Overview Metrics</Link>);
    props.titleChange('App Sources > ' + props.name + ' > ' + config.w.config.xaxis.categories[config.dataPointIndex]);
  }

  const resetToDefault = () => {
    setSelectedSource({
      appSourceId: props.id,
      name: '',
      type: 'appsource'
    })
    props.linkChange();
    props.titleChange('App Sources > ' + props.name);
  }

  return selectedSource.type === 'appsource' ? (
    <span>
      <div style={{"height" : "100%"}}>
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
      </div>
    </span>
  ) : 
  selectedSource.type === 'endpoint' ? (
    <SimpleEndpointMetricChart
      id={selectedSource.appSourceId}
      name={selectedSource.name}
      onClick={handleOnClickChartEventAppClient}
    />
    ) : 
    (<SimpleAppClientMetricChart
      id={selectedSource.appSourceId}
      name={selectedSource.name}
      onClick={handleOnClickChartEventEndpoint}
      />
    );
}
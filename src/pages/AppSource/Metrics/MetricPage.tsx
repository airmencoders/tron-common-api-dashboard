import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Link } from "react-router-dom";
import { useAppSourceMetricState } from "../../../state/metrics/app-source-metric-state";
import { isRequestMethod, RequestMethod } from "../../../state/metrics/metric-service";
import { findChartHeight, translateData, translateOptionsForAppClient, translateOptionsForEndpoint } from "./simple-metric-chart-utils";
import SimpleAppClientMetricChart from "./SimpleAppClientMetricChart";
import SimpleEndpointMetricChart from "./SimpleEndpointMetricChart";

export function MetricPage(props: {id: string, name: string, titleChange: (newTitle: string) => void, linkChange: (newLink?: JSX.Element) => void}) {
  const defaultSelectedSource: SelectedSource = {appSourceId: props.id, name: '', type: 'appsource', method: undefined};
  const metricsService = useAppSourceMetricState();
  const [selectedSource, setSelectedSource] = useState(defaultSelectedSource);

  useEffect(() => {
      metricsService.fetchAndStoreAppSourceData(props.id);
      props.titleChange('App Sources > ' + props.name);
  }, []);
  
  const handleOnClickChartEventAppClient = (config: any) => {
    handleOnClickChartEvent(config, 'appclient', config.w.config.xaxis.categories[config.dataPointIndex]);
  };

  const handleOnClickChartEventEndpoint = (config: any) => {
    const splitCategory = (config.w.config.xaxis.categories[config.dataPointIndex] as string).split(':');
    const methodIndex = splitCategory.findIndex(item => isRequestMethod(item));
    const method = splitCategory.splice(methodIndex, 1)[0] as RequestMethod;    
    const name = splitCategory.join();

    handleOnClickChartEvent(config, 'endpoint', name, method);
  };

  const handleOnClickChartEvent = (config: any, type: string, name: string, method?: RequestMethod | undefined) => {
    setSelectedSource({
      appSourceId: props.id,
      name: name,
      type: type,
      method: method
    });    
    props.linkChange(<Link to="/app-source" onClick={resetToDefault}>Go back to <i>{props.name}</i> Overview Metrics</Link>);
    props.titleChange('App Sources > ' + props.name + ' > ' + name);
  }

  const resetToDefault = () => {
    setSelectedSource(defaultSelectedSource);
    props.linkChange();
    props.titleChange('App Sources > ' + props.name);
  }

  return selectedSource.type === 'appsource' ? (
    <span>
      <div style={{"height" : "100%"}}>
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
      </div>
    </span>
  ) : 
  selectedSource.type === 'endpoint' ? (
    <SimpleEndpointMetricChart
      id={selectedSource.appSourceId}
      name={selectedSource.name}
      method={selectedSource.method!}
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

type SelectedSource = { appSourceId: string, name: string, type: string, method?: RequestMethod };

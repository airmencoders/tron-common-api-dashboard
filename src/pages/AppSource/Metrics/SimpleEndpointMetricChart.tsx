import { useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Redirect } from "react-router";
import Spinner from "../../../components/Spinner/Spinner";
import { RoutePath } from "../../../routes";
import { useAppEndpointMetricState } from "../../../state/metrics/app-endpoint-metric-state";
import { findChartHeight, translateData, translateOptions } from "./simple-metric-chart-utils";

function SimpleEndpointMetricChart(props: {id: string, name: string, onClick: (config: any) => void}) {
  const metricsService = useAppEndpointMetricState();
      
  useEffect(() => {
    metricsService?.fetchAndStoreAppSourceData(props.id, props.name);
  }, []);

  if (metricsService.isPromised) {
    return <Spinner centered />;
  }

  if (metricsService.error) {
    return (
      <Redirect to={RoutePath.NOT_FOUND} />
    );
  }

  return (
      <ReactApexChart 
        options={translateOptions(metricsService.countMetric.appClients, 'appclient', props.onClick)}
        series={translateData(metricsService.countMetric.appClients)}
        type="bar"
        height={findChartHeight(translateOptions(metricsService.countMetric.appClients, 'appclient', props.onClick))}
        width="75%"
      />
  );
}

export default SimpleEndpointMetricChart;
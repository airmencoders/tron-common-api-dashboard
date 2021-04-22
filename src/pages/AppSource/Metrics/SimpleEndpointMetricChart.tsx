import { useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import Spinner from "../../../components/Spinner/Spinner";
import { useAppEndpointMetricState } from "../../../state/metrics/app-endpoint-metric-state";
import { RequestMethod } from "../../../state/metrics/metric-service";
import { findChartHeight, translateData, translateOptionsForAppClient } from "./simple-metric-chart-utils";

function SimpleEndpointMetricChart(props: {id: string, name: string, method: RequestMethod, onClick: (config: any) => void}) {
  const metricsService = useAppEndpointMetricState();
      
  useEffect(() => {
    metricsService?.fetchAndStoreAppSourceData(props.id, props.name, props.method);
  }, []);

  if (metricsService.isPromised) {
    return <Spinner centered />;
  }

  return (
      <ReactApexChart 
        options={translateOptionsForAppClient(metricsService.countMetric.appClients, props.onClick)}
        series={translateData(metricsService.countMetric.appClients)}
        type="bar"
        height={findChartHeight(translateOptionsForAppClient(metricsService.countMetric.appClients, props.onClick))}
        width="75%"
      />
  );
}

export default SimpleEndpointMetricChart;
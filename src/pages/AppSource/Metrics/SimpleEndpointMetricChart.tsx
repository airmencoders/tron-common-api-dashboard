import { useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import Spinner from "../../../components/Spinner/Spinner";
import { useAppEndpointMetricState } from "../../../state/metrics/app-endpoint-metric-state";
import { findChartHeight, translateData, translateOptions } from "./SimpleMetricChart";

function SimpleEndpointMetricChart(props: {id: string, name: string, onClick: (config: any) => void}) {
  const metricsService = useAppEndpointMetricState();
      
  useEffect(() => {
    metricsService?.fetchAndStoreAppSourceData(props.id, props.name);
  }, []);

  if (metricsService.isPromised) {
    return <Spinner centered />;
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
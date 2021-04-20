import { useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import Spinner from "../../../components/Spinner/Spinner";
import { useAppClientMetricState } from "../../../state/metrics/app-client-user-metric-state";
import { findChartHeight, translateData, translateOptions } from "./SimpleMetricChart";

function SimpleAppClientMetricChart(props: {id: string, name: string, onClick: (config: any) => void}) {
  const metricsService = useAppClientMetricState();
       
  useEffect(() => {
    metricsService?.fetchAndStoreAppSourceData(props.id, props.name);
  }, []);

  if (metricsService.isPromised) {
    return <Spinner centered />;
  }

  return (
      <ReactApexChart 
        options={translateOptions(metricsService.countMetric.endpoints, 'endpoint', props.onClick)}
        series={translateData(metricsService.countMetric.endpoints)}
        type="bar"
        height={findChartHeight(translateOptions(metricsService.countMetric.endpoints, 'endpoint', props.onClick))}
        width="75%"
      />
  );
}

export default SimpleAppClientMetricChart;
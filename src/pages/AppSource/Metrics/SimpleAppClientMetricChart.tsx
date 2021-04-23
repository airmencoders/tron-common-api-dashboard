import { useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Redirect } from "react-router";
import Spinner from "../../../components/Spinner/Spinner";
import { RoutePath } from "../../../routes";
import { useAppClientMetricState } from "../../../state/metrics/app-client-user-metric-state";
import { findChartHeight, translateData, translateOptionsForEndpoint } from "./simple-metric-chart-utils";

function SimpleAppClientMetricChart(props: {id: string, name: string, onClick: (config: any) => void}) {
  const metricsService = useAppClientMetricState();
       
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
        options={translateOptionsForEndpoint(metricsService.countMetric.endpoints, props.onClick)}
        series={translateData(metricsService.countMetric.endpoints)}
        type="bar"
        height={findChartHeight(translateOptionsForEndpoint(metricsService.countMetric.endpoints, props.onClick))}
        width="75%"
      />
  );
}

export default SimpleAppClientMetricChart;
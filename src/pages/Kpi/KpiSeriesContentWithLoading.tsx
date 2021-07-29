import { Downgraded } from '@hookstate/core';
import ChartWithTitleAndTotal from '../../components/Chart/ChartWithTitleAndTotal';
import withLoading from '../../hocs/UseLoading/WithLoading';
import { KpiSummaryDto, UniqueVisitorCountDtoVisitorTypeEnum } from '../../openapi';
import { useKpiState } from '../../state/kpi/kpi-state';
import './KpiSeriesContentWithLoading.scss';

function KpiSeriesContent() {
  const kpiService = useKpiState();

  const kpis = kpiService.state.value as KpiSummaryDto[];
  if (kpis == null) {
    return null;
  }

  const copiedKpis = [...kpiService.state.attach(Downgraded).value as KpiSummaryDto[]].sort((a, b) => {
    return a.startDate.localeCompare(b.startDate);
  });

  const dateLabels: string[] = [];

  const appClientToAppSourceRequestSeries: Array<number | undefined> = [];

  const requestCountSeries: Array<number | undefined> = [];

  const appSourceSeries: Array<number | undefined> = [];

  const avgUniqueDashboardUserSeries: Array<number | undefined> = [];
  const avgUniqueAppClientSeries: Array<number | undefined> = [];

  const latencySeries: Array<number | undefined> = [];

  copiedKpis.forEach(kpi => {
    dateLabels.push(kpi.startDate);

    appClientToAppSourceRequestSeries.push(kpi.appClientToAppSourceRequestCount);

    appSourceSeries.push(kpi.appSourceCount);

    let totalRequests = 0;
    kpi.uniqueVisitorCounts?.forEach(visitor => {
      if (visitor.visitorType === UniqueVisitorCountDtoVisitorTypeEnum.AppClient) {
        avgUniqueAppClientSeries.push(visitor.uniqueCount);
      }

      if (visitor.visitorType === UniqueVisitorCountDtoVisitorTypeEnum.DashboardUser) {
        avgUniqueDashboardUserSeries.push(visitor.uniqueCount);
      }

      totalRequests += visitor.requestCount;
    });
    requestCountSeries.push(totalRequests);

    latencySeries.push(kpi.averageLatencyForSuccessfulRequests)

  });

  return (
    <div className="kpi-series">
      <h4>KPI Series Data</h4>
      <div className="kpi-series__flex-chart">
        <ChartWithTitleAndTotal
          series={{ name: '', data: requestCountSeries }}
          title="Total Requests"
          labels={dateLabels}
        />

        <ChartWithTitleAndTotal
          series={{ name: '', data: appClientToAppSourceRequestSeries }}
          title="Total App Client To App Source Requests"
          labels={dateLabels}
        />
      </div>

      <ChartWithTitleAndTotal
        series={{ name: '', data: appSourceSeries }}
        title="App Sources"
        labels={dateLabels}
        hideTotal
      />

      <div className="kpi-series__flex-chart">
        <ChartWithTitleAndTotal
          series={{ name: '', data: avgUniqueDashboardUserSeries }}
          title="Avg Unique Dashboard Users"
          labels={dateLabels}
          calculateAverage
        />

        <ChartWithTitleAndTotal
          series={{ name: '', data: avgUniqueAppClientSeries }}
          title="Avg Unique App Clients"
          labels={dateLabels}
          calculateAverage
        />
      </div>

      <ChartWithTitleAndTotal
        series={{ name: '', data: latencySeries }}
        title="Avg Latency For Successful Requests"
        labels={dateLabels}
        hideTotal
      />
    </div>
  );
}

export default withLoading(KpiSeriesContent);
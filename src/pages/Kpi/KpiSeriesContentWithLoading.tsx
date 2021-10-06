import {Downgraded} from '@hookstate/core';
import ChartWithTitleAndTotal from '../../components/Chart/ChartWithTitleAndTotal';
import withLoading from '../../hocs/UseLoading/WithLoading';
import {KpiSummaryDto, UniqueVisitorCountDtoVisitorTypeEnum} from '../../openapi';
import {useKpiState} from '../../state/kpi/kpi-state';
import './KpiSeriesContentWithLoading.scss';
import KpiMiniChart from '../../components/KpiMiniChart/KpiMiniChart';
import KpiMiniData from '../../components/KpiMiniChart/kpi-mini-data';
import {useKpiPageState} from './kpi-page-state';
import {KpiChartTitles} from './kpi-chart-titles';
import {useMemo} from 'react';

function KpiSeriesContent() {
  const kpiService = useKpiState();
  const kpiPageState = useKpiPageState();
  const dateLabels: string[] = [];

  const appClientToAppSourceRequestSeries: Array<number | undefined> = [];
  const clientToSourceSeriesMini: Array<KpiMiniData> = [];
  let clientToSourceTotal = 0;

  const requestCountSeries: Array<number | undefined> = [];

  const requestCountSeriesMini: Array<KpiMiniData> = [];
  let requestCountTotal = 0;

  const appSourceSeries: Array<number | undefined> = [];
  const appSourceSeriesMini: Array<KpiMiniData> = [];
  let lastAppSourceCount = 0;

  const avgUniqueDashboardUserSeries: Array<number | undefined> = [];
  const uniqueDashUsersSeriesMini: Array<KpiMiniData> = [];
  let uniqueDashUsersTotal = 0;

  const avgUniqueAppClientSeries: Array<number | undefined> = [];
  const uniqueAppClientsSeriesMini: Array<KpiMiniData> = [];
  let uniqueAppClientsTotal = 0;

  const latencySeries: Array<number | undefined> = [];
  const latencySeriesMini: Array<KpiMiniData> = [];
  let latencySeriesTotal = 0;
  const kpis = kpiService.state.promised ? null : kpiService.state.value as KpiSummaryDto[];

  const miniCharts: Record<string, { data: Array<KpiMiniData>, title: string, total: number }> = {};
  if (kpis != null) {

    const copiedKpis = [...kpiService.state.attach(Downgraded).value as KpiSummaryDto[]].sort((a, b) => {
      return a.startDate.localeCompare(b.startDate);
    });

    copiedKpis.forEach(kpi => {
      const dateValue = new Date(kpi.endDate);

      dateLabels.push(kpi.endDate);

      appClientToAppSourceRequestSeries.push(kpi.appClientToAppSourceRequestCount);
      clientToSourceSeriesMini.push({date: dateValue, primaryValue: kpi.appClientToAppSourceRequestCount});
      clientToSourceTotal += kpi.appClientToAppSourceRequestCount;

      appSourceSeries.push(kpi.appSourceCount);
      appSourceSeriesMini.push({date: dateValue, primaryValue: kpi.appSourceCount})
      lastAppSourceCount = kpi.appSourceCount;

      let totalRequests = 0;
      kpi.uniqueVisitorCounts?.forEach(visitor => {
        if (visitor.visitorType === UniqueVisitorCountDtoVisitorTypeEnum.AppClient) {
          avgUniqueAppClientSeries.push(visitor.uniqueCount);
          uniqueAppClientsSeriesMini.push({date: dateValue, primaryValue: visitor.uniqueCount});
          uniqueAppClientsTotal += visitor.uniqueCount;
        }

        if (visitor.visitorType === UniqueVisitorCountDtoVisitorTypeEnum.DashboardUser) {
          avgUniqueDashboardUserSeries.push(visitor.uniqueCount);
          uniqueDashUsersSeriesMini.push({date: dateValue, primaryValue: visitor.uniqueCount});
          uniqueDashUsersTotal += visitor.uniqueCount;
        }

        totalRequests += visitor.requestCount;
      });
      requestCountSeries.push(totalRequests);
      requestCountTotal += totalRequests;
      requestCountSeriesMini.push({date: dateValue, primaryValue: totalRequests})
      latencySeries.push(kpi.averageLatencyForSuccessfulRequests)
      latencySeriesMini.push({date: dateValue, primaryValue: kpi.averageLatencyForSuccessfulRequests});
      latencySeriesTotal += kpi.averageLatencyForSuccessfulRequests ?? 0;
    });

    miniCharts[KpiChartTitles.TOTAL_REQUESTS] = {
      data: requestCountSeriesMini,
      title: KpiChartTitles.TOTAL_REQUESTS,
      total: requestCountTotal
    };
    miniCharts[KpiChartTitles.CLIENT_TO_SOURCE_REQUESTS] = {
      data: clientToSourceSeriesMini,
      title: KpiChartTitles.CLIENT_TO_SOURCE_REQUESTS,
      total: clientToSourceTotal
    };
    miniCharts[KpiChartTitles.APP_SOURCES] = {
      data: appSourceSeriesMini,
      title: KpiChartTitles.APP_SOURCES,
      total: lastAppSourceCount
    };
    miniCharts[KpiChartTitles.AVG_UNIQUE_DASHBOARD_USERS] = {
      data: uniqueDashUsersSeriesMini, title: KpiChartTitles.AVG_UNIQUE_DASHBOARD_USERS,
      total: uniqueDashUsersTotal / copiedKpis.length
    };
    miniCharts[KpiChartTitles.AVG_UNIQUE_APP_CLIENTS] = {
      data: uniqueAppClientsSeriesMini, title: KpiChartTitles.AVG_UNIQUE_APP_CLIENTS,
      total: uniqueAppClientsTotal / copiedKpis.length
    };
    miniCharts[KpiChartTitles.AVG_LATENCY_SUCCESSFUL_REQUESTS] = {
      data: latencySeriesMini, title: KpiChartTitles.AVG_LATENCY_SUCCESSFUL_REQUESTS,
      total: latencySeriesTotal / copiedKpis.length
    }
  }


  const miniChartOrder: Array<string> =
      [
          KpiChartTitles.TOTAL_REQUESTS,
          KpiChartTitles.CLIENT_TO_SOURCE_REQUESTS,
          KpiChartTitles.APP_SOURCES,
          KpiChartTitles.AVG_UNIQUE_DASHBOARD_USERS,
          KpiChartTitles.AVG_UNIQUE_APP_CLIENTS,
          KpiChartTitles.AVG_LATENCY_SUCCESSFUL_REQUESTS,
      ];

  const handleMiniChartSelected = (chartTitle: string) => {
    kpiPageState.set({...kpiPageState.attach(Downgraded).get(), selectedTab: chartTitle});
  };

  const fullChartData: Array<{x: number, y: number}> = useMemo(() => {
    if (kpiPageState.get().selectedTab == null) {
      return [];
    }
    return miniCharts[kpiPageState.get().selectedTab as string]?.data.map((point) => {
      return { x: point.date.getTime(), y: point.primaryValue ?? 0 };
    });
  }, [kpiPageState.get().selectedTab]);

  return (
    <div className="kpi-series">
      {
        kpis != null && (
            <>
              <div className="kpi-series__contents">
                <div className="kpi-series-mini-charts__row">
                  {
                    miniChartOrder.map(miniChartKey => (
                        <KpiMiniChart
                            key={miniCharts[miniChartKey].title}
                            data={miniCharts[miniChartKey].data}
                            aggregateValues={{primaryValue: miniCharts[miniChartKey].total}}
                            isActive={kpiPageState.get().selectedTab === miniCharts[miniChartKey].title}
                            title={miniCharts[miniChartKey].title}
                            onSelected={handleMiniChartSelected}
                        />
                    ))
                  }
                </div>
              </div>
              <div className="kpi-series__kpi-chart">
                {
                  kpiPageState.get().selectedTab != null &&
                  <ChartWithTitleAndTotal
                      series={{data: fullChartData}}
                      total={miniCharts[kpiPageState.get().selectedTab as string]?.total}
                      title={miniCharts[kpiPageState.get().selectedTab as string]?.title}
                  />
                }
              </div>
            </>
        )
      }
    </div>
  );
}

export default withLoading(KpiSeriesContent);

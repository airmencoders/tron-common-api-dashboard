import React from 'react';
import withLoading from '../../hocs/UseLoading/WithLoading';
import { KpiSummaryDto, UniqueVisitorCountDtoVisitorTypeEnum } from '../../openapi';
import { useKpiState } from '../../state/kpi/kpi-state';
import './KpiSummaryContentWithLoading.scss';

function KpiSummaryContent() {
  const kpiService = useKpiState();

  const kpis = kpiService.state.value as KpiSummaryDto;
  if (kpis == null) {
    return null;
  }

  const appClientVisitorCount = kpis.uniqueVisitorCounts?.find(visitor => visitor.visitorType === UniqueVisitorCountDtoVisitorTypeEnum.AppClient);
  const dashboardVisitorCount = kpis.uniqueVisitorCounts?.find(visitor => visitor.visitorType === UniqueVisitorCountDtoVisitorTypeEnum.DashboardUser);

  return (
    <div className="kpi-summary">
      <h4>Showing KPIs for {kpis.startDate} to {kpis.endDate}</h4>
      <h5>Usage</h5>
      <table>
        <thead>
          <tr>
            <th>Unique Users</th>
            <th>Count</th>
            <th>Request Count</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>App Clients</td>
            <td>{appClientVisitorCount?.uniqueCount ?? 'N/A'}</td>
            <td>{appClientVisitorCount?.requestCount ?? 'N/A'}</td>
          </tr>
          <tr>
            <td>Dashboard Users</td>
            <td>{dashboardVisitorCount?.uniqueCount ?? 'N/A'}</td>
            <td>{dashboardVisitorCount?.requestCount ?? 'N/A'}</td>
          </tr>
        </tbody>
      </table>

      <table>
        <thead>
          <tr>
            <th>Other</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>App Client to App Source Requests</td>
            <td>{kpis.appClientToAppSourceRequestCount}</td>
          </tr>
        </tbody>
      </table>

      <h5>Growth</h5>
      <table>
        <thead>
          <tr>
            <th>KPI</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total App Source Count</td>
            <td>{kpis.appSourceCount}</td>
          </tr>
        </tbody>
      </table>

      <h5>Performance</h5>
      <table>
        <thead>
          <tr>
            <th>KPI</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Avg Latency for Successful Requests</td>
            <td>{kpis.averageLatencyForSuccessfulRequests?.toFixed(2) ?? 'N/A'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default withLoading(KpiSummaryContent);
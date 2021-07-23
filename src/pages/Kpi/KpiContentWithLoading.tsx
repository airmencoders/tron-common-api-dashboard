import React from 'react';
import withLoading from '../../hocs/UseLoading/WithLoading';
import { useKpiState } from '../../state/kpi/kpi-state';
import './KpiContentWithLoading.scss';
import { KpiContentWithLoadingProps } from './KpiContentWithLoadingProps';

function KpiContent(props: KpiContentWithLoadingProps) {
  const kpiService = useKpiState();

  if (!kpiService.isSet) {
    return (
      <></>
    );
  }

  const kpis = kpiService.state.value;

  return (
    <div className="kpi-summary">
      <h4>Showing KPIs for {props.startDate} to {props.endDate}</h4>
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
            <td>{kpis.uniqueVisitorySummary?.appClientCount ?? 'N/A'}</td>
            <td>{kpis.uniqueVisitorySummary?.appClientRequestCount ?? 'N/A'}</td>
          </tr>
          <tr>
            <td>Dashboard Users</td>
            <td>{kpis.uniqueVisitorySummary?.dashboardUserCount ?? 'N/A'}</td>
            <td>{kpis.uniqueVisitorySummary?.dashboardUserRequestCount ?? 'N/A'}</td>
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
            <td>{kpis.appClientToAppSourceRequestCount ?? 'N/A'}</td>
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
            <td>{kpis.appSourceCount ?? 'N/A'}</td>
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
            <td>{kpis.averageLatencyForSuccessfulRequests ?? 'N/A'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default withLoading(KpiContent);
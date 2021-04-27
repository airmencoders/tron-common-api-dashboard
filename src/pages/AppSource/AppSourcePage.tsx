import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { DataCrudFormPage } from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import MetricCellRenderer from '../../components/MetricCellRenderer/MetricCellRenderer';
import { AppSourceDetailsDto, AppSourceDto } from '../../openapi';
import { useAppSourceState } from '../../state/app-source/app-source-state';
import AppSourceForm from './AppSourceForm';
import { generateMetricsLink } from './Metrics/metric-page-utils';
import { MetricType } from './Metrics/metric-type';
  
export function AppSourcePage() {
  const history = useHistory();

  const showMetric = async (event: any): Promise<void> => {
    const path = generateMetricsLink(event.id, MetricType.APPSOURCE, event.name);

    history.push(path);
  }

  const columnHeaders: GridColumn[] = [
    new GridColumn({
      field: 'id',
      sortable: true,
      filter: true,
      headerName: 'ID'
    }),
    new GridColumn({
      field: 'name',
      sortable: true,
      filter: true,
      headerName: 'Name'
    }),
    new GridColumn({
      field: 'clientCount',
      sortable: true,
      filter: true,
      headerName: 'Client Count'
    }),
    new GridColumn({
      field: 'endpointCount',
      sortable: true,
      filter: true,
      headerName: 'Endpoint Count'
    }),
    new GridColumn({
      field: 'metrics',
      sortable: false,
      filter: false,
      headerName: 'Metrics',
      headerClass: 'header-center',
      cellRenderer: MetricCellRenderer,
      cellRendererParams: { onClick: showMetric }
    })
  ];
  
  return (
    <DataCrudFormPage<AppSourceDto, AppSourceDetailsDto>
      columns={columnHeaders}
      dataTypeName="App Source"
      pageTitle="App Sources"
      updateForm={AppSourceForm}
      useDataState={useAppSourceState}
      allowEdit={true}
      autoResizeColumns
      autoResizeColummnsMinWidth={800}
    />
  );
}

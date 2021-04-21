import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataCrudFormPage } from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import MetricCellRenderer from '../../components/MetricCellRenderer/MetricCellRenderer';
import PageFormat from '../../components/PageFormat/PageFormat';
import { AppSourceDetailsDto, AppSourceDto } from '../../openapi';
import { useAppSourceState } from '../../state/app-source/app-source-state';
import AppSourceForm from './AppSourceForm';
import { MetricPage } from './Metrics/MetricPage';
  
export function AppSourcePage() {
  const state = useAppSourceState();
  
  useEffect(() => {
    state.fetchAndStoreData();
  }, []);
  const defaultLink = <Link to="/app-source" onClick={() => setRenderComponent('grid')}>Go back to <i>App Sources Table</i></Link>;
  const [renderComponent, setRenderComponent] = useState('grid'); 
  const [selectedAppSource, setSelectedAppSource] = useState({id: '', name: ''});
  const [title, setTitle] = useState('App Sources > ' + selectedAppSource.name);
  const [link, setLink] = useState(defaultLink);

  const showMetric = async (event: any): Promise<void> => {
    setRenderComponent('metric');
    setSelectedAppSource(event);
  }

  const changeTitle = (newTitle: string): void => {
    setTitle(newTitle);
  }
  
  const changeLink = (newLink?: JSX.Element): void => {
    if(newLink == null) {
      setLink(defaultLink);
    } else {
      setLink(newLink);
    }
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
  
  return renderComponent === 'grid' ? 
  (
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
  ) : 
  (
    <PageFormat pageTitle={title}>
      {link}
      <MetricPage 
        id={selectedAppSource.id}
        name={selectedAppSource.name}
        titleChange={changeTitle}
        linkChange={changeLink}
      />
    </PageFormat>
  );
}

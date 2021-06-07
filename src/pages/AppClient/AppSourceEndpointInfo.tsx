import React, {useEffect, useState} from 'react';
import {AppSourceEndpointEditorProps} from '../AppSource/AppSourceEndpointEditorProps';
import ItemChooser from '../../components/ItemChooser/ItemChooser';
import GridColumn from '../../components/Grid/GridColumn';
import {AppSourceEndpointInfoProps} from './AppSourceEndpointInfoProps';
import {GridApi} from 'ag-grid-community';

const appSourceEndpointColumns: GridColumn[] = [
  new GridColumn({
    field: 'path',
    sortable: true,
    filter: true,
    headerName: 'Path',
    resizable: true,
  }),
  new GridColumn({
    field: 'method',
    sortable: true,
    filter: true,
    headerName: 'Request Type',
    resizable: true
  })
];

function AppSourceEndpointInfo(props: AppSourceEndpointInfoProps) {
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);
  const handleGridReady = (gridApi: GridApi | undefined) => {
    setGridApi(gridApi);
  }
  useEffect(() => {
    if (props.isOpened) {
      gridApi?.sizeColumnsToFit();
    }
  },[props.isOpened]);
  return (
      <div className="app-source-endpoint-info">
        <ItemChooser
            columns={appSourceEndpointColumns}
            items={props.appSourceDevDetails?.allowedEndpoints ?? []}
            onRowClicked={() => { return; }}
            onGridReady={handleGridReady}
        />
      </div>
  );
}

export default AppSourceEndpointInfo;

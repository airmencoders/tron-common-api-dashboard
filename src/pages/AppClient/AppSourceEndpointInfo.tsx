import React, {useEffect, useMemo, useState} from 'react';
import ItemChooser from '../../components/ItemChooser/ItemChooser';
import GridColumn from '../../components/Grid/GridColumn';
import {AppSourceEndpointInfoProps} from './AppSourceEndpointInfoProps';
import {GridApi} from 'ag-grid-community';
import RowActionCellRenderer from '../../components/RowActionCellRenderer/RowActionCellRenderer';
import {RowActionCellRendererParams} from '../../components/RowActionCellRenderer/RowActionCellRendererParams';
import TestApiRowAction from '../../components/TestApiRowAction/TestApiRowAction';
import {ActionDef} from '../../components/RowActionCellRenderer/action-def';
import Modal from '../../components/Modal/Modal';
import ModalTitle from '../../components/Modal/ModalTitle';

function AppSourceEndpointInfo(props: AppSourceEndpointInfoProps) {
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);
  const [endpointToTest, setEndpointToTest] = useState(undefined);

  const appSourceEndpointColumns: GridColumn[] = useMemo(() => [
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
    }),
    new GridColumn({
      field: '',
      headerName: 'Test',
      resizable: false,
      cellRenderer: RowActionCellRenderer,
      cellRendererParams: {
        actions: [
          {
            component: TestApiRowAction,
            props: {
              onActionClick: (data:any) => {
                const endpointData = data?.data;
                if (endpointData != null) {
                  setEndpointToTest(endpointData);
                }
              }}
          }
        ] as Array<ActionDef>
      } as RowActionCellRendererParams
    })
  ], []);

  useEffect(() => {
    if (props.isOpened) {
      gridApi?.sizeColumnsToFit();
    }
  },[props.isOpened]);

  const handleGridReady = (gridApi: GridApi | undefined) => {
    setGridApi(gridApi);
  }

  const handleModalHide = () => {
    setEndpointToTest(undefined);
  };

  return (
      <div className="app-source-endpoint-info">
        <ItemChooser
            columns={appSourceEndpointColumns}
            items={props.appSourceDevDetails?.allowedEndpoints ?? []}
            onRowClicked={() => { return; }}
            onGridReady={handleGridReady}
        />
        <Modal
            headerComponent={<ModalTitle title="Test Endpoint" />}
            footerComponent={<></>}
            show={endpointToTest != null}
            onHide={handleModalHide}
        >
          <div>{JSON.stringify(endpointToTest)}</div>
        </Modal>
      </div>
  );
}

export default AppSourceEndpointInfo;

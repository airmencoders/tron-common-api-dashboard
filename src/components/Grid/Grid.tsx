import React, {useEffect, useState} from 'react';
import {GridProps} from './GridProps';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';

import './Grid.scss';
import {GridReadyEvent} from 'ag-grid-community/dist/lib/events';
import {GridApi} from 'ag-grid-community';

function Grid(props: GridProps) {
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);
  const gridReady = (event: GridReadyEvent) => {
    event.api.sizeColumnsToFit();

    setGridApi(event.api);
  };

  useEffect(() => {
    gridApi?.setRowData(props.data);
  }, [props.data]);

  return (
      <div className="grid-component"
           style={{ width: '100%', height: props.height ?? '60vh'}}
      >
        <div className="ag-theme-alpine" style={{ width: '100%', height: '100%'}}>
          <AgGridReact
              rowData={props.data}
              onGridReady={gridReady}
              onRowClicked={props.onRowClicked}
              rowClass={props.rowClass}
              quickFilterText={props.quickFilterText || ''}
              rowSelection={props.rowSelection || 'none'}
          >
            {
              props.columns.map(col => (
                <AgGridColumn
                    key={col.field}
                    field={col.field}
                    headerName={col.headerName}
                    sortable={col.sortable}
                    filter={col.filter}
                    headerClass={col.headerClass}
                    cellRendererFramework={col.cellRenderer}
                />
              ))
            }
          </AgGridReact>
        </div>
      </div>
  );
}

export default Grid;

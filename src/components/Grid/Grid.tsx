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
      <div className="grid-component ag-theme-alpine"
           style={{ width: '100%', height: '100%' }}
      >
        <AgGridReact
            rowData={props.data}
            onGridReady={gridReady}
            domLayout={"autoHeight"}
            onRowClicked={props.onRowClicked}
            rowClass={props.rowClass}
        >
          {
            props.columns.map(col => (
              <AgGridColumn
                  key={col.field}
                  field={col.field}
                  headerName={col.headerName}
                  sortable={col.sortable}
                  filter={col.filter}
              />
            ))
          }
        </AgGridReact>
      </div>
  );
}

export default Grid;

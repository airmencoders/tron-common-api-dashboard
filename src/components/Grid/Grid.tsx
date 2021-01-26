import React from 'react';
import {GridProps} from './GridProps';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';

import './Grid.scss';
import {GridReadyEvent} from 'ag-grid-community/dist/lib/events';

function Grid(props: GridProps) {
  const gridReady = (event: GridReadyEvent) => {
      event.api.sizeColumnsToFit();
  };

  return (
      <div className="grid-component ag-theme-alpine"
           style={{ width: '100%', height: '100%' }}
      >
        <AgGridReact
            rowData={props.data}
            onGridReady={gridReady}
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

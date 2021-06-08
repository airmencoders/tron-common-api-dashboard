import React from 'react';
import {RowActionCellRendererProps} from './RowActionCellRendererProps';
import {ActionDef} from './action-def';

function RowActionCellRenderer(props: RowActionCellRendererProps) {
  return (
      <div className="row-action-cell-renderer">
        {
          props.colDef?.cellRendererParams?.actions.map((action: ActionDef, index: number) =>
            <div className="row-action-cell-renderer__action" key={`action__${index}`}>
              <action.component {...action.props} {...props} />
            </div>
          )
        }
      </div>
  );
}

export default RowActionCellRenderer;

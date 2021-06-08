import React from 'react';
import TestEndpointIcon from '../../icons/TestEndpointIcon';
import {GridCellRendererProps} from '../Grid/GridCellRendererProps';
import {RowActionEventProps} from '../RowActionCellRenderer/RowActionEventProps';

function TestApiRowAction(props: GridCellRendererProps<any> & RowActionEventProps) {
  const onIconClicked = (event: React.MouseEvent) => {
    event.preventDefault();
    props.onActionClick(props);
  };
  return (
      <div className="test-api-row-action">
        <a href="#" onClick={onIconClicked}>
          <TestEndpointIcon size={1} />
        </a>
      </div>
  );
}

export default TestApiRowAction;

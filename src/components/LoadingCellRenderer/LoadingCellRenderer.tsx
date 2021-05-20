
import React from 'react';
import Spinner from '../Spinner/Spinner';

function LoadingCellRenderer(props: any) {
  return (
    <div className="loading-cell-renderer" data-testid="loading-cell-renderer">
      {props.value ?
        props.value
        :
        <Spinner small />
      }
    </div>
  );
}

export default LoadingCellRenderer;

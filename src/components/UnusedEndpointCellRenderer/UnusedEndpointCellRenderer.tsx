import React from 'react';
import WarningIcon from '../../icons/WarningIcon';
import Button from '../Button/Button';
import './UnusedEndpointCellRenderer.scss';


function UnusedEndpointCellRenderer(props: any) {
  const icon = props.data.deleted ? 
              <Button data-testid="unused-true" type="button" onClick={() => props.onClick(props.data)} unstyled  className="unused-endpoint-cell-renderer__btn" disableMobileFullWidth>
                <WarningIcon size={1} iconTitle="Endpoint No Longer Available"/>
              </Button> 
              : 
              <Button data-testid="unused-false" type="button" unstyled  className="unused-endpoint-cell-renderer__hidden unused-endpoint-cell-renderer__btn" disableMobileFullWidth>
                <WarningIcon size={1} iconTitle="Endpoint No Longer Available"/>
              </Button>;
  return (
    <div className="unused-endpoint-cell-renderer">
      {icon} {props.value}
    </div>
  );

}

export default UnusedEndpointCellRenderer;

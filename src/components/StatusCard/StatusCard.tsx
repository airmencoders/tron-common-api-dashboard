import React from 'react';
import {StatusCardProps} from './StatusCardProps';
import Card from '../Card/Card';
import {StatusType} from './status-type';
import StatusGoodIcon from '../../icons/StatusGoodIcon';

function renderIcon(status: StatusType): React.ReactNode {
  const iconSize = 4;
  let returnIcon = (<div></div>);
  switch (status) {
    case StatusType.GOOD:
      returnIcon = <StatusGoodIcon size={4} />;
      break;
    case StatusType.ERROR:
      // returnIcon = <

  }
}

function StatusCard(props: StatusCardProps) {
  return (
      <div className="status-card">
        <Card>
          <div className="status-card__title">
            {props.title}
          </div>
          <div className="status-card__icon">
            {

            }
          </div>
          <div className="status-card__status">
            {props.title || 'No Status'}
          </div>
        </Card>
      </div>
  );
}

export default StatusCard;

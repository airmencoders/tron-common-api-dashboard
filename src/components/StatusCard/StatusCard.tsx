import React from 'react';
import {StatusCardProps} from './StatusCardProps';
import Card from '../Card/Card';
import {StatusType} from './status-type';
import StatusGoodIcon from '../../icons/StatusGoodIcon';
import WarningIcon from '../../icons/WarningIcon';
import CloseIcon from '../../icons/CloseIcon';
import DownIcon from '../../icons/DownIcon';

import './StatusCard.scss';

function renderIcon(status: StatusType): React.ReactNode {
  const iconSize = 4;
  let returnIcon = (<WarningIcon size={iconSize} />);
  switch (status) {
    case StatusType.GOOD:
      returnIcon = <StatusGoodIcon size={iconSize}/>;
      break;
    case StatusType.ERROR:
      returnIcon = <CloseIcon size={iconSize} iconTitle="error"/>;
      break;
    case StatusType.DOWN:
      returnIcon = <DownIcon size={iconSize} iconTitle="down" className="down"/>;
      break;
    default:
      // return default div
      break;
  }
  return returnIcon;
}

function StatusCard(props: StatusCardProps) {
  return (
      <div className="status-card">
        <Card>
          <div className="status-card__title">
            <h3 className="title__text">{props.title}</h3>
          </div>
          <div className="status-card__icon">
            {
              renderIcon(props.status)
            }
          </div>
          <div className="status-card__status">
            {props.status || 'No Status'}
          </div>
        </Card>
      </div>
  );
}

export default StatusCard;

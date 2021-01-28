import React from 'react';
import {CardProps} from './CardProps';
// import { Card as UswdsCard } from '@trussworks/react-uswds/lib/index'

import './Card.scss';

function Card(props: CardProps) {
  return (
      <div className="card">
        <div className="card__container usa-card__container">
          <div className="card__body usa-card__body">
            {props.children}
          </div>
        </div>
      </div>
  );
}

export default Card;

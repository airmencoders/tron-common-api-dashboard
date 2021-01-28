import React from 'react';
import {CardProps} from './CardProps';

import './Card.scss';

function Card(props: CardProps) {
  return (
      <div className="card-component">
        <div className="card__container usa-card__container">
          <div className="card__body usa-card__body">
            {props.children}
          </div>
        </div>
      </div>
  );
}

export default Card;

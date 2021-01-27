import React from 'react';
import {ModalTitleProps} from './ModalTitleProps';

import './ModalTitle.scss';

function ModalTitle(props: ModalTitleProps) {
  return (
      <div className="modal-title">
        <h4 className="modal-title__text">{props.title}</h4>
      </div>
  );
}

export default ModalTitle;

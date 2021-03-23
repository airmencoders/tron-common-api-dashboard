import React from 'react';
import {ModalFooterSubmitProps} from './ModalFooterSubmitProps';
import Button from '../Button/Button';

import './ModalFooterSubmit.scss';

function ModalFooterSubmit(props: ModalFooterSubmitProps) {
  return (
      <div className="modal-footer-submit">
        <div className="modal-footer-submit__button-container">
        {!props.hideCancel &&
            <Button type="button" inverse outline
                  onClick={props.onCancel}>
              {props.cancelText ?? 'Cancel'}
            </Button>
          }
          <Button type="submit" onClick={props.onSubmit} disabled={props.disableSubmit}>
            {props.submitText ?? 'Submit'}
          </Button>
        </div>
      </div>
  );
}

export default ModalFooterSubmit;

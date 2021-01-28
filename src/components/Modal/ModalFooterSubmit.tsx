import React from 'react';
import {ModalFooterSubmitProps} from './ModalFooterSubmitProps';
import Button from '../Button/Button';

import './ModalFooterSubmit.scss';

function ModalFooterSubmit(props: ModalFooterSubmitProps) {
  return (
      <div className="modal-footer-submit">
        <div className="modal-footer-submit__button-container">
          <Button type="button" inverse outline
                  onClick={props.onCancel}>
            Cancel
          </Button>
          <Button type="submit" onClick={props.onSubmit}>
            Submit
          </Button>
        </div>
      </div>
  );
}

export default ModalFooterSubmit;

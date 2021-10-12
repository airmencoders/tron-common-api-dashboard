import React from 'react';
import {SuccessErrorMessageProps} from './SuccessErrorMessageProps';
import Button from '../../Button/Button';

import './SuccessErrorMessage.scss';

function SuccessErrorMessage(props: SuccessErrorMessageProps) {

  return (
      <div className="success-error-message">
        {
          props.showSuccessMessage ?
              <div className="success-error-message__success-container">
                <p className="success-container__successful-operation">
                  {props.successMessage}
                </p>
                {props.showCloseButton && props.onCloseClicked &&
                  <Button type="button" onClick={props.onCloseClicked} className="success-container__close">Close</Button>
                }
              </div> :
              <>
                {
                  props.showErrorMessage && <p className="success-container__validation-error">* {props.errorMessage}</p>
                }
              </>
        }
      </div>
  );
}

export default SuccessErrorMessage;

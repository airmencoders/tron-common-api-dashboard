import React from 'react';
import {SubmitActionsProps} from './SubmitActionsProps';
import Button from '../../Button/Button';
import {Spinner} from 'react-bootstrap';
import {FormActionType} from '../../../state/crud-page/form-action-type';

import './SubmitActions.scss';

function SubmitActions(props: SubmitActionsProps) {
  return (
      <div className="submit-actions button-container">
        <Button type="button" onClick={props.onCancel} unstyled>Cancel</Button>
        <Button
            type="submit"
            className="button-container__submit"
            disabled={!props.isFormValid || !props.isFormModified ||
                      props.isFormSubmitting}
        >
          {props.isFormSubmitting ?
              <Spinner animation="border" role="status" variant="primary" title="submitting">
                <span className="sr-only">Submitting...</span>
              </Spinner>
              :
              props.formActionType === FormActionType.ADD && <>Add</> ||
              props.formActionType === FormActionType.UPDATE && <>Update</>
          }
        </Button>
      </div>
  );
}

export default SubmitActions;

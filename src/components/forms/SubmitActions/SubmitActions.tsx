import React from 'react';
import {SubmitActionsProps} from './SubmitActionsProps';
import Button from '../../Button/Button';
import {Spinner} from 'react-bootstrap';
import {FormActionType} from '../../../state/crud-page/form-action-type';

import './SubmitActions.scss';

function SubmitActions(props: SubmitActionsProps) {
  const variant = props.variant ? props.variant : 1;
  return (
      <div className="submit-actions button-container">
        {props.onCancel && variant === 1 &&
          <Button type="button" onClick={props.onCancel} transparentBackground unstyled>{props.cancelButtonLabel ?? 'Cancel'}</Button>
        }
        {props.onCancel && variant === 2 &&
          <Button type="button" onClick={props.onCancel} outline style={{backgroundColor: "#fff", color: '#5F96EA', boxShadow: 'none', border: '1px solid #E5E5E5'}}>{props.cancelButtonLabel ?? 'Cancel'}</Button>
        }
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
              props.submitButtonLabel && <>{props.submitButtonLabel}</> ||
              props.formActionType === FormActionType.ADD && <>Add</> ||
              props.formActionType === FormActionType.UPDATE && <>Update</> ||
              props.formActionType === FormActionType.SAVE && <>Save</>
          }
        </Button>
      </div>
  );
}

export default SubmitActions;

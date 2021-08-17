import React from 'react';
import {FormGroupProps} from './FormGroupProps';
import Label from '../Label/Label';
import './FormGroup.scss';

function FormGroup(props: FormGroupProps) {
  return (
      <div className={`${props.className ?? ''} form-group`}>
        <div className="form-group__label">
          <Label required={props.required} htmlFor={props.labelName}>{props.labelText}</Label>
          {
            props.actionsNode  &&
            <div className="form-group__actions">
              { props.actionsNode }
            </div>
          }
        </div>
        {props.children}
        {props.isError &&
          <ul className="validation">
            {
              props.errorMessages?.map((error, idx) => (
                      <li key={idx} className="validation__error">{error}</li>
                    ))
            }
          </ul>
        }
      </div>
  );
}

export default FormGroup;

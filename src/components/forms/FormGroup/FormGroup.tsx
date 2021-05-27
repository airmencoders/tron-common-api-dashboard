import React from 'react';
import {FormGroupProps} from './FormGroupProps';
import Label from '../Label/Label';
import './FormGroup.scss';

function FormGroup(props: FormGroupProps) {
  return (
      <>
        <Label className={props.required ? 'label--required' : ''} htmlFor={props.labelName}>{props.labelText}</Label>
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
      </>
  );
}

export default FormGroup;

import React from 'react';
import {FormGroupProps} from './FormGroupProps';
import Label from '../Label/Label';
import './FormGroup.scss';

function FormGroup(props: FormGroupProps) {
  return (
      <>
        <Label htmlFor={props.labelName}>{props.labelText}</Label>
        {props.children}
        {
          props.isError &&
              props.errorMessages?.map((error, idx) => (
                  <p key={idx} className="validation-error">* {error}</p>
              ))
        }
      </>
  );
}

export default FormGroup;

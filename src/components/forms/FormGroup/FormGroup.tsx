import React from 'react';
import {FormGroupProps} from './FormGroupProps';
import Label from '../Label/Label';

function FormGroup(props: FormGroupProps) {
  return (
      <>
        <Label htmlFor={props.labelName}>{props.labelText}</Label>
        {props.children}
        {
          props.isError &&
              props.errorMessages?.map(error => (
                  <p className="validation-error">* {error}</p>
              ))
        }
      </>
  );
}

export default FormGroup;

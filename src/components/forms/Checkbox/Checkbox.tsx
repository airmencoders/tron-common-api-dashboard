import React, { forwardRef } from "react";
import { CheckboxProps } from "./CheckboxProps";
import { Checkbox as UswdsCheckbox } from "@trussworks/react-uswds/lib/index";
import './Checkbox.scss';


const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref?) => {
  return (
    <div className="tron-checkbox">
      <UswdsCheckbox {...props} inputRef={ref} />
    </div>
  );
})

Checkbox.displayName = 'Checkbox';

export default Checkbox;

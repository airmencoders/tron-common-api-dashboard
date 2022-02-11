import React from 'react';
import { Dropdown as UswdsDropdown } from "@trussworks/react-uswds/lib/index";
import { SelectProps } from './SelectProps';


function Select(props: SelectProps & JSX.IntrinsicElements['select']) {
  return (
      <div className="select-component">
        <UswdsDropdown {...props} />
      </div>
  );
}

export default Select;

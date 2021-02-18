import { CheckboxProps } from "./CheckboxProps";
import { Checkbox as UswdsCheckbox } from "@trussworks/react-uswds/lib/index";

import './Checkbox.scss';

function Checkbox(props: CheckboxProps) {
  return (
      <div className="tron-checkbox">
        <UswdsCheckbox {...props} />
      </div>
  );
}

export default Checkbox;

import { CheckboxProps } from "./CheckboxProps";
import { Checkbox as UswdsCheckbox } from "@trussworks/react-uswds/lib/index";

function Checkbox(props: CheckboxProps) {
  return (
    <UswdsCheckbox {...props} />
  );
}

export default Checkbox;
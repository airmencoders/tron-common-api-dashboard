import { Fieldset as UswdsFieldset } from "@trussworks/react-uswds/lib/index";
import { FieldsetProps } from "./FieldsetProps";

function Fieldset(props: FieldsetProps) {
  return (
    <UswdsFieldset {...props} />
  );
}

export default Fieldset;
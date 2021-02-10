import { Radio as UswdsRadio } from "@trussworks/react-uswds/lib/index";
import { RadioProps } from "./RadioProps";

function Radio(props: RadioProps) {
  return (
    <UswdsRadio {...props} />
  );
}

export default Radio;
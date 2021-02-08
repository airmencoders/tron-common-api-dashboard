import { LabelProps } from "./LabelProps";
import { Label as UswdsLabel } from "@trussworks/react-uswds/lib/index";

function Label(props: LabelProps) {
  return (
    <UswdsLabel {...props} />
  );
}

export default Label;
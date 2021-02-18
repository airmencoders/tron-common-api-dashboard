import { LabelProps } from "./LabelProps";
import { Label as UswdsLabel } from "@trussworks/react-uswds/lib/index";

import './Label.scss';

function Label(props: LabelProps) {
  return (
      <div className="tron-label">
        <UswdsLabel {...props} />
      </div>
  );
}

export default Label;

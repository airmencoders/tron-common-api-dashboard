import { LabelProps } from "./LabelProps";
import { Label as UswdsLabel } from "@trussworks/react-uswds/lib/index";

import './Label.scss';

function Label({ className, required, ...props }: LabelProps) {
  return (
      <div className="tron-label">
        <UswdsLabel {...props} className={`${className ?? ''}${required ? ' label--required' : ''}`} />
      </div>
  );
}

export default Label;

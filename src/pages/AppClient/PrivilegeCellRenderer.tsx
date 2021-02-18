import CloseIcon from "../../icons/CloseIcon";
import StatusGoodIcon from "../../icons/StatusGoodIcon";

import './PrivilegeCellRenderer.scss';

function PrivilegeCellRenderer(props: any) {
  return (
    <div className="privilege-cell-renderer">
      {props.value ?
        <div data-testid="privilege-true" className="privilege-cell-renderer__value">
          <StatusGoodIcon size={1.25} />
        </div>
        :
        <div data-testid="privilege-false" className="privilege-cell-renderer__value">
          <CloseIcon size={1.25} />
        </div>
      }
    </div>
  );
}

export default PrivilegeCellRenderer;

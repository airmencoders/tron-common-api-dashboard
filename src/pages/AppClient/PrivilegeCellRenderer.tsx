import CloseIcon from "../../icons/CloseIcon";
import StatusGoodIcon from "../../icons/StatusGoodIcon";

function PrivilegeCellRenderer(props: any) {
  return (
    <>
      {props.value ?
        <div data-testid="privilege-true">
          <StatusGoodIcon size={1.25} />
        </div>
        :
        <div data-testid="privilege-false">
          <CloseIcon size={1.25} />
        </div>
      }
    </>
  );
}

export default PrivilegeCellRenderer;
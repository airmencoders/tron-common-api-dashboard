import { OptionalFormProps } from "./OptionalFormProps";
import { RequiredFormProps } from "./RequiredFormProps";
import { Form as UswdsForm } from "@trussworks/react-uswds/lib/index";

import './Form.scss';

function Form(props: RequiredFormProps & OptionalFormProps) {
  return (
      <div className="tron-form">
        <UswdsForm {...props} />
      </div>
  );
}

export default Form;

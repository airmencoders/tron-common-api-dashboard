import { OptionalFormProps } from "./OptionalFormProps";
import { RequiredFormProps } from "./RequiredFormProps";
import { Form as UswdsForm } from "@trussworks/react-uswds/lib/index";

function Form(props: RequiredFormProps & OptionalFormProps) {
  return (
    <UswdsForm {...props} />
  );
}

export default Form;
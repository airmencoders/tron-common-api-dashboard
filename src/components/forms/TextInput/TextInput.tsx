import { TextInput as UswdsTextInput } from "@trussworks/react-uswds/lib/index";
import { TextInputProps } from "./TextInputProps";

function TextInput(props: TextInputProps) {
  return (
    <UswdsTextInput {...props} />
  );
}

export default TextInput;
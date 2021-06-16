import { TextInput as UswdsTextInput } from "@trussworks/react-uswds/lib/index";
import { TextInputProps } from "./TextInputProps";

import './TextInput.scss';

function TextInputInline(props: TextInputProps) {
  return (
    <UswdsTextInput {...props} />
  );
}

export default TextInputInline;

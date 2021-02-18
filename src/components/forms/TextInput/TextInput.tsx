import { TextInput as UswdsTextInput } from "@trussworks/react-uswds/lib/index";
import { TextInputProps } from "./TextInputProps";

import './TextInput.scss';

function TextInput(props: TextInputProps) {
  return (
      <div className="tron-text-input">
        <UswdsTextInput {...props} />
      </div>
  );
}

export default TextInput;

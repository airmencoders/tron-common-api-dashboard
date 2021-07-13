import { TextInput as UswdsTextInput } from "@trussworks/react-uswds/lib/index";
import { TextInputProps } from "./TextInputProps";

import './TextInput.scss';

function TextInput({ appendedText, ...props }: TextInputProps) {
  return (
    <div className={`tron-text-input${appendedText ? ' tron-text-input--appended' : ''}`}>
      <UswdsTextInput {...props} />
      {appendedText != null &&
        <span className="appended-text">{appendedText}</span>
      }
    </div>
  );
}

export default TextInput;

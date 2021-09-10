import { TextInput as UswdsTextInput } from "@trussworks/react-uswds/lib/index";
import { TextInputProps } from "./TextInputProps";

import './TextInput.scss';
import { TextInputWithDeleteProps } from '../TextInputWithDelete/TextInputWithDeleteProps';
import Button from '../../Button/Button';
import CloseIcon from '../../../icons/CloseIcon';
import SearchIcon from '../../../icons/SearchIcon';
import {useMemo} from 'react';

function TextInput({ appendedText, deleteButtonTitle, onDeleteClickHandler, withDelete, searchInput, ...props }: TextInputProps & Partial<TextInputWithDeleteProps>) {
  const hasValidValue = props.value != null && String(props.value).trim().length > 0;
  const inputClass: string | undefined = useMemo(() => {
    return props.className != null ? `${props.className} tron-text-input__search-bar` : undefined;
  }, [props.className]);
  return (
    <div className={`tron-text-input${appendedText ? ' tron-text-input--appended' : ''}${props.className ? (' ' + props.className) : ''}`}>
      <div className={`tron-text-input__input-container${withDelete ? ' tron-text-input__input-container--delete' : ''}`}>
        {searchInput &&
          <SearchIcon
            iconTitle="Search"
            size={1.25}
          />
        }
        <UswdsTextInput
          {...props}
            className={inputClass}
        />
        {withDelete && hasValidValue &&
          <Button
            data-testid={deleteButtonTitle ? `${deleteButtonTitle}-btn` : undefined}
            disableMobileFullWidth
            type="button"
            onClick={onDeleteClickHandler}
            unstyled
            transparentOnDisabled
            className="tron-text-input-delete__delete-btn"
          >
            <CloseIcon iconTitle={deleteButtonTitle ?? 'Remove'} size={1.5} className="delete-btn__icon remove-icon-color" />
          </Button>
        }
      </div>
      {appendedText != null &&
        <span className="appended-text">{appendedText}</span>
      }
    </div>
  );
}

export default TextInput;

import { State, useHookstate } from "@hookstate/core";
import { Initial } from "@hookstate/initial";
import React, { useEffect } from "react";
import Button from "../../components/Button/Button";
import FormGroup from "../../components/forms/FormGroup/FormGroup";
import TextInput from "../../components/forms/TextInput/TextInput";
import { ScratchStorageEntryDto } from "../../openapi";
import { useScratchStorageState } from "../../state/scratch-storage/scratch-storage-state";
import {
  failsHookstateValidation,
  generateStringErrorMessages
} from "../../utils/validation-utils";
import { ScratchStorageCreateUpdateState } from "./ScratchStorageEditForm";
import "./ScratchStorageKeyValueEditorForm.scss";
import "./ScratchStorageUserAddForm.scss";

interface ScratchStorageAddKVPProps {
  createUpdateState: State<ScratchStorageCreateUpdateState>;
  onSubmit: (toUpdate: ScratchStorageEntryDto) => void;
  valueState: State<string>;
}

export interface JsonValueError {
  error: boolean;
  message: string;
}

function ScratchStorageKeyValueEditorForm(props: ScratchStorageAddKVPProps) {
  const scratchStorageService = useScratchStorageState(); // handle to the scratch storage service
  
  // the value of the key (raw string)
  const localValueState = useHookstate<string>("");

  // indicate any json parse errors
  const jsonErrorState = useHookstate<JsonValueError>({
    error: false,
    message: "",
  });

  // if we're editing an existing key value then fetch it's value from the API,
  // if its not already in the service createUpdate state... this would be the case if the key has
  // been created in the editor, but never committed to the backend (like the user recalled it and wanted to edit it one more time before committing)
  useEffect(() => {
    const kvpIndex = scratchStorageService.createUpdateState.findIndex(
      (item) => item.key.get() === props.createUpdateState.keyName.get()
    );
    if (props.createUpdateState.isEdit.value && kvpIndex === -1) {
      scratchStorageService.scratchStorageApi
        .getKeyValueByKeyName(
          props.createUpdateState.appId.value,
          props.createUpdateState.keyName.value
        )
        .then((resp) => {
          localValueState.set(resp.data.value ?? "");
          props.valueState.set(resp.data.value ?? "");
        });
    } else if (props.createUpdateState.isEdit.value) {
      localValueState.set(
        scratchStorageService.createUpdateState[kvpIndex].value.value ?? ""
      );
      props.valueState.set(
        scratchStorageService.createUpdateState[kvpIndex].value.value ?? ""
      );
    }
  }, []);

  const isKeyNameModified = (): boolean => {
    return Initial(props.createUpdateState.keyName).modified();
  };

  // attempts to beautify a string into pretty JSON
  const beautifyJsonValue = (): void => {
    try {
      const newValue = JSON.stringify(
        JSON.parse(localValueState.get()),
        undefined,
        2
      );
      jsonErrorState.set({ error: false, message: "" });
      localValueState.set(newValue);
    } catch (e) {
      jsonErrorState.set({ error: true, message: "Could not beautify JSON" });
    }
  };

  return (
    <div
      className="scratch-storage-add-form scratch-storage-key-value-editor-form"
      data-testid="scratch-storage-add-kvp-form"
    >
      <FormGroup
        labelName="keyName"
        labelText="Key Name"
        isError={
          isKeyNameModified() &&
          failsHookstateValidation(props.createUpdateState.keyName)
        }
        errorMessages={generateStringErrorMessages(
          props.createUpdateState.keyName
        )}
        required={!props.createUpdateState.isEdit.value}
      >
        <TextInput
          id="keyName"
          name="keyName"
          type="text"
          autoFocus={true}
          data-testid="scratch-kvp-keyname"
          disabled={props.createUpdateState.isEdit.value}
          value={props.createUpdateState.keyName.get()}
          error={
            isKeyNameModified() &&
            failsHookstateValidation(props.createUpdateState.keyName)
          }
          onChange={(event) =>
            props.createUpdateState.keyName.set(event.target.value)
          }
        />
      </FormGroup>
      <FormGroup
        labelName="keyValue"
        labelText="Key Value"
        isError={jsonErrorState.get().error}
        errorMessages={[jsonErrorState.message.value]}
        actionsNode={
          <div className="action-area">
            <Button
              type="button"
              className="button"
              onClick={beautifyJsonValue}
            >
              Beautify Json
            </Button>
          </div>
        }
      >
        <textarea
          className="value-editor"
          id="keyValue"
          name="keyValue"
          data-testid="scratch-kvp-value"
          rows={20}
          onChange={(event) => {
            props.valueState.set(event.target.value);
            localValueState.set(event.target.value);
          }}
          value={localValueState.get()}
        />
      </FormGroup>      
    </div>
  );
}

export default ScratchStorageKeyValueEditorForm;

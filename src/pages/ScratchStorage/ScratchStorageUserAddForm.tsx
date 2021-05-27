import React, { FormEvent } from 'react';
import { State, useHookstate } from "@hookstate/core";
import Form from "../../components/forms/Form/Form";
import TextInput from "../../components/forms/TextInput/TextInput";
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import Checkbox from '../../components/forms/Checkbox/Checkbox';
import Button from '../../components/Button/Button';
import { ScratchStorageUserWithPrivsFlat } from '../../state/scratch-storage/scratch-storage-user-with-privs-flat';
import { Validation } from '@hookstate/validation';
import { ScratchStorageEditorState } from './ScratchStorageEditForm';
import './ScratchStorageUserAddForm.scss';
import { generateStringErrorMessages, failsHookstateValidation, validateEmail, validateRequiredString, validateStringLength, validationErrors } from '../../utils/validation-utils';
import { Initial } from '@hookstate/initial';
import { Touched } from '@hookstate/touched';

interface ScratchStorageAddFormProps {
  editorState: State<ScratchStorageEditorState>;
  onSubmit: (toUpdate: State<ScratchStorageUserWithPrivsFlat>) => void;
  isUpdate?: boolean;
  original?: ScratchStorageUserWithPrivsFlat;
}

function ScratchStorageUserAddForm(props: ScratchStorageAddFormProps) {
  const formState = useHookstate<ScratchStorageUserWithPrivsFlat>({
        userId: props.editorState?.data.userId.value ?? '',
        email: props.editorState?.data.email.value ?? '',
        read: props.editorState?.data.read.value ?? false,
        write: props.editorState?.data.write.value ?? false,
        admin: props.editorState?.data.admin.value ?? false
      });

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  Validation(formState.email).validate(validateEmail, validationErrors.invalidEmail, 'error');
  Validation(formState.email).validate(validateRequiredString, validationErrors.requiredText, 'error');
  Validation(formState.email).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  const isEmailModified = (): boolean => {
    return props.editorState.original.email.get() !== formState.email.get();
  }

  const isFormModified = (): boolean => {
    return props.editorState.original.email.get() !== formState.email.get() ||
        props.editorState.original.read.get() !== formState.read.get() ||
        props.editorState.original.write.get() !== formState.write.get() ||
        props.editorState.original.admin.get() !== formState.admin.get();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.onSubmit(formState);
  }

  return (
    <Form className="scratch-storage-add-form" onSubmit={onSubmit} data-testid="scratch-storage-add-form">
      <FormGroup
        labelName="email"
        labelText="Email"
        isError={isEmailModified() && failsHookstateValidation(formState.email)}
        errorMessages={generateStringErrorMessages(formState.email)}
        required
      >
        <TextInput
          id="email"
          name="email"
          type="email"
          value={formState.email.get()}
          error={isEmailModified() && failsHookstateValidation(formState.email)}
          onChange={(event) => formState.email.set(event.target.value)}
        />
      </FormGroup>

      <FormGroup
        labelName="permissions"
        labelText="Permissions"
        required
      >
        <Checkbox
          id="read"
          name="read"
          label={<>Read</>}
          checked={formState.read.get()}
          onChange={(event) => formState.read.set(event.target.checked)}
        />

        <Checkbox
          id="write"
          name="write"
          label={<>Write</>}
          checked={formState.write.get()}
          onChange={(event) => formState.write.set(event.target.checked)}
        />

        <Checkbox
          id="admin"
          name="admin"
          label={<>Admin</>}
          checked={formState.admin.get()}
          onChange={(event) => formState.admin.set(event.target.checked)}
        />
      </FormGroup>

      <Button type="submit" disabled={!isFormModified() || !(Validation(formState.email).valid() && (formState.read.get() || formState.write.get() || formState.admin.get()))}>
        { props.isUpdate ? "Update User": "Add User" }
      </Button>
      <div className="success-error-message">
        <p className="success-container__validation-error">{props.editorState.errorMessage.get()}</p>
      </div>
    </Form>
  );
}

export default ScratchStorageUserAddForm;

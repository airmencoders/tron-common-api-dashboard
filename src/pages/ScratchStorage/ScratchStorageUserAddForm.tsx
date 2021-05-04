import React, { FormEvent } from 'react';
import { Downgraded, none, State, useHookstate } from "@hookstate/core";
import Form from "../../components/forms/Form/Form";
import TextInput from "../../components/forms/TextInput/TextInput";
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import Checkbox from '../../components/forms/Checkbox/Checkbox';
import Button from '../../components/Button/Button';
import { ScratchStorageUserWithPrivsFlat } from '../../state/scratch-storage/scratch-storage-user-with-privs-flat';
import { Validation } from '@hookstate/validation';
import { Touched } from '@hookstate/touched';
import { ScratchStorageEditorState } from './ScratchStorageEditForm';
import { Initial } from '@hookstate/initial';
import './ScratchStorageUserAddForm.scss';
import { validateEmail } from '../../utils/validation-utils';

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

  Validation(formState.email).validate(email => validateEmail(email), 'Enter a valid email', 'error');

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
        isError={isEmailModified() && Validation(formState.email).invalid()}
        errorMessages={Validation(formState.email).errors()
          .map(validationError => validationError.message)}
      >
        <TextInput
          id="email"
          name="email"
          type="email"
          value={formState.email.get()}
          error={isEmailModified() && Validation(formState.email).invalid()}
          onChange={(event) => formState.email.set(event.target.value)}
        />
      </FormGroup>

      <FormGroup
        labelName="permissions"
        labelText="Permissions"
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

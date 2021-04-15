import React, { FormEvent } from 'react';
import { Downgraded, State, useHookstate } from "@hookstate/core";
import Form from "../../components/forms/Form/Form";
import TextInput from "../../components/forms/TextInput/TextInput";
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import Checkbox from '../../components/forms/Checkbox/Checkbox';
import Button from '../../components/Button/Button';
import { ScratchStorageUserWithPrivsFlat } from '../../state/scratch-storage/scratch-storage-user-with-privs-flat';
import { Validation } from '@hookstate/validation';
import { Touched } from '@hookstate/touched';

interface ScratchStorageAddFormProps {
  data?: ScratchStorageUserWithPrivsFlat;
  onSubmit: (toUpdate: ScratchStorageUserWithPrivsFlat) => void;
}

function ScratchStorageUserAddForm(props: ScratchStorageAddFormProps) {
  const formState = useHookstate<ScratchStorageUserWithPrivsFlat>({
      userId: props.data?.userId ?? '',
      email: props.data?.email ?? '',
      read: props.data?.read ?? false,
      write: props.data?.write ?? false,
      admin: props.data?.admin ?? false
    });

  formState.attach(Validation);
  formState.attach(Touched);

  Validation(formState.email).validate(email => /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email), 'Enter a valid email', 'error');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.onSubmit(formState.attach(Downgraded).get());
  }

  return (
    <Form className="scratch-storage-add-form" onSubmit={onSubmit} data-testid="scratch-storage-add-form">
      <FormGroup
        labelName="email"
        labelText="Email"
        isError={Touched(formState.email).touched() && Validation(formState.email).invalid()}
        errorMessages={Validation(formState.email).errors()
          .map(validationError => validationError.message)}
      >
        <TextInput
          id="email"
          name="email"
          type="email"
          defaultValue={formState.email.get()}
          error={Touched(formState.email).touched() && Validation(formState.email).invalid()}
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

      <Button type="submit" disabled={!(Validation(formState.email).valid() && (formState.read.get() || formState.write.get() || formState.admin.get()))}>
        Add User
      </Button>
    </Form>
  );
}

export default ScratchStorageUserAddForm;

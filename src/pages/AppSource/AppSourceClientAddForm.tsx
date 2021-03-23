import React, { FormEvent } from 'react';
import { Downgraded, State, useHookstate } from "@hookstate/core";
import Form from "../../components/forms/Form/Form";
import TextInput from "../../components/forms/TextInput/TextInput";
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import Checkbox from '../../components/forms/Checkbox/Checkbox';
import { AppClientUserPrivFlat } from '../../state/app-source/app-client-user-priv-flat';
import Button from '../../components/Button/Button';
import './AppSourceClientAddForm.scss';

interface AppSourceClientAddFormProps {
  data: State<AppClientUserPrivFlat>;
  onSubmit: (toUpdate: AppClientUserPrivFlat) => void;
}

function AppSourceClientAddForm(props: AppSourceClientAddFormProps) {
  const formState = useHookstate<AppClientUserPrivFlat>(props.data);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.onSubmit(formState.attach(Downgraded).get());
  }

  return (
    <Form className="app-source-client-form" onSubmit={onSubmit} data-testid="app-source-client-form">
      <FormGroup
        labelName="uuid"
        labelText="UUID"
      >
        <TextInput
          id="uuid"
          name="uuid"
          type="text"
          defaultValue={formState.appClientUser.get()}
          disabled={true}
        />
      </FormGroup>

      <FormGroup
        labelName="name"
        labelText="Name"
      >
        <TextInput
          id="name"
          name="name"
          type="text"
          defaultValue={formState.appClientUserName.get()}
          disabled={true}
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
      </FormGroup>

      <Button type="submit" disabled={!formState.appClientUser.get() && !formState.appClientUserName.get()}>
        Add Client
      </Button>
    </Form>
  );
}

export default AppSourceClientAddForm;

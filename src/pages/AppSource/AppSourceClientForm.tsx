import React from 'react';
import { State } from "@hookstate/core";
import Form from "../../components/forms/Form/Form";
import TextInput from "../../components/forms/TextInput/TextInput";
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import Checkbox from '../../components/forms/Checkbox/Checkbox';
import { AppClientUserPrivFlat } from '../../state/app-source/app-client-user-priv-flat';

function AppSourceClientForm(props: { data: State<AppClientUserPrivFlat> }) {
  const formState = props.data;

  return (
    <Form className="app-source-client-form" onSubmit={() => { return; }} data-testid="app-source-client-form">
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
    </Form>
  );
}

export default AppSourceClientForm;

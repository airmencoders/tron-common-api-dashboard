import React from 'react';
import { useState } from "@hookstate/core";
import { Validation } from "@hookstate/validation";
import Button from "../../components/Button/Button";
import Checkbox from "../../components/forms/Checkbox/Checkbox";
import Fieldset from "../../components/forms/Fieldset/Fieldset";
import Form from "../../components/forms/Form/Form";
import Label from "../../components/forms/Label/Label";
import TextInput from "../../components/forms/TextInput/TextInput";
import './AppClientForm.scss';
import { AppClientFormProps } from './AppClientFormProps';
import { AppClientFlat } from '../../state/app-clients/interface/app-client-flat';

function AppClientForm(props: AppClientFormProps) {
  const formState = useState<AppClientFlat>({
    id: props.client?.id,
    name: props.client?.name || "Client Name",
    read: props.client?.read || false,
    write: props.client?.write || false,
  });

  formState.attach(Validation);

  Validation(formState.name).validate(name => name.length > 0 && name.trim().length > 0, 'Name cannot be empty or blank.', 'error');

  return (
    <>
      {props.client ?
        <Form className="client-form" onSubmit={(event) => props.onSubmit(event, formState.get())}>
          <div className="client-name-container">
            <Label className="client-name-container__label" htmlFor="name"><h4>Name</h4></Label>
            <TextInput
              className="client-name-container__input"
              id="name"
              name="name"
              type="text"
              defaultValue={formState.name.get()}
              placeholder="Enter Client App Name"
              error={Validation(formState.name).invalid()}
              onChange={(event) => formState.name.set(event.target.value)}
            />
            {Validation(formState.name).invalid() &&
              Validation(formState.name).errors().map((error, idx) => {
                return (
                  <p key={idx} className="client-name-container__error">{error.message}</p>
                );
              })
            }
          </div>

          <Fieldset className="permissions-container">
            <div className="permissions-container__title">
              <h4 className="title__text">Permissions</h4>
            </div>

            <div className="permissions-container__options">
              <Checkbox className="options__read"
                id="read"
                name="read"
                label={<>Read</>}
                checked={formState.read.get()}
                onChange={(event) => formState.read.set(event.target.checked)} />

              <Checkbox className="options__write"
                id="write"
                name="write"
                label={<>Write</>}
                checked={formState.write.get()}
                onChange={(event) => formState.write.set(event.target.checked)} />
            </div>

          </Fieldset>

          <Button
            type={'submit'}
            className="submit-btn"
            disabled={Validation(formState).invalid()}
          >
            Submit
          </Button>

        </Form>
        :
        <p>There was an error loading client details...</p>
      }
    </>
  );
}

export default AppClientForm;
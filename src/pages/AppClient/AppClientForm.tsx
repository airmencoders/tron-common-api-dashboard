import React from 'react';
import { useState } from "@hookstate/core";
import { Validation } from "@hookstate/validation";
import Button from "../../components/Button/Button";
import Checkbox from "../../components/forms/Checkbox/Checkbox";
import Fieldset from "../../components/forms/Fieldset/Fieldset";
import Form from "../../components/forms/Form/Form";
import Label from "../../components/forms/Label/Label";
import TextInput from "../../components/forms/TextInput/TextInput";
import { AppClientFlat } from "../../state/app-clients/interface/app-client-flat";
import './AppClientForm.scss';

interface LooseObject {
  [key: string]: any
}

function AppClientForm(props: { client?: AppClientFlat }) {
  const formState = useState({
    data: {
      id: props.client?.id,
      name: props.client?.name || "Client Name",
      read: props.client?.read || false,
      write: props.client?.write || false,
    },
    errors: {
      
    }
  });

  formState.attach(Validation);

  Validation(formState.data.name).validate(name => name.length > 0 && name.trim().length > 0, 'Name cannot be empty or blank.', 'error');

  function onSubmitClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    formState.errors.set((prev) => {
      const updated: LooseObject = Object.assign({}, { ...prev });
      updated.name = "Some error";

      return updated;
    });
  }

  return (
    <>
      {props.client ?
        <Form className="client-form" onSubmit={onSubmitClient}>
          <div className="client-name-container">
            <Label className="client-name-container__label" htmlFor="name"><h4>Name</h4></Label>
            <TextInput
              className="client-name-container__input"
              id="name"
              name="name"
              type="text"
              defaultValue={formState.data.name.get()}
              placeholder="Enter Client App Name"
              error={Validation(formState.data.name).invalid()}
              onChange={(event) => formState.data.name.set(event.target.value)}
            />
            {Validation(formState.data.name).invalid() &&
              Validation(formState.data.name).errors().map((error, idx) => {
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
                checked={formState.data.read.get()}
                onChange={(event) => formState.data.read.set(event.target.checked)} />

              <Checkbox className="options__write"
                id="write"
                name="write"
                label={<>Write</>}
                checked={formState.data.write.get()}
                onChange={(event) => formState.data.write.set(event.target.checked)} />
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
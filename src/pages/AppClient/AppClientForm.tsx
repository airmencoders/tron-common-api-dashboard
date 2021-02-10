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
import Alert from "../../components/Alert/Alert";

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
      dashboard_admin: props.client?.dashboard_admin || false,
      dashboard_user: props.client?.dashboard_user || false
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
            <Label className="client-name-container__label" htmlFor="name"><h5>Client Name</h5></Label>
            <TextInput
              className="client-name-container__input"
              id="name"
              name="name"
              type="text"
              defaultValue={formState.data.name.get()}
              placeholder="Enter Client App Name"
              error={Validation(formState.data.name).invalid()}
              onChange={(event) => formState.data.name.set(event.target.value)} />
          </div>

          <Fieldset className="permissions-container">
            <div className="permissions-container__title">
              <h5 className="title__text">Permissions</h5>
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

              <Checkbox className="options__dashboard-user"
                id="dashboard_user"
                name="dashboard_user"
                label={<>Dashboard User</>}
                checked={formState.data.dashboard_user.get()}
                onChange={(event) => formState.data.dashboard_user.set(event.target.checked)} />

              <Checkbox className="options__dashboard-admin"
                id="dashboard_admin"
                name="dashboard_admin"
                label={<>Dashboard Admin</>}
                checked={formState.data.dashboard_admin.get()}
                onChange={(event) => formState.data.dashboard_admin.set(event.target.checked)} />
            </div>

          </Fieldset>

          {Validation(formState).invalid() &&
            <Alert type="error" heading="Form errors" slim noIcon>
              {Validation(formState).errors().map((error, idx) => {
                return (
                  <React.Fragment key={idx}>{error.message}</React.Fragment>
                );
              })}
            </Alert>
          }

          <Button
            type={'submit'}
            className="submit-btn"
            disabled={Validation(formState).invalid() ? true : false}
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
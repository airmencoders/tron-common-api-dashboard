import React from 'react';
import { useState } from "@hookstate/core";
import { Validation } from "@hookstate/validation";
import { Initial } from "@hookstate/initial";
import { Touched } from "@hookstate/touched";
import Button from "../../components/Button/Button";
import Checkbox from "../../components/forms/Checkbox/Checkbox";
import Fieldset from "../../components/forms/Fieldset/Fieldset";
import Form from "../../components/forms/Form/Form";
import Label from "../../components/forms/Label/Label";
import TextInput from "../../components/forms/TextInput/TextInput";
import './AppClientForm.scss';
import { AppClientFormProps } from './AppClientFormProps';
import { AppClientFlat } from '../../state/app-clients/interface/app-client-flat';
import { AppClientFormActionType } from './AppClientFormActionType';
import { Spinner } from 'react-bootstrap';
import {useAppClientPageState} from './app-client-page-state';

function AppClientForm(props: AppClientFormProps) {
  const appClientPageState = useAppClientPageState();
  const formState = useState<AppClientFlat>({
    id: props.client?.id,
    name: props.client?.name || "",
    read: props.client?.read || false,
    write: props.client?.write || false,
  });

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  Validation(formState.name).validate(name => name.length > 0 && name.trim().length > 0, 'cannot be empty or blank.', 'error');

  function isFormModified() {
    return Initial(formState.name).modified() || Initial(formState.read).modified() || Initial(formState.write).modified();
  }

  function showNameValidation() {
    return Touched(formState.name).touched() && Validation(formState.name).invalid()
  }

  function isFormDisabled() {
    return props.successAction.success;
  }

  function closeForm(event: React.SyntheticEvent) {
    event.preventDefault();

    appClientPageState.set( prevState => ({
      isOpen: false,
      formAction: undefined,
      client: prevState.client
    }));
  }

  return (
    <>
      {(props.client && props.type === AppClientFormActionType.UPDATE) || props.type === AppClientFormActionType.ADD ?
        <Form className="client-form" onSubmit={(event) => props.onSubmit(event, formState.get())} data-testid="app-client-form">
          <div className="client-name-container">
            <Label className="client-name-container__label" htmlFor="name">Name</Label>
            <TextInput
              className="client-name-container__input"
              id="name"
              name="name"
              type="text"
              defaultValue={formState.name.get() || undefined}
              placeholder="Enter Client App Name"
              error={showNameValidation()}
              onChange={(event) => formState.name.set(event.target.value)}
              disabled={isFormDisabled()}
            />
            {showNameValidation() &&
              Validation(formState.name).errors().map((error, idx) => {
                return (
                  <p key={idx} className="client-name-container__error validation-error">* {error.message}</p>
                );
              })
            }
            {props.errors?.validation?.name && <p className="client-name-container__error validation-error">* {props.errors?.validation?.name}</p>}
          </div>

          <Fieldset className="permissions-container">
            <div className="permissions-container__title">
              <Label className="client-name-container__label" htmlFor="permissions">Permissions</Label>
            </div>

            <div className="permissions-container__options">
              <Checkbox className="options__read"
                id="read"
                name="read"
                label={<>Read</>}
                checked={formState.read.get()}
                onChange={(event) => formState.read.set(event.target.checked)}
                disabled={isFormDisabled()} />

              <Checkbox className="options__write"
                id="write"
                name="write"
                label={<>Write</>}
                checked={formState.write.get()}
                onChange={(event) => formState.write.set(event.target.checked)}
                disabled={isFormDisabled()} />
            </div>

          </Fieldset>

          {props.errors?.general && <p className="validation-error">* {props.errors?.general}</p>}
          {
            props.successAction.successMsg &&
              <div className="client-form__success-container">
                <p className="successful-operation">
                  {props.successAction.successMsg}
                </p>
                <Button type="button" onClick={closeForm} className="success-container__close">Close</Button>
              </div>
          }

          {!props.successAction.success &&
            <div className="button-container">
              <Button type="button" onClick={props.onCancel} unstyled>Cancel</Button>
              <Button
                type="submit"
                className="button-container__submit"
                disabled={Validation(formState).invalid() || !isFormModified() || props.isSubmitting}
              >
                {props.isSubmitting ?
                  <Spinner animation="border" role="status" variant="primary">
                    <span className="sr-only">Submitting...</span>
                  </Spinner>
                  :
                  props.type === AppClientFormActionType.ADD ?
                    <>Add</>
                    :
                  <>Update</>
                }
              </Button>
          </div>
          }
        </Form>
        :
        <div data-testid="app-client-form__no-data">
          <p>There was an error loading client details...</p>
        </div>
      }
    </>
  );
}

export default AppClientForm;

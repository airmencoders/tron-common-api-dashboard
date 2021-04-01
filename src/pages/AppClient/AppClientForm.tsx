import React, { FormEvent } from 'react';
import { useState } from "@hookstate/core";
import { Validation } from "@hookstate/validation";
import { Initial } from "@hookstate/initial";
import { Touched } from "@hookstate/touched";
import Checkbox from "../../components/forms/Checkbox/Checkbox";
import Form from "../../components/forms/Form/Form";
import TextInput from "../../components/forms/TextInput/TextInput";
import { AppClientFlat } from '../../state/app-clients/app-client-flat';
import { CreateUpdateFormProps } from '../../components/DataCrudFormPage/CreateUpdateFormProps';
import { FormActionType } from '../../state/crud-page/form-action-type';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';

function AppClientForm(props: CreateUpdateFormProps<AppClientFlat>) {
  const formState = useState<AppClientFlat>({
    id: props.data?.id,
    name: props.data?.name || "",
    read: props.data?.read || false,
    write: props.data?.write || false,
  });

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  Validation(formState.name).validate(name => name.length > 0 && name.trim().length > 0, 'cannot be empty or blank.', 'error');

  function isFormModified() {
    return Initial(formState.name).modified() || Initial(formState.read).modified() || Initial(formState.write).modified();
  }

  function isFormDisabled() {
    return props.successAction?.success;
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.onSubmit(formState.get());
  }

  function createNameErrors(): string[] {
    const errors: string[] = Validation(formState.name).errors().map(validationError => validationError.message);
    const serverNameValid = props.formErrors?.validation?.name;
    return serverNameValid ? errors.concat([serverNameValid]) : errors;
  }

  return (
    <Form className="app-client-form" onSubmit={(event) => submitForm(event)} data-testid="app-client-form">
      {props.formActionType === FormActionType.UPDATE &&
        <FormGroup
          labelName="uuid"
          labelText="UUID"
          isError={false}
        >
          <TextInput
            id="uuid"
            name="uuid"
            type="text"
            defaultValue={formState.id.get()}
            disabled={true}
          />
        </FormGroup>
      }

      <FormGroup
        labelName="name"
        labelText="Name"
        isError={(Touched(formState.name).touched() && Validation(formState.name).invalid()) || props.formErrors?.validation?.name != null}
        errorMessages={createNameErrors()}
      >
        <TextInput
          id="name"
          name="name"
          type="text"
          defaultValue={formState.name.get()}
          error={(Touched(formState.name).touched() && Validation(formState.name).invalid()) || props.formErrors?.validation?.name != null}
          onChange={(event) => formState.name.set(event.target.value)}
          disabled={isFormDisabled()}
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
          disabled={isFormDisabled()}
        />

        <Checkbox
          id="write"
          name="write"
          label={<>Write</>}
          checked={formState.write.get()}
          onChange={(event) => formState.write.set(event.target.checked)}
          disabled={isFormDisabled()}
        />
      </FormGroup>

      <SuccessErrorMessage
        successMessage={props.successAction?.successMsg}
        errorMessage={props.formErrors?.general || ''}
        showErrorMessage={props.formErrors?.general != null}
        showSuccessMessage={props.successAction != null && props.successAction?.success}
        showCloseButton={true}
        onCloseClicked={props.onClose}
      />
      {
        props.successAction == null &&
        <SubmitActions
          formActionType={props.formActionType}
          onCancel={props.onClose}
          onSubmit={submitForm}
          isFormValid={Validation(formState).valid()}
          isFormModified={isFormModified()}
          isFormSubmitting={props.isSubmitting}
        />
      }
    </Form>
  );
}

export default AppClientForm;

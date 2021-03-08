import React, { FormEvent } from 'react';
import Form from "../../components/forms/Form/Form";
import TextInput from "../../components/forms/TextInput/TextInput";
import { DashboardUserFlat } from '../../state/dashboard-user/dashboard-user-flat';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { DeleteComponentProps } from '../../components/DataCrudFormPage/DeleteComponentProps';

function DashboardUserDeleteForm(props: DeleteComponentProps<DashboardUserFlat>) {
  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.onSubmit(props.data);
  }

  return (
    <Form className="dashboard-user-delete-form" onSubmit={(event) => submitForm(event)} data-testid="dashboard-user-delete-form">
      <FormGroup
        labelName="uuid"
        labelText="UUID"
        isError={false}
      >
        <TextInput
          id="uuid"
          name="uuid"
          type="text"
          defaultValue={props.data?.id}
          disabled={true}
        />
      </FormGroup>

      <FormGroup
        labelName="email"
        labelText="Email"
      >
        <TextInput
          id="email"
          name="email"
          type="email"
          defaultValue={props.data?.email}
          disabled={true}
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
          formActionType={FormActionType.DELETE}
          onCancel={props.onClose}
          onSubmit={submitForm}
          isFormValid={true}
          isFormModified={true}
          isFormSubmitting={props.isSubmitting}
        />
      }
    </Form>
  );
}

export default DashboardUserDeleteForm;

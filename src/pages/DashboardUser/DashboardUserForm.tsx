import React, { FormEvent } from 'react';
import { useState } from "@hookstate/core";
import { Validation } from "@hookstate/validation";
import { Initial } from "@hookstate/initial";
import { Touched } from "@hookstate/touched";
import Checkbox from "../../components/forms/Checkbox/Checkbox";
import Form from "../../components/forms/Form/Form";
import TextInput from "../../components/forms/TextInput/TextInput";
import { CreateUpdateFormProps } from '../../components/DataCrudFormPage/CreateUpdateFormProps';
import { DashboardUserFlat } from '../../state/dashboard-user/dashboard-user-flat';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { failsHookstateValidation, generateStringErrorMessages, validateCheckboxPrivileges, validateEmail, validateRequiredString, validateStringLength, validationErrors } from '../../utils/validation-utils';
import {DashboardUserDto} from '../../openapi/models';
import {PrivilegeType} from '../../state/privilege/privilege-type';
import {useDashboardUserState} from '../../state/dashboard-user/dashboard-user-state';
import {combineArraysByKey} from '../../utils/array-utils';

function DashboardUserForm(props: CreateUpdateFormProps<DashboardUserDto>) {
  const dashboardUserService = useDashboardUserState();
  const formState = useState<DashboardUserFlat>({
    id: props.data?.id || "",
    email: props.data?.email || "",
    hasDashboardAdmin: props.data?.privileges?.some(priv => priv.name === PrivilegeType.DASHBOARD_ADMIN) || false,
  });

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  Validation(formState.email).validate(email => validateEmail(email), validationErrors.invalidEmail, 'error');
  Validation(formState.email).validate(validateRequiredString, validationErrors.requiredText, 'error');
  Validation(formState.email).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  function isFormModified() {
    return Initial(formState.email).modified() || Initial(formState.hasDashboardAdmin).modified();
  }

  function isFormDisabled() {
    return props.successAction?.success;
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const updatedForm = formState.get();
    const updatedDto = dashboardUserService.convertToDto(updatedForm);
    const existingPrivs = props.data?.privileges ?? [];
    const filteredExistingPrivs = existingPrivs.filter(priv => priv.name !== PrivilegeType.DASHBOARD_ADMIN);
    const privs = combineArraysByKey([filteredExistingPrivs, updatedDto?.privileges],
        (priv) => priv.name, false);
    updatedDto.privileges = privs;
    props.onSubmit(updatedDto);
  }

  function isPermissionsError(): boolean {
    return Touched(formState.hasDashboardAdmin).touched() && Validation(formState.hasDashboardAdmin).invalid();
  }

  function getPermissionsErrors(): string[] {
    return Validation(formState.hasDashboardAdmin).errors().map(validationError => validationError.message);
  }

  return (
    <Form className="dashboard-user-form" onSubmit={(event) => submitForm(event)} data-testid="dashboard-user-form">
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
        labelName="email"
        labelText="Email"
        isError={failsHookstateValidation(formState.email)}
        errorMessages={generateStringErrorMessages(formState.email)}
        required
      >
        <TextInput
          id="email"
          name="email"
          type="email"
          defaultValue={formState.email.get()}
          error={failsHookstateValidation(formState.email)}
          onChange={(event) => formState.email.set(event.target.value)}
          disabled={isFormDisabled()}
        />
      </FormGroup>

      <FormGroup
        labelName="permissions"
        labelText="Permissions"
        isError={isPermissionsError()}
        errorMessages={getPermissionsErrors()}
        required
      >
        <Checkbox
          id="dashboard_admin"
          name="dashboard_admin"
          label={<>Dashboard Admin</>}
          checked={formState.hasDashboardAdmin.get()}
          onChange={(event) => formState.hasDashboardAdmin.set(event.target.checked)}
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
          isFormValid={Validation(formState).valid()}
          isFormModified={isFormModified()}
          isFormSubmitting={props.isSubmitting}
        />
      }
    </Form>
  );
}

export default DashboardUserForm;

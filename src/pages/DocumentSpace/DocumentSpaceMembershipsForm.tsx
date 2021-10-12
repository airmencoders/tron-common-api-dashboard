import { none, useHookstate } from '@hookstate/core';
import { Initial } from '@hookstate/initial';
import { Touched } from '@hookstate/touched';
import { Validation } from '@hookstate/validation';
import React, { ChangeEvent, FormEvent } from 'react';
import Checkbox from '../../components/forms/Checkbox/Checkbox';
import Form from '../../components/forms/Form/Form';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import { SuccessErrorMessageProps } from '../../components/forms/SuccessErrorMessage/SuccessErrorMessageProps';
import TextInput from '../../components/forms/TextInput/TextInput';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import { DocumentSpaceDashboardMemberRequestDto, DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum } from '../../openapi';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { documentSpaceMembershipService } from '../../state/document-space/document-space-state';
import { getEnumKeyByEnumValue } from '../../utils/enum-utils';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';
import { failsHookstateValidation, generateStringErrorMessages, isFormFieldModified, isFormModified, validateEmail, validateRequiredString, validationErrors } from '../../utils/validation-utils';
import { DocumentSpaceMembershipsFormProps } from './DocumentSpaceMembershipsFormProps';

interface DocumentSpaceMembershipFormState {
  member: DocumentSpaceDashboardMemberRequestDto;
  originalMember: DocumentSpaceDashboardMemberRequestDto;
  touchedState?: Record<keyof DocumentSpaceDashboardMemberRequestDto, boolean>;
  formState: SuccessErrorMessageProps & { isSubmitting: boolean; };
}

function getDefaultFormState(): SuccessErrorMessageProps & { isSubmitting: boolean; } {
  return {
    successMessage: '',
    errorMessage: '',
    showSuccessMessage: false,
    showErrorMessage: false,
    showCloseButton: false,
    isSubmitting: false
  };
}

function DocumentSpaceMembershipsForm(props: DocumentSpaceMembershipsFormProps) {
  const membershipService = documentSpaceMembershipService();
  const membershipState = useHookstate<DocumentSpaceMembershipFormState>({
    member: {
      email: '',
      privileges: []
    },
    originalMember: {
      email: '',
      privileges: []
    },
    formState: getDefaultFormState()
  });

  membershipState.attach(Validation);
  membershipState.attach(Initial);
  membershipState.attach(Touched);

  Validation(membershipState.member.email).validate(validateEmail, validationErrors.invalidEmail, 'error');
  Validation(membershipState.member.email).validate(validateRequiredString, validationErrors.requiredText, 'error');

  Validation(membershipState.member.privileges).validate(privileges => privileges.length > 0, validationErrors.atLeastOnePrivilege, 'error');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      membershipState.formState.isSubmitting.set(true);
      await membershipService.addDocumentSpaceMember(props.documentSpaceId, membershipState.member.value);

      membershipState.member.merge({
        email: '',
        privileges: []
      })
      membershipState.formState.merge({
        successMessage: 'Successfully added member to Document Space',
        showSuccessMessage: true,
        isSubmitting: false
      });

      props.onMemberChangeCallback();
    } catch (error) {
      createTextToast(ToastType.ERROR, 'Failed to add Document Space member');
      const preparedError = prepareRequestError(error);
      membershipState.formState.merge({
        errorMessage: preparedError.message,
        showErrorMessage: true,
        isSubmitting: false
      });
    } finally {
      membershipState.touchedState.set(none);
    }
  }

  function onEmailChange(event: ChangeEvent<HTMLInputElement>) {
    membershipState.member.merge({
      email: event.target.value
    });
    membershipState.formState.merge(getDefaultFormState());
    membershipState.touchedState.merge({
      email: true
    });
  }

  function onPrivilegeChange(event: ChangeEvent<HTMLInputElement>) {
    const enumVal = getEnumKeyByEnumValue(DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum, event.target.name);
    if (enumVal == null) {
      throw new Error('Document Space Privilege Enum does not exist');
    }

    if (event.target.checked) {
      membershipState.member.privileges.merge([DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum[enumVal]]);
    } else {
      membershipState.member.privileges.merge(prev => {
        const existingPrivilegeIndex = prev.findIndex(privilege => privilege === DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum[enumVal]);

        return {
          [existingPrivilegeIndex]: none
        };
      });
    }

    membershipState.formState.merge(getDefaultFormState());

    membershipState.touchedState.merge({
      privileges: true
    });
  }

  return (
    <Form onSubmit={onSubmit}>
      <h4>Add Member</h4>
      <FormGroup
        labelName="email"
        labelText="Email"
        isError={
          Validation(membershipState.member.email).invalid() &&
          (isFormFieldModified(membershipState.originalMember.email.value, membershipState.member.email.value) || membershipState.touchedState.value?.email)
        }
        errorMessages={generateStringErrorMessages(membershipState.member.email)}
        required
      >
        <TextInput
          id="email"
          name="email"
          type="text"
          disabled={membershipState.formState.isSubmitting.value}
          onChange={onEmailChange}
          value={membershipState.member.email.value}
        />
      </FormGroup>

      <FormGroup
        labelName="privileges"
        labelText="Document Space Privileges"
        isError={
          Validation(membershipState.member.privileges).invalid() &&
          (isFormFieldModified(membershipState.originalMember.privileges.value, membershipState.member.privileges.value) || membershipState.touchedState.value?.privileges)
        }
        errorMessages={generateStringErrorMessages(membershipState.member.privileges)}
        required
      >
        {
          Object.values(DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum).map(value => {
            return (
              <Checkbox
                key={value}
                id={`privilege_${value}`}
                name={value}
                label={<>{value}</>}
                checked={membershipState.member.privileges.value.find(privilege => privilege === value) ? true : false}
                onChange={onPrivilegeChange}
                disabled={membershipState.formState.isSubmitting.value}
              />
            );
          })
        }
      </FormGroup>

      <SuccessErrorMessage
        errorMessage={membershipState.formState.errorMessage.value}
        showErrorMessage={membershipState.formState.showErrorMessage.value}
        showSuccessMessage={membershipState.formState.showSuccessMessage.value}
        successMessage={membershipState.formState.successMessage.value}
        showCloseButton={true}
        onCloseClicked={membershipState.formState.onCloseClicked.value}
      />
      <SubmitActions
        formActionType={FormActionType.ADD}
        isFormValid={!failsHookstateValidation(membershipState.member)}
        isFormModified={isFormModified(membershipState.originalMember.value, membershipState.member.value)}
        isFormSubmitting={membershipState.formState.isSubmitting.value}
      />
    </Form>
  );
}

export default DocumentSpaceMembershipsForm;
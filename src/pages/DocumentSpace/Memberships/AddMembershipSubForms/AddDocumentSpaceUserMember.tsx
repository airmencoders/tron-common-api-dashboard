import { none, useHookstate } from "@hookstate/core";
import { Initial } from "@hookstate/initial";
import { Touched } from "@hookstate/touched";
import { Validation } from "@hookstate/validation";
import { ChangeEvent, FormEvent, useEffect, useRef } from "react";
import Accordion from "../../../../components/Accordion/Accordion";
import Checkbox from "../../../../components/forms/Checkbox/Checkbox";
import Form from "../../../../components/forms/Form/Form";
import FormGroup from "../../../../components/forms/FormGroup/FormGroup";
import SubmitActions from "../../../../components/forms/SubmitActions/SubmitActions";
import SuccessErrorMessage from "../../../../components/forms/SuccessErrorMessage/SuccessErrorMessage";
import { SuccessErrorMessageProps } from "../../../../components/forms/SuccessErrorMessage/SuccessErrorMessageProps";
import TextInput from "../../../../components/forms/TextInput/TextInput";
import { ToastType } from "../../../../components/Toast/ToastUtils/toast-type";
import { createTextToast } from "../../../../components/Toast/ToastUtils/ToastUtils";
import { DocumentSpaceDashboardMemberRequestDto, DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum } from "../../../../openapi";
import { FormActionType } from "../../../../state/crud-page/form-action-type";
import { documentSpaceMembershipService } from "../../../../state/document-space/document-space-state";
import { DocumentSpacePrivilegeNiceName } from "../../../../state/document-space/memberships/document-space-privilege-nice-name";
import { resolvePrivName, unResolvePrivName } from "../../../../utils/document-space-utils";
import { prepareRequestError } from "../../../../utils/ErrorHandling/error-handling-utils";
import { failsHookstateValidation, generateStringErrorMessages, isFormFieldModified, isFormModified, validateEmail, validateRequiredString, validationErrors } from "../../../../utils/validation-utils";

export interface DocumentSpaceUserMembershipFormState {
  member: DocumentSpaceDashboardMemberRequestDto;
  originalMember: DocumentSpaceDashboardMemberRequestDto;
  touchedState?: Record<keyof DocumentSpaceDashboardMemberRequestDto, boolean>;
  formState: SuccessErrorMessageProps & { isSubmitting: boolean };
}

export interface DocumentSpaceUserMembershipsFormProps {
  documentSpaceId: string;
  onMemberChangeCallback: () => void;
  onCloseHandler?: () => void;
}

function getDefaultFormState(): SuccessErrorMessageProps & { isSubmitting: boolean } {
  return {
    successMessage: '',
    errorMessage: '',
    showSuccessMessage: false,
    showErrorMessage: false,
    showCloseButton: false,
    isSubmitting: false,
  };
}

export default function AddDocumentSpaceUserMember(props: DocumentSpaceUserMembershipsFormProps) {
  const membershipService = documentSpaceMembershipService();
  const membershipState = useHookstate<DocumentSpaceUserMembershipFormState>({
    member: {
      email: '',
      privileges: [],
    },
    originalMember: {
      email: '',
      privileges: [],
    },
    formState: getDefaultFormState(),
  });

  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return function cleanup() {
      mountedRef.current = false;
    };
  }, []);

  membershipState.attach(Validation);
  membershipState.attach(Initial);
  membershipState.attach(Touched);

  Validation(membershipState.member.email).validate(validateEmail, validationErrors.invalidEmail, 'error');
  Validation(membershipState.member.email).validate(validateRequiredString, validationErrors.requiredText, 'error');


  async function onSubmitNewMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      membershipState.formState.isSubmitting.set(true);
      await membershipService.addDocumentSpaceMember(props.documentSpaceId, membershipState.member.value);

      if (mountedRef.current) {
        membershipState.member.merge({
          email: '',
          privileges: [],
        });
        membershipState.formState.merge({
          successMessage: 'Successfully added member to Document Space',
          showSuccessMessage: true,
          isSubmitting: false,
        });
      }

      props.onMemberChangeCallback();
    } catch (error) {
      if (mountedRef.current) {
        createTextToast(ToastType.ERROR, 'Failed to add Document Space member');
        const preparedError = prepareRequestError(error);
        membershipState.formState.merge({
          errorMessage: preparedError.message,
          showErrorMessage: true,
          isSubmitting: false,
        });
      }
    } finally {
      if (mountedRef.current) {
        membershipState.touchedState.set(none);
      }
    }
  }


  function onEmailChange(event: ChangeEvent<HTMLInputElement>) {
    membershipState.member.merge({
      email: event.target.value,
    });
    membershipState.formState.merge(getDefaultFormState());
    membershipState.touchedState.merge({
      email: true,
    });
  }

  function onPrivilegeChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      membershipState.member.privileges.set(
        unResolvePrivName(resolvePrivName(event.target.name)) as DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum[]
      ); // will grant the selected priv and any below it
    } else {
      membershipState.member.privileges.merge((prev) => {
        const existingPrivilegeIndex = prev.findIndex((privilege) => privilege === event.target.name);

        return {
          [existingPrivilegeIndex]: none,
        };
      });
    }

    membershipState.formState.merge(getDefaultFormState());    
    membershipState.touchedState.merge({
      privileges: true,
    });
  }

  
  return (
    <Accordion
        items={[
          {
            id: 'new_member',
            title: 'Add New Member',
            content: (
              <Form onSubmit={onSubmitNewMember} className="add-members-form">
                <FormGroup
                  labelName="email"
                  labelText="Email"
                  isError={
                    Validation(membershipState.member.email).invalid() &&
                    (isFormFieldModified(
                      membershipState.originalMember.email.value,
                      membershipState.member.email.value
                    ) ||
                      membershipState.touchedState.value?.email)
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
                    (isFormFieldModified(
                      membershipState.originalMember.privileges.value,
                      membershipState.member.privileges.value
                    ) ||
                      membershipState.touchedState.value?.privileges)
                  }
                  errorMessages={generateStringErrorMessages(membershipState.member.privileges)}
                  required
                >
                  <Checkbox
                    id="privilege_MEMBERSHIP"
                    data-testid="privilege_MEMBERSHIP"
                    name={DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum.Membership}
                    label={DocumentSpacePrivilegeNiceName.ADMIN}
                    checked={
                      !!membershipState.member.privileges.value.find(
                        (privilege) => privilege === DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum.Membership
                      )
                    }
                    onChange={onPrivilegeChange}
                    disabled={membershipState.formState.isSubmitting.value}
                  />
                  <Checkbox
                    id="privilege_WRITE"
                    data-testid="privilege_WRITE"
                    name={DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum.Write}
                    label={DocumentSpacePrivilegeNiceName.EDITOR}
                    checked={
                      !!membershipState.member.privileges.value.find(
                        (privilege) => privilege === DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum.Write
                      )
                    }
                    onChange={onPrivilegeChange}
                    disabled={
                      membershipState.formState.isSubmitting.value ||
                      !!membershipState.member.privileges.value.find(
                        (privilege) => privilege === DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum.Membership
                      )
                    }
                  />

                  {/* include disabled READ checkbox that is checked - to imply READ is always given upon assignment */}
                  <Checkbox
                    id="privilege_READ"
                    name="privilege_READ"
                    label={DocumentSpacePrivilegeNiceName.VIEWER}
                    checked={true}
                    disabled={true}
                  />
                </FormGroup>
                <SubmitActions
                  onCancel={props.onCloseHandler}
                  cancelButtonLabel="Close"
                  submitButtonLabel="Add User"
                  formActionType={FormActionType.ADD}
                  isFormValid={!failsHookstateValidation(membershipState.member)}
                  isFormModified={isFormModified(membershipState.originalMember.value, membershipState.member.value)}
                  isFormSubmitting={membershipState.formState.isSubmitting.value}
                />
                <SuccessErrorMessage
                  errorMessage={membershipState.formState.errorMessage.value}
                  showErrorMessage={membershipState.formState.showErrorMessage.value}
                  showSuccessMessage={membershipState.formState.showSuccessMessage.value}
                  successMessage={membershipState.formState.successMessage.value}
                  showCloseButton={true}
                  onCloseClicked={membershipState.formState.onCloseClicked.value}
              />
              </Form>
            ),
          }]}
        />
  )
}
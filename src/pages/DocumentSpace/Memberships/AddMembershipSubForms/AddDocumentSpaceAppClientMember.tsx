import { none, useHookstate } from '@hookstate/core';
import { Touched } from '@hookstate/touched';
import { Validation } from '@hookstate/validation';
import { ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import { Dropdown } from 'semantic-ui-react';
import Accordion from '../../../../components/Accordion/Accordion';
import Checkbox from '../../../../components/forms/Checkbox/Checkbox';
import Form from '../../../../components/forms/Form/Form';
import FormGroup from '../../../../components/forms/FormGroup/FormGroup';
import SubmitActions from '../../../../components/forms/SubmitActions/SubmitActions';
import SuccessErrorMessage from '../../../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import { SuccessErrorMessageProps } from '../../../../components/forms/SuccessErrorMessage/SuccessErrorMessageProps';
import { ToastType } from '../../../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../../../components/Toast/ToastUtils/ToastUtils';
import { AppClientSummaryDto, DocumentSpaceAppClientMemberRequestDto, DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum } from '../../../../openapi';
import { FormActionType } from '../../../../state/crud-page/form-action-type';
import { documentSpaceMembershipService } from '../../../../state/document-space/document-space-state';
import { DocumentSpacePrivilegeNiceName } from '../../../../state/document-space/memberships/document-space-privilege-nice-name';
import { resolvePrivName, unResolvePrivName } from '../../../../utils/document-space-utils';
import { prepareRequestError } from '../../../../utils/ErrorHandling/error-handling-utils';
import { failsHookstateValidation, generateStringErrorMessages, isFormFieldModified, isFormModified } from '../../../../utils/validation-utils';

export interface DocumentSpaceAppClientMembershipFormState {
  appClientMember: DocumentSpaceAppClientMemberRequestDto;
  originalMember: DocumentSpaceAppClientMemberRequestDto;
  touchedState?: Record<keyof DocumentSpaceAppClientMemberRequestDto, boolean>;
  formState: SuccessErrorMessageProps & { isSubmitting: boolean };
}

export interface DocumentSpaceAppClientMembershipsFormProps {
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

export default function AddDocumentSpaceAppClientMember(props: DocumentSpaceAppClientMembershipsFormProps) {
  const membershipService = documentSpaceMembershipService();
  const availableAppClients = useHookstate<AppClientSummaryDto[]>([]);

  const membershipState = useHookstate<DocumentSpaceAppClientMembershipFormState>({
    appClientMember: {
      appClientId: '',
      privileges: [],
    },
    originalMember: {
      appClientId: '',
      privileges: [],
    },
    formState: getDefaultFormState(),
  });

  membershipState.attach(Validation);
  membershipState.attach(Touched);
  
  Validation(membershipState.appClientMember.appClientId).validate(value => !!value, 'App Client cannot be blank', 'error');

  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    getAvailableAppClients();
    return function cleanup() {
      mountedRef.current = false;
    };
  }, []);

  // fetch available app clients
  function getAvailableAppClients() {
    membershipService.getAvailableAppClientsForDocumentSpace(props.documentSpaceId)
      .then(response => {
        if (mountedRef.current) availableAppClients.set(response);
      })
      .catch(() => {
        if (mountedRef.current) availableAppClients.set([]);
      });
  }

  async function onSubmitNewAppClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      membershipState.formState.isSubmitting.set(true);
      await membershipService.addDocumentSpaceAppClientMember(props.documentSpaceId, membershipState.appClientMember.value);

      if (mountedRef.current) {
        membershipState.appClientMember.merge({
          appClientId: '',
          privileges: [],
        });
        membershipState.formState.merge({
          successMessage: 'Successfully added App Client to Document Space',
          showSuccessMessage: true,
          isSubmitting: false,
        });
      }

      props.onMemberChangeCallback();
    } catch (error) {
      if (mountedRef.current) {
        createTextToast(ToastType.ERROR, 'Failed to add App Client to Document Space');
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
        getAvailableAppClients();
      }
    }
  }

  function onAppClientPrivilegeChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {      
      membershipState.appClientMember.privileges.set(
        unResolvePrivName(resolvePrivName(event.target.name)) as DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum[]
      ); // will grant the selected priv and any below it
    } else {
      membershipState.appClientMember.privileges.merge((prev) => {
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
          id: 'new_app_client',
          title: 'Add New App Client',
          content: (
            <Form onSubmit={onSubmitNewAppClient} className="add-members-form">
              <FormGroup labelName="app-client-name" labelText="App Client" required>
                <Dropdown
                  id="app-client-member-select"
                  data-testid="app-client-member-select"
                  name="app-client-member-select"
                  selection
                  disabled={membershipState.formState.isSubmitting.value}
                  value={membershipState.appClientMember.value.appClientId ?? ''}
                  onChange={(_, data) => {
                    if (data.value) {
                      membershipState.appClientMember.appClientId.set(data.value as string);
                    }
                  }}
                  options={availableAppClients.get().map((item) => {
                    return {
                      text: item.name,
                      value: item.id,
                      'data-testid': item.name,
                    };
                  })}
                />
              </FormGroup>

              <FormGroup
                labelName="privileges"
                labelText="Document Space Privileges"
                isError={
                  Validation(membershipState.appClientMember.privileges).invalid() &&
                  (isFormFieldModified(
                    membershipState.originalMember.privileges.value,
                    membershipState.appClientMember.privileges.value
                  ) ||
                    membershipState.touchedState.value?.privileges)
                }
                errorMessages={generateStringErrorMessages(membershipState.appClientMember.privileges)}
                required
              >
                <Checkbox
                  id="app_client_privilege_MEMBERSHIP"
                  name={DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum.Membership}
                  label={DocumentSpacePrivilegeNiceName.ADMIN}
                  checked={
                    !!membershipState.appClientMember.privileges.value.find(
                      (privilege) => privilege === DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum.Membership
                    )
                  }
                  onChange={onAppClientPrivilegeChange}
                  disabled={membershipState.formState.isSubmitting.value}
                />
                <Checkbox
                  id="app_client_privilege_WRITE"
                  name={DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum.Write}
                  label={DocumentSpacePrivilegeNiceName.EDITOR}
                  checked={
                    !!membershipState.appClientMember.privileges.value.find(
                      (privilege) => privilege === DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum.Write
                    )
                  }
                  onChange={onAppClientPrivilegeChange}
                  disabled={
                    membershipState.formState.isSubmitting.value ||
                    !!membershipState.appClientMember.privileges.value.find(
                      (privilege) => privilege === DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum.Membership
                    )
                  }
                />

                {/* include disabled READ checkbox that is checked - to imply READ is always given upon assignment */}
                <Checkbox
                  id="app_client_privilege_READ"
                  name="app_cient_privilege_READ"
                  label={DocumentSpacePrivilegeNiceName.VIEWER}
                  checked={true}
                  disabled={true}
                />
              </FormGroup>
              <SubmitActions
                onCancel={props.onCloseHandler}
                cancelButtonLabel="Close"
                submitButtonLabel="Add App"
                formActionType={FormActionType.ADD}
                isFormValid={!failsHookstateValidation(membershipState.appClientMember)}
                isFormModified={isFormModified(membershipState.originalMember.value, membershipState.appClientMember.value)}
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
        },
      ]}
    />
  );
}

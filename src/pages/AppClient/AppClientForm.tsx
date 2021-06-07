import { useHookstate, useState } from "@hookstate/core";
import { Initial } from "@hookstate/initial";
import { Touched } from "@hookstate/touched";
import { Validation } from "@hookstate/validation";
import React, {FormEvent, ReactNode, useMemo} from 'react';
import ApiSpecCellRenderer from "../../components/ApiSpecCellRenderer/ApiSpecCellRenderer";
import Button from '../../components/Button/Button';
import { CreateUpdateFormProps } from '../../components/DataCrudFormPage/CreateUpdateFormProps';
import DeleteCellRenderer from '../../components/DeleteCellRenderer/DeleteCellRenderer';
import Checkbox from "../../components/forms/Checkbox/Checkbox";
import Form from "../../components/forms/Form/Form";
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import TextInput from "../../components/forms/TextInput/TextInput";
import GridColumn from '../../components/Grid/GridColumn';
import ItemChooser from '../../components/ItemChooser/ItemChooser';
import { AppClientFlat } from "../../state/app-clients/app-client-flat";
import { accessAuthorizedUserState } from '../../state/authorized-user/authorized-user-state';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { PrivilegeType } from '../../state/privilege/privilege-type';
import { generateStringErrorMessages, failsHookstateValidation, validateEmail, validateRequiredString, validateStringLength, validationErrors } from '../../utils/validation-utils';
import Accordion from '../../components/Accordion/Accordion';
import {AccordionItem} from '../../components/Accordion/AccordionItem';
import AppSourceEndpointInfo from './AppSourceEndpointInfo';

interface DeveloperEmail {
  email: string;
}

function AppClientForm(props: CreateUpdateFormProps<AppClientFlat>) {
  const formState = useState<AppClientFlat>({
    id: props.data?.id,
    name: props.data?.name || "",
    read: props.data?.read || false,
    write: props.data?.write || false,
    appClientDeveloperEmails: props.data?.appClientDeveloperEmails ?? [],
    appSourceEndpoints: props.data?.appSourceEndpoints ?? [],
  });
  const expandedAppSource = useState<string | null>(null);

  const currentUser = accessAuthorizedUserState();
  const developerAddState = useHookstate({
    email: ''
  });

  const appSourceAccordionItems: Array<AccordionItem> = useMemo(() => {
    return formState.appSourceEndpoints?.get()?.map((appSourceDevDetails) => ({
      title: `${appSourceDevDetails.name}`,
      content: <AppSourceEndpointInfo
          appSourceDevDetails={appSourceDevDetails}
          isOpened={expandedAppSource.get() === appSourceDevDetails.appSourceId}
      />,
      id: appSourceDevDetails.appSourceId
    })) || [];
  },[formState.appSourceEndpoints, expandedAppSource.get()]);

  // if the app client record hasn't resolved yet then no point continuing yet
  if (formState.promised) return <></>;

  developerAddState.attach(Validation);
  developerAddState.attach(Initial);
  developerAddState.attach(Touched);

  Validation(developerAddState.email).validate(email => validateEmail(email), validationErrors.invalidEmail, 'error');
  Validation(developerAddState.email).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  Validation(formState.name).validate(name => validateRequiredString(name), validationErrors.requiredText, 'error');
  Validation(formState.name).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  function isFormModified() {
    return Initial(formState.name).modified()
            || Initial(formState.read).modified() || Initial(formState.write).modified()
            || Initial(formState.appClientDeveloperEmails).modified()
  }

  function isFormDisabled() {
    return props.successAction?.success;
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.onSubmit(formState.get());
  }

  function deleteAppClientDeveloper(deleteItem: DeveloperEmail) {

    // get rid of the email we wanna delete and update the state
    const emails = new Array<string>();
    const entries = formState.appClientDeveloperEmails.get();
    if (entries !== undefined) {
      for (const entry of entries) {
        if (entry !== deleteItem.email) emails.push(entry);
      }

      formState.appClientDeveloperEmails.set(emails);
    }
  }

  function addAppClientDeveloper() {

    // append new email to the list and update state
    let emails = new Array<string>();
    const entries = formState.appClientDeveloperEmails.get() ?? [];
    emails = [...entries];
    emails.push(developerAddState.email.get());
    formState.appClientDeveloperEmails.set(emails);
    developerAddState.email.set('');
  }

  function createNameErrors(): string[] {
    const errors: string[] = Validation(formState.name).errors().map(validationError => validationError.message);
    const serverNameValid = props.formErrors?.validation?.name;
    return serverNameValid ? errors.concat([serverNameValid]) : errors;
  }

  function handleAccordionExpanded(itemId: string | null) {
    expandedAppSource.set(itemId);
  }

  const deleteBtnName = 'Delete';
  const appClientDeveloperColumns: GridColumn[] = [
    new GridColumn({
      field: 'email',
      sortable: true,
      filter: true,
      headerName: 'Developer',
      resizable: true
    })
  ];

  /**
   * Prevent anymore interactions with the grid
   * after a successful submit or while the
   * current request is pending.
   *
   * Removes "remove" icon and functionality
   */
  if (!isFormDisabled()) {
    appClientDeveloperColumns.push(
      new GridColumn({
        headerName: deleteBtnName,
        headerClass: 'header-center',
        cellRenderer: DeleteCellRenderer,
        cellRendererParams: { onClick: deleteAppClientDeveloper }
      })
    );
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
        isError={failsHookstateValidation(formState.name) || props.formErrors?.validation?.name != null}
        errorMessages={createNameErrors()}
        required
      >
        <TextInput
          id="name"
          name="name"
          type="text"
          defaultValue={formState.name.get()}
          error={failsHookstateValidation(formState.name) || props.formErrors?.validation?.name != null}
          onChange={(event) => formState.name.set(event.target.value)}
          disabled={isFormDisabled() || currentUser.authorizedUserHasPrivilege(PrivilegeType.APP_CLIENT_DEVELOPER)}
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
          disabled={isFormDisabled() || currentUser.authorizedUserHasPrivilege(PrivilegeType.APP_CLIENT_DEVELOPER)}
        />

        <Checkbox
          id="write"
          name="write"
          label={<>Write</>}
          checked={formState.write.get()}
          onChange={(event) => formState.write.set(event.target.checked)}
          disabled={isFormDisabled() || currentUser.authorizedUserHasPrivilege(PrivilegeType.APP_CLIENT_DEVELOPER)}
        />
      </FormGroup>

      <FormGroup
          labelName="developer"
          labelText="Manage Developers"
          isError={failsHookstateValidation(developerAddState.email)}
          errorMessages={generateStringErrorMessages(developerAddState.email)}
        >
          <TextInput
            id="developer"
            name="developer"
            type="email"
            data-testid="app-client-developer-field"
            placeholder={"Developer Email"}
            value={developerAddState.email.get()}
            error={failsHookstateValidation(developerAddState.email)}
            onChange={(event) => developerAddState.email.set(event.target.value)}
            disabled={isFormDisabled()}
          />
        </FormGroup>

        <Button
          type="button"
          className="app-client-form__add-developer-btn"
          data-testid="app-client-developer__add-btn"
          onClick={addAppClientDeveloper}
          disabled={developerAddState.email?.get().length === 0 || ((Touched(developerAddState.email).touched() && Validation(developerAddState.email).invalid()) || isFormDisabled())}
        >
          Add Developer
        </Button>

        <ItemChooser
          columns={appClientDeveloperColumns}
          items={formState.appClientDeveloperEmails.get()?.map(r => {
            return {
              email: r
            } as DeveloperEmail
          }) ?? []}
          onRowClicked={() => { return; }}
        />

        <FormGroup
          labelName="endpoints"
          labelText="Authorized App Source Endpoints"
        >
        </FormGroup>

      <Accordion items={appSourceAccordionItems} onItemExpanded={handleAccordionExpanded}/>

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

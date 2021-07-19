import { Downgraded, none, useHookstate, useState } from "@hookstate/core";
import { Initial } from "@hookstate/initial";
import { Touched } from "@hookstate/touched";
import { Validation } from "@hookstate/validation";
import React, { ChangeEvent, FormEvent, useEffect, useMemo } from 'react';
import Accordion from '../../components/Accordion/Accordion';
import { AccordionItem } from '../../components/Accordion/AccordionItem';
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
import { PrivilegeDto } from "../../openapi/models/privilege-dto";
import { AppClientFlat } from "../../state/app-clients/app-client-flat";
import { useAppClientsState } from "../../state/app-clients/app-clients-state";
import { accessAuthorizedUserState } from '../../state/authorized-user/authorized-user-state';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { PrivilegeType } from '../../state/privilege/privilege-type';
import { failsHookstateValidation, generateStringErrorMessages, validateEmail, validateRequiredString, validateStringLength, validateSubscriberAddress, validationErrors } from '../../utils/validation-utils';
import AppSourceEndpointInfo from './AppSourceEndpointInfo';
import './AppClientPage.scss';

interface DeveloperEmail {
  email: string;
}

interface PrivilegeCell {
  priv: PrivilegeDto,
  privDisplayName: string,
}

enum PrivilegeKind {
  PERSON="person",
  ORGANIZATION="organization",
}

function getRowNodeIdForDevEmail(email: DeveloperEmail): string {
  return email.email;
}

function AppClientForm(props: CreateUpdateFormProps<AppClientFlat>) {
  const formState = useHookstate<AppClientFlat>({
    id: props.data?.id,
    name: props.data?.name || "",
    clusterUrl: props.data?.clusterUrl || "",
    allPrivs: props.data?.allPrivs ?? [],
    appClientDeveloperEmails: props.data?.appClientDeveloperEmails ?? [],
    appSourceEndpoints: props.data?.appSourceEndpoints ?? [],
  });
  const appClientService = useAppClientsState();
  const expandedAppSource = useState<string | null>(null);
  const currentUser = accessAuthorizedUserState();
  const developerAddState = useHookstate({ email: '' });

  // state of person and org's EDIT checkbox
  // either of which true will make its fields checkboxs disabled/not visible respectively
  const editPrivState = useHookstate({ person: false, organization: false}); 

  // load initial state of the create and edit checkboxes so we know how to disable/hide
  useEffect(() => {
    editPrivState.set({ 
      person: formState.allPrivs?.value?.map(item => item.name).includes('PERSON_EDIT') ?? false,
      organization: formState.allPrivs?.value?.map(item => item.name).includes('ORGANIZATION_EDIT') ?? false
    });
  }, []);

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

  // if the app client record hasn't resolved or we haven't gotten available app privs yet, then no point continuing
  if (formState.promised) return <></>;
  if (appClientService.privilegesState.promised) return <></>;

  developerAddState.attach(Validation);
  developerAddState.attach(Initial);
  developerAddState.attach(Touched);

  Validation(developerAddState.email).validate(email => validateEmail(email), validationErrors.invalidEmail, 'error');
  Validation(developerAddState.email).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');
  Validation(developerAddState.email).validate(email => !formState.appClientDeveloperEmails.ornull?.get().find(item => item.toLowerCase() === email.toLowerCase()), 'Developer already exists with that email', 'error');

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  Validation(formState.clusterUrl).validate(url => validateSubscriberAddress(url), 'Invalid Client App URL Format', 'error');
  Validation(formState.name).validate(name => validateRequiredString(name), validationErrors.requiredText, 'error');
  Validation(formState.name).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  function isFormModified(): boolean {
    return Initial(formState.name).modified()
            || Initial(formState.allPrivs).modified()
            || Initial(formState.appClientDeveloperEmails).modified()
            || Initial(formState.clusterUrl).modified();
  }

  function isFormDisabled(): boolean {
    return props.successAction?.success ?? false;
  }

  function submitForm(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    props.onSubmit(formState.get());
  }

  function deleteAppClientDeveloper(deleteItem: DeveloperEmail): void {
    formState.appClientDeveloperEmails.ornull?.find(email => deleteItem.email === email.value)?.set(none);
  }

  function addAppClientDeveloper(): void {
    formState.appClientDeveloperEmails.ornull?.merge([developerAddState.email.get()]);
    developerAddState.email.set('');
  }

  function createNameErrors(): string[] {
    const errors: string[] = Validation(formState.name).errors().map(validationError => validationError.message);
    const serverNameValid = props.formErrors?.validation?.name;
    return serverNameValid ? errors.concat([serverNameValid]) : errors;
  }

  function handleAccordionExpanded(itemId: string | null): void {
    expandedAppSource.set(itemId);
  }

  /**
   * Gets the full PrivilegeDto Object for a given privileges string name
   * @param priv the name of the Privilege
   * @returns its Dto object
   */
  function getPrivObjectFromName(priv: string): PrivilegeDto | undefined {
    return appClientService.privilegesState.attach(Downgraded).get().find(item => item.name === priv);
  }

  /**
   * Helper to say whether to show the field of edit field checkboxes for person or org
   * @param kind  "person" or "org"
   * @returns true or false
   */
  function showEditFieldPane(kind: PrivilegeKind): boolean {
    // we say true if the CREATE priv is checked, or the EDIT checkbox is unchecked
    return editPrivState.get()[kind];
  }

  /**
   * Handles a privilege checkbox toggle state.  Handles the logic of disabling/enabling
   * others as appropriate, adds/removes the respective privilege to the form state's allPrivs field
   * @param event the form event
   * @param kind  "person" or "organization"
   */
  function togglePriv(event: ChangeEvent<HTMLInputElement>, kind: PrivilegeKind): void {
    if (event.target.checked) {
      if (!formState.allPrivs.value?.map(item => item.name).includes(event.target.id)) {
        const priv = getPrivObjectFromName(event.target.id);
        if (priv !== undefined) {
          if (priv.name.match(new RegExp(kind.toUpperCase() + '_EDIT'))) {
            editPrivState.merge({
              [kind]: true
            });
          }

          formState.allPrivs.ornull?.merge([priv]);
        }
      }
    }
    else {
      if (event.target.id.match(new RegExp(kind.toUpperCase() + '_EDIT'))) {
        editPrivState.merge({
          [kind]: false
        });
      }

      formState.allPrivs.ornull?.find(item => item.name.value === event.target.id)?.set(none);
    }
  }

  /**
   * Determines if the Entity Field Authorization checkboxes
   * should be disabled.
   * @returns true if should be disabled, false
   */
  function isEfaCheckboxesDisabled(): boolean {
    return isFormDisabled() || !currentUser.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN);
  }

  /**
   * Builds the Person and Organization privilege forms
   * @param kind either "person" or "organization"
   * @returns React Element containing the form
   */
  function buildPrivForm(kind: PrivilegeKind) {
    const crudLevelPrivs : PrivilegeCell[] = [];
    const fieldLevelPrivs : PrivilegeCell[]  = [];
    appClientService.privilegesState
      .get()
      .filter((priv : PrivilegeDto) => priv.name.toLowerCase().startsWith(kind))
      .forEach((priv : PrivilegeDto) => {
        const regex = new RegExp(kind + "[_|-]", 'i');
        const privDisplayName = priv.name.replace(regex, '');
        if (privDisplayName.match(/^CREATE$|^EDIT$|^DELETE$|^READ$/)) {
          crudLevelPrivs.push({ priv, privDisplayName });
        }   
        else {
          fieldLevelPrivs.push({ priv, privDisplayName });
        }
      });

    return (
      <div>
        <div className='crud-level-checkboxes' data-testid={kind + '-privileges'}>
        {
          crudLevelPrivs.map(item =>
            <div key={item.priv.name} className='crud-level-checkbox'>
              <Checkbox
                id={item.priv.name}
                name={item.priv.name}
                data-testid={item.priv.name}
                key={item.priv.name}
                label={item.privDisplayName}
                checked={formState.allPrivs.value?.find(priv => priv.name === item.priv.name) !== undefined}
                onChange={(event) => togglePriv(event, kind)}
                disabled={isEfaCheckboxesDisabled()}
              />
            </div>
          )
        }
        </div>
        <div data-testid={kind + '-edit-form'} style={{ display: showEditFieldPane(kind) ? 'block' : 'none' }}>
          <FormGroup
            labelName={kind + "Fields"}
            labelText={kind.substr(0, 1).toUpperCase() + kind.substr(1) + " Fields"}
          >
            <div className='field-level-privs'>
            {
              fieldLevelPrivs.map(item =>
                <div key={item.priv.name} className='crud-level-checkbox'>
                  <Checkbox
                    id={item.priv.name}
                    name={item.priv.name}                
                    data-testid={item.priv.name}      
                    key={item.priv.name}
                    label={item.privDisplayName}
                    checked={formState.allPrivs.value?.find(priv => priv.name === item.priv.name) !== undefined}
                    onChange={(event) => togglePriv(event, kind)}
                    disabled={isEfaCheckboxesDisabled()}
                  />
                </div>
              )
            }
            </div>
          </FormGroup>      
        </div>  
      </div>
    )
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
          disabled={isFormDisabled() || !currentUser.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN)}
        />
      </FormGroup>

      <FormGroup
        labelName="url"
        labelText="Cluster URL"
        isError={failsHookstateValidation(formState.clusterUrl)}
        errorMessages={generateStringErrorMessages(formState.clusterUrl)}
      >
        <br/>
        <p>
          The App Client URL is the url of your application in the cluster. The URI must be of an in-cluster, fully-qualified-domain-name (FQDN) format.
          The format is <em>http://app-name.app-namespace.svc.cluster.local/</em>, so an example would be&nbsp;
          <em>http://coolapp.coolapp.svc.cluster.local/</em>.  <br/><br/>The trailing slash is mandatory, and URL must <em>not</em> be https.
        </p>
        <TextInput
          id="url"
          name="url"
          type="text"
          readOnly={!currentUser.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN)}
          defaultValue={formState.clusterUrl.get()}
          error={failsHookstateValidation(formState.clusterUrl)}
          onChange={(event) => formState.clusterUrl.set(event.target.value)}
          disabled={isFormDisabled() || !currentUser.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN)}
        />
      </FormGroup>

      <div className='accordian-top-spacer'>
        <Accordion
          className="app-source-access"
          items={[{
              title: 'Person Entity Permissions',
              content: buildPrivForm(PrivilegeKind.PERSON),
              id: 'person-accordian'
          }]}
        />
      </div>

      <Accordion
        className="app-source-access"
        items={[{
            title: 'Organization Entity Permissions',
            content: buildPrivForm(PrivilegeKind.ORGANIZATION),
            id: 'org-accordian'
        }]}
      />

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
        items={[
          ...formState.appClientDeveloperEmails.attach(Downgraded).get()?.map(r => {
            return {
              email: r
            } as DeveloperEmail
          }) ?? []
        ]}
        onRowClicked={() => { return; }}
        immutableData
        getRowNodeId={getRowNodeIdForDevEmail}
      />

      {appSourceAccordionItems.length > 0 &&
        <FormGroup
          labelName="endpoints"
          labelText="Authorized App Source Endpoints"
        >
          <Accordion
            className="app-source-access"
            items={appSourceAccordionItems} onItemExpanded={handleAccordionExpanded}
          />
        </FormGroup>
      }

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

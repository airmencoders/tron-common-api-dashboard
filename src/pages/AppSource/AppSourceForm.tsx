import React, { FormEvent } from 'react';
import { none, State, useHookstate } from "@hookstate/core";
import { Validation } from "@hookstate/validation";
import { Initial } from "@hookstate/initial";
import { Touched } from "@hookstate/touched";
import Form from "../../components/forms/Form/Form";
import TextInput from "../../components/forms/TextInput/TextInput";
import { CreateUpdateFormProps } from '../../components/DataCrudFormPage/CreateUpdateFormProps';
import { FormActionType } from '../../state/crud-page/form-action-type';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import './AppSourceForm.scss';
import { AppEndpointDto, AppSourceDetailsDto } from '../../openapi';
import ItemChooser from '../../components/ItemChooser/ItemChooser';
import GridColumn from '../../components/Grid/GridColumn';
import Button from '../../components/Button/Button';
import DeleteCellRenderer from '../../components/DeleteCellRenderer/DeleteCellRenderer';
import { validateEmail } from '../../utils/validation-utils';
import { RowClickedEvent } from 'ag-grid-community';
import Modal from '../../components/Modal/Modal';
import ModalTitle from '../../components/Modal/ModalTitle';
import ModalFooterSubmit from '../../components/Modal/ModalFooterSubmit';
import AppSourceEndpointEditor from './AppSourceEndpointEditor';

interface AdminEmail {
  email: string;
}

interface EndpointModalState {
  isOpen: boolean;
  selected?: State<AppEndpointDto>;
}

function AppSourceForm(props: CreateUpdateFormProps<AppSourceDetailsDto>) {
  const formState = useHookstate({
    id: props.data?.id ?? '',
    name: props.data?.name ?? '',
    appClients: props.data?.appClients ?? [],
    appSourceAdminUserEmails: props.data?.appSourceAdminUserEmails ?? [],
    endpoints: props.data?.endpoints ?? []
  });

  const adminAddState = useHookstate({
    email: ''
  });

  const endpointModifyState = useHookstate<EndpointModalState>({
    isOpen: false,
    selected: undefined
  });

  adminAddState.attach(Validation);
  adminAddState.attach(Initial);
  adminAddState.attach(Touched);

  Validation(adminAddState.email).validate(email => validateEmail(email), 'enter valid email', 'error');

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  Validation(formState.name).validate(name => name.length > 0 && name.trim().length > 0, 'cannot be empty or blank.', 'error');

  function isFormModified() {
    return Initial(formState.appSourceAdminUserEmails).modified() ||
      Initial(formState.name).modified() ||
      Initial(formState.endpoints).modified() ||
      Initial(formState.appClients).modified();
  }

  function isFormDisabled() {
    return props.successAction?.success || props.isSubmitting;
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.onSubmit(formState.get());
  }

  function deleteAppSourceAdmin(deleteItem: AdminEmail) {
    formState.appSourceAdminUserEmails.find(email => email.get() === deleteItem.email)?.set(none);
  }

  function addAppSourceAdmin() {
    formState.appSourceAdminUserEmails[formState.appSourceAdminUserEmails.length].set(adminAddState.email.get());
    adminAddState.email.set('');
  }

  const deleteBtnName = 'Delete';
  const appSourceAdminColumns: GridColumn[] = [
    new GridColumn({
      field: 'email',
      sortable: true,
      filter: true,
      headerName: 'Admin',
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
    appSourceAdminColumns.push(
      new GridColumn({
        headerName: deleteBtnName,
        headerClass: 'header-center',
        cellRenderer: DeleteCellRenderer,
        cellRendererParams: { onClick: deleteAppSourceAdmin }
      })
    );
  }

  const appSourceEndpointColumns: GridColumn[] = [
    new GridColumn({
      field: 'path',
      sortable: true,
      filter: true,
      headerName: 'Path',
      resizable: true
    }),
    new GridColumn({
      field: 'requestType',
      sortable: true,
      filter: true,
      headerName: 'Request Type',
      resizable: true
    })
  ];

  function onEndpointRowClicked(event: RowClickedEvent) {
    /**
     * Prevent anymore interactions with the grid
     * after a successful submit.
     * 
     * Removes on click interactions.
     */
    if (isFormDisabled()) {
      return;
    }

    const rowData: AppEndpointDto = event.data;

    const stateData = formState.endpoints?.find(endpoint => endpoint.get().path === rowData.path && endpoint.get().requestType === rowData.requestType);

    endpointModifyState.merge({
      isOpen: true,
      selected: stateData
    });
  }

  function endpointModalClose() {
    endpointModifyState.merge({
      isOpen: false,
      selected: undefined
    });
  }

  const endpointModalOpen = endpointModifyState.isOpen.get();
  const endpointSelectedData = endpointModifyState.selected.get();

  return (
    <>
      <Form className="app-source-form" onSubmit={(event) => submitForm(event)} data-testid="app-source-form">
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
          isError={Touched(formState.name).touched() && Validation(formState.name).invalid()}
          errorMessages={Validation(formState.name).errors()
            .map(validationError => validationError.message)}
        >
          <TextInput
            id="name"
            name="name"
            type="text"
            defaultValue={formState.name.get()}
            error={Touched(formState.name).touched() && Validation(formState.name).invalid()}
            onChange={(event) => formState.name.set(event.target.value)}
            disabled={isFormDisabled()}
          />
        </FormGroup>

        <FormGroup
          labelName="admin"
          labelText="Admins"
          isError={Touched(adminAddState.email).touched() && Validation(adminAddState.email).invalid() && adminAddState.email.get().trim().length > 0}
          errorMessages={Validation(adminAddState.email).errors()
            .map(validationError => validationError.message)}
        >
          <TextInput
            id="admin"
            name="admin"
            type="email"
            placeholder={"Admin Email"}
            value={adminAddState.email.get()}
            error={Touched(adminAddState.email).touched() && Validation(adminAddState.email).invalid() && adminAddState.email.get().trim().length > 0}
            onChange={(event) => adminAddState.email.set(event.target.value)}
            disabled={isFormDisabled()}
          />
        </FormGroup>

        <Button
          type="button"
          className="app-source-form__add-admin-btn"
          onClick={addAppSourceAdmin}
          disabled={adminAddState.email.get().length === 0 || Touched(adminAddState.email).touched() && Validation(adminAddState.email).invalid() || isFormDisabled()}
        >
          Add Admin
        </Button>

        <ItemChooser
          columns={appSourceAdminColumns}
          items={formState.appSourceAdminUserEmails.get()?.map(r => {
            return {
              email: r
            } as AdminEmail
          })}
          onRowClicked={() => { return; }}
        />

        <FormGroup
          labelName="endpoints"
          labelText="Endpoints"
        >
        </FormGroup>

        <ItemChooser
          columns={appSourceEndpointColumns}
          items={formState.endpoints.get()}
          onRowClicked={onEndpointRowClicked}
        />

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

      <Modal
        headerComponent={<ModalTitle title="Endpoint Editor" />}
        footerComponent={<ModalFooterSubmit
          hideCancel
          onSubmit={endpointModalClose}
          submitText="Done"
        />}
        show={endpointModalOpen && endpointSelectedData != null}
        onHide={endpointModalClose}
        height="auto"
        width="auto"
        className={"endpoint-editor-modal"}
      >
        {endpointSelectedData &&
          <AppSourceEndpointEditor
            appClientPrivileges={formState.appClients}
            endpoint={endpointSelectedData}
          />
        }

      </Modal>
    </>
  );
}

export default AppSourceForm;

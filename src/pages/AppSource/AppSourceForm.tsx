import { none, useHookstate } from '@hookstate/core';
import { Initial } from '@hookstate/initial';
import { Touched } from '@hookstate/touched';
import { Validation } from '@hookstate/validation';
import { RowClickedEvent } from 'ag-grid-community';
import React, { FormEvent } from 'react';
import Button from '../../components/Button/Button';
import { CreateUpdateFormProps } from '../../components/DataCrudFormPage/CreateUpdateFormProps';
import DeleteCellRenderer from '../../components/DeleteCellRenderer/DeleteCellRenderer';
import Form from '../../components/forms/Form/Form';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import TextInput from '../../components/forms/TextInput/TextInput';
import GridColumn from '../../components/Grid/GridColumn';
import ItemChooser from '../../components/ItemChooser/ItemChooser';
import Modal from '../../components/Modal/Modal';
import ModalFooterSubmit from '../../components/Modal/ModalFooterSubmit';
import ModalTitle from '../../components/Modal/ModalTitle';
import UnusedEndpointCellRenderer from '../../components/UnusedEndpointCellRenderer/UnusedEndpointCellRenderer';
import { AppEndpointDto, AppSourceDetailsDto } from '../../openapi';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { failsHookstateValidation, generateStringErrorMessages, validateEmail, validateRequiredString, validateStringLength, validationErrors } from '../../utils/validation-utils';
import AppSourceEndpointEditor from './AppSourceEndpointEditor';
import './AppSourceForm.scss';

interface AdminEmail {
  email: string;
}

interface EndpointModalState {
  isOpen: boolean;
  bulkSelected: AppEndpointDto[];
  // Allows for row click single editing
  singleSelected: AppEndpointDto[];
}

interface DeleteEndpointModalState {
  isOpen: boolean;
  selected?: AppEndpointDto;
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
    bulkSelected: [],
    singleSelected: []
  });

  const deleteEndpointModifyState = useHookstate<DeleteEndpointModalState>({
    isOpen: false,
    selected: undefined
  });

  adminAddState.attach(Validation);
  adminAddState.attach(Initial);
  adminAddState.attach(Touched);

  Validation(adminAddState.email).validate(email => validateEmail(email), validationErrors.invalidEmail, 'error');
  Validation(adminAddState.email).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  Validation(formState.name).validate(name => (validateRequiredString(name)), validationErrors.requiredText, 'error');
  Validation(formState.name).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

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
      resizable: true,
      cellRenderer: UnusedEndpointCellRenderer,
      cellRendererParams: { onClick: onDeleteEndpointClicked },
      checkboxSelection: true,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true
    }),
    new GridColumn({
      field: 'requestType',
      sortable: true,
      filter: true,
      headerName: 'Request Type',
      resizable: true
    })
  ];

  function onDeleteEndpointClicked(endpoint: AppEndpointDto): void {
    /**
     * Prevent anymore interactions with the grid
     * after a successful submit.
     * 
     * Removes on click interactions.
     */
    if (isFormDisabled()) {
      return;
    }

    deleteEndpointModifyState.merge({
      isOpen: true,
      selected: endpoint
    })
  }

  function onEndpointRowClicked(event: RowClickedEvent) {
    /**
     * Prevent anymore interactions with the grid
     * after a successful submit.
     * 
     * Removes on click interactions.
     */
    if (isFormDisabled() || deleteEndpointModifyState.isOpen.get()) {
      return;
    }

    const rowData: AppEndpointDto = event.data;

    endpointModifyState.singleSelected[endpointModifyState.singleSelected.length].set(rowData);
    endpointModifyState.isOpen.set(true);
  }

  function onEndpointEditBtnClicked() {
    endpointModifyState.isOpen.set(true);
  }

  function onRowSelected(data: AppEndpointDto, selectionEvent: 'selected' | 'unselected') {
    if (selectionEvent === 'selected') {
      endpointModifyState.bulkSelected[endpointModifyState.bulkSelected.length].set(data);
    } else {
      endpointModifyState.bulkSelected.find(endpoint => endpoint.id.get() === data.id)?.set(none);
    }
  }

  function endpointModalClose() {
    endpointModifyState.merge({
      isOpen: false,
      // Always reset a singly selected item
      singleSelected: []
    });
  }

  function deleteEndpointModalClose(): void {
    deleteEndpointModifyState.merge({
      isOpen: false,
      selected: undefined
    });
  }

  const endpointModalOpen = endpointModifyState.isOpen.get();
  const deleteEndpointModalOpen = deleteEndpointModifyState.isOpen.get();
  const endpointSelectedData = endpointModifyState.singleSelected.length > 0 ? endpointModifyState.singleSelected : endpointModifyState.bulkSelected;
  const deleteEndpointSelectedData = deleteEndpointModifyState.selected.get();

  function deleteEndpoint(): void {
    const toDeleteId = deleteEndpointSelectedData!.id;
    formState.merge({
      appClients: formState.appClients.get()?.filter(client => client.appEndpoint !== toDeleteId),
      endpoints: formState.endpoints.get()?.filter(endpoint => endpoint.id !== toDeleteId)
    })
    deleteEndpointModalClose();
  }

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
          isError={failsHookstateValidation(formState.name)}
          errorMessages={generateStringErrorMessages(formState.name)}
          required
        >
          <TextInput
            id="name"
            name="name"
            type="text"
            defaultValue={formState.name.get()}
            error={failsHookstateValidation(formState.name)}
            onChange={(event) => formState.name.set(event.target.value)}
            disabled={isFormDisabled()}
          />
        </FormGroup>

        <FormGroup
          labelName="gateway-path"
          labelText="Path"
          isError={false}
        >
          <TextInput
            id="gateway-path"
            name="gateway-path"
            type="text"
            defaultValue={props.data?.appSourcePath}
            disabled={true}
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
          suppressRowClickSelection
          rowSelection={'multiple'}
          showEditBtn
          disableEditBtn={endpointModifyState.bulkSelected.length === 0}
          onEditBtnClick={onEndpointEditBtnClicked}
          onRowSelected={onRowSelected}
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
        show={endpointModalOpen && endpointSelectedData.length > 0}
        onHide={endpointModalClose}
        height="auto"
        width="auto"
        className={"endpoint-editor-modal"}
      >
        {endpointSelectedData.length > 0 &&
          <AppSourceEndpointEditor
            appClientPrivileges={formState.appClients}
            selectedEndpoints={endpointSelectedData}
            appSourceId={formState.id}
          />
        }

      </Modal>

      <Modal
        headerComponent={<ModalTitle title="Delete Confirmation" />}
        footerComponent={<ModalFooterSubmit
          onCancel={deleteEndpointModalClose}
          onSubmit={deleteEndpoint}
          submitText="Delete"
        />}
        show={deleteEndpointModalOpen}
        onHide={deleteEndpointModalClose}
        height="auto"
        width="auto"
        className={"delete-endpoint-modal"}
      >
        Warning: Permanently deleting this endpoint {deleteEndpointSelectedData && ("(" + deleteEndpointSelectedData?.path + ")")} will cause the loss of all metrics associated with it.
      </Modal>
    </>
  );
}

export default AppSourceForm;

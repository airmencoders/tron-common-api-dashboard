import { Downgraded, none, useHookstate } from '@hookstate/core';
import { Initial } from '@hookstate/initial';
import { Touched } from '@hookstate/touched';
import { Validation } from '@hookstate/validation';
import { RowClickedEvent } from 'ag-grid-community';
import React, { ChangeEvent, FormEvent } from 'react';
import Button from '../../components/Button/Button';
import { CreateUpdateFormProps } from '../../components/DataCrudFormPage/CreateUpdateFormProps';
import DeleteCellRenderer from '../../components/DeleteCellRenderer/DeleteCellRenderer';
import Checkbox from '../../components/forms/Checkbox/Checkbox';
import Form from '../../components/forms/Form/Form';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import TextInput from '../../components/forms/TextInput/TextInput';
import TextInputInline from "../../components/forms/TextInput/TextInputInline";
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
import CopyToClipboard from '../../components/CopyToClipboard/CopyToClipboard';

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

function getAppSourceEndpointId(data: AppEndpointDto): string {
  return data.id ?? '';
}

function AppSourceForm(props: CreateUpdateFormProps<AppSourceDetailsDto>) {
  const formState = useHookstate({
    id: props.data?.id ?? '',
    name: props.data?.name ?? '',
    reportStatus: props.data?.reportStatus ?? false,
    healthUrl: props.data?.healthUrl ?? '',
    appClients: props.data?.appClients ?? [],
    appSourceAdminUserEmails: props.data?.appSourceAdminUserEmails ?? [],
    endpoints: props.data?.endpoints ?? [],
    throttleRequestCount: props.data?.throttleRequestCount,
    throttleEnabled: props.data?.throttleEnabled
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
  Validation(formState.healthUrl).validate(value => !formState.reportStatus.value || (/[^\s]+/.test(value) || value.trim() !== ''), 'Health endpoint required when status reporting enabled', 'error');
  Validation(formState.healthUrl).validate(value => value.match(/^\//) !== null || value === '', 'Valid path must start with a forward slash', 'error');

  function isFormModified() {
    return Initial(formState.appSourceAdminUserEmails).modified() ||
      Initial(formState.name).modified() ||
      Initial(formState.reportStatus).modified() ||
      Initial(formState.healthUrl).modified() ||
      Initial(formState.endpoints).modified() ||
      Initial(formState.appClients).modified() ||
      Initial(formState.throttleEnabled).modified() ||
      Initial(formState.throttleRequestCount).modified();
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
    }),
    // new GridColumn({
    //   field: 'action',
    //   sortable: false,
    //   filter: false,
    //   headerName: '',
    //   resizable: false,
    //   pinned: 'right',
    //   initialWidth: 45
    // })
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
    const toDeleteId = deleteEndpointSelectedData?.id;

    if (toDeleteId != null) {
      /**
       * Deletes all authorized App Clients belonging to this Endpoint.
       * An Endpoint can have multiple authorized App Clients.
       * Find all of them and remove them.
       */
      const appClientsLength = formState.appClients.length;
      for (let i = appClientsLength - 1; i >= 0; i--) {
        const appClientPrivilege = formState.appClients[i];
        if (appClientPrivilege.appEndpoint.get() === toDeleteId) {
          appClientPrivilege.set(none);
        }
      }

      // Remove the actual endpoint
      formState.endpoints.find(endpoint => endpoint.id.get() === toDeleteId)?.set(none);
    }

    deleteEndpointModalClose();
  }

  function onRateLimitChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.value === '') {
      formState.throttleRequestCount.set(undefined);
      return;
    }

    const num = Number(event.target.value);

    if (!Number.isNaN(num) && Number.isSafeInteger(num)) {
      formState.throttleRequestCount.set(num);
    }
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
            <TextInputInline
              id="uuid"
              name="uuid"
              type="text"
              defaultValue={formState.id.get()}
              disabled={true}
              className={'tron-text-input-inline'}
            />
            <CopyToClipboard text={String(formState.id.get())} />
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
          labelName="report-status"
          labelText="App Source Status Reporting"
          isError={false}
        >
          <Checkbox
            id="report-status"
            name="report-status"
            data-testid="report-status"
            checked={formState.reportStatus.value}
            label="Report Status to Health Page"
            onChange={(event) => formState.reportStatus.set(event.target.checked)}
          />
        </FormGroup>
        <FormGroup
          labelName="health-url"
          labelText="Health URL Path/Endpoint (GET)"
          isError={!Validation(formState.healthUrl).valid()}
          errorMessages={generateStringErrorMessages(formState.healthUrl)}
        >
          <TextInput
            id="health-url"
            name="health-url"
            type="text"
            error={!Validation(formState.healthUrl).valid()}
            defaultValue={formState.healthUrl.value}
            onChange={(event) => formState.healthUrl.set(event.target.value)}
            disabled={!formState.reportStatus.value}
          />
        </FormGroup>

        <FormGroup
          labelName="admin"
          labelText="Admins"
          isError={Touched(adminAddState.email).touched() && Validation(adminAddState.email).invalid() && adminAddState.email.get().trim().length > 0}
          errorMessages={Validation(adminAddState.email).errors()
            .map(validationError => validationError.message)}
          className="app-source-form__admins-form-group"
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
          className="admin-email-grid"
        />

        <FormGroup
          labelName="rate-limit-toggle"
          labelText="Rate Limit Toggle"
        >
          <Checkbox
            id="rate-limit-toggle"
            name="rate-limit-toggle"
            checked={formState.throttleEnabled.value}
            label="Enable Rate Limiting"
            onChange={(event) => formState.throttleEnabled.set(event.target.checked)}
          />
        </FormGroup>

        <FormGroup
          labelName="rate-limit-count"
          labelText="Rate Limit"
          isError={failsHookstateValidation(formState.throttleRequestCount)}
          errorMessages={generateStringErrorMessages(formState.throttleRequestCount)}
        >
          <TextInput
            id="rate-limit-count"
            name="rate-limit-count"
            type="text"
            value={formState.throttleRequestCount.ornull?.get() ?? ''}
            error={failsHookstateValidation(formState.throttleRequestCount)}
            placeholder="0"
            onChange={onRateLimitChange}
            appendedText="Requests / minute"
            disabled={!formState.throttleEnabled.value}
          />
        </FormGroup>

        <FormGroup
          labelName="endpoints"
          labelText="Endpoints"
        >
          <ItemChooser
            columns={appSourceEndpointColumns}
            items={[...formState.endpoints.attach(Downgraded).get()]}
            onRowClicked={onEndpointRowClicked}
            suppressRowClickSelection
            rowSelection="multiple"
            showEditBtn
            disableEditBtn={endpointModifyState.bulkSelected.length === 0}
            onEditBtnClick={onEndpointEditBtnClicked}
            onRowSelected={onRowSelected}
            className="endpoint-grid"
            immutableData
            getRowNodeId={getAppSourceEndpointId}
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

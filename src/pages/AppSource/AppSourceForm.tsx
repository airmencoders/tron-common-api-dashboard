import React, { FormEvent } from 'react';
import { none, useHookstate } from "@hookstate/core";
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
import Modal from '../../components/Modal/Modal';
import ModalTitle from '../../components/Modal/ModalTitle';
import ModalFooterSubmit from '../../components/Modal/ModalFooterSubmit';
import GridColumn from '../../components/Grid/GridColumn';
import { AppSourceDetailsFlat } from '../../state/app-source/app-source-details-flat';
import { RowClickedEvent } from 'ag-grid-community';
import PrivilegeCellRenderer from '../../components/PrivilegeCellRenderer/PrivilegeCellRenderer';
import { AppClientUserPrivFlat } from '../../state/app-source/app-client-user-priv-flat';
import AppSourceClientForm from './AppSourceClientForm';
import AppSourceClientAdd from './AppSourceClientAdd';
import Button from '../../components/Button/Button';
import DeleteCellRenderer from '../../components/DeleteCellRenderer/DeleteCellRenderer';
import './AppSourceForm.scss';
import ItemChooser from '../../components/ItemChooser/ItemChooser';

interface AppSourceEditorState {
  isOpen: boolean;
  data: AppClientUserPrivFlat;
}

function AppSourceForm(props: CreateUpdateFormProps<AppSourceDetailsFlat>) {
  const formState = useHookstate<AppSourceDetailsFlat>({
    id: props.data?.id ?? "",
    name: props.data?.name ?? "",
    appClients: props.data?.appClients ?? []
  });

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  const clientEditorState = useHookstate<AppSourceEditorState>({
    isOpen: false,
    data: {
      appClientUser: '',
      appClientUserName: '',
      read: false,
      write: false
    }
  });

  const clientAddState = useHookstate({
    isOpen: false,
  });

  Validation(formState.name).validate(name => name.length > 0 && name.trim().length > 0, 'cannot be empty or blank.', 'error');

  function isFormModified() {
    return Initial(formState.name).modified() || Initial(formState.appClients).modified();
  }

  function isFormDisabled() {
    return props.successAction?.success;
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.onSubmit(formState.get());
  }

  const deleteBtnName = 'Delete';
  const appClientColumns: GridColumn[] = [
    new GridColumn('appClientUserName', true, true, 'Name'),
    new GridColumn('read', true, false, 'Read', 'header-center', PrivilegeCellRenderer),
    new GridColumn('write', true, false, 'Write', 'header-center', PrivilegeCellRenderer),
    new GridColumn('', false, false, deleteBtnName, 'header-center', DeleteCellRenderer, { onClick: removeClient })
  ];

  function removeClient(data: AppClientUserPrivFlat) {
    formState.appClients.find(item => item.appClientUser.get() === data.appClientUser)?.set(none);
  }

  function onRowClicked(event: RowClickedEvent) {
    // Don't trigger row clicked if delete cell clicked
    if ((event.api.getFocusedCell()?.column.getColDef().headerName === deleteBtnName))
      return;

    clientEditorState.merge({
      isOpen: true,
      data: event.data
    });
  }

  function clientEditorCloseHandler() {
    clientEditorState.merge({
      isOpen: false
    });
  }

  function clientEditorSubmitModal() {
    clientEditorCloseHandler();
  }

  function clientAddCloseHandler() {
    clientAddState.merge({
      isOpen: false
    });
  }

  function clientAddSubmitModal() {
    clientAddCloseHandler();
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
          labelName="authorized-clients"
          labelText="Authorized Clients"
        >
          <Button type='button' className="app-source-form__add-client-btn" onClick={() => clientAddState.isOpen.set(true)}>
            Add Client
          </Button>

          <ItemChooser
            items={formState.appClients.get() || []}
            columns={appClientColumns}
            onRowClicked={onRowClicked}
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
        headerComponent={<ModalTitle title="Client Editor" />}
        footerComponent={<ModalFooterSubmit
          hideCancel
          onSubmit={clientEditorSubmitModal}
          submitText="Done"
        />}
        show={clientEditorState.isOpen.get()}
        onHide={clientEditorCloseHandler}
        width="auto"
        height="auto"
      >
        <AppSourceClientForm data={clientEditorState.data} />
      </Modal>

      <Modal
        headerComponent={<ModalTitle title="Add Client Editor" />}
        footerComponent={<ModalFooterSubmit
          hideCancel
          onSubmit={clientAddSubmitModal}
          submitText="Done"
        />}
        show={clientAddState.isOpen.get()}
        onHide={clientAddCloseHandler}
        width="auto"
        height="90vh"
      >
        <AppSourceClientAdd data={formState.appClients} />
      </Modal>
    </>
  );
}

export default AppSourceForm;

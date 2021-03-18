import React, { FormEvent } from 'react';
import { Downgraded, useState } from "@hookstate/core";
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
import Grid from '../../components/Grid/Grid';
import Modal from '../../components/Modal/Modal';
import ModalTitle from '../../components/Modal/ModalTitle';
import ModalFooterSubmit from '../../components/Modal/ModalFooterSubmit';
import GridColumn from '../../components/Grid/GridColumn';
import { AppSourceDetailsFlat } from '../../state/app-source/app-source-details-flat';
import { RowClickedEvent } from 'ag-grid-community';

function AppSourceForm(props: CreateUpdateFormProps<AppSourceDetailsFlat>) {
  const formState = useState<AppSourceDetailsFlat>({
    id: props.data?.id ?? "",
    name: props.data?.name ?? "",
    appClients: props.data?.appClients ?? []
  });

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

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

  const appClientColumns: GridColumn[] = [
    new GridColumn('appClientUser', true, true, 'Name'),
    new GridColumn('read', true, true, 'Read'),
    new GridColumn('write', true, true, 'Write')
  ];

  async function onRowClicked(event: RowClickedEvent): Promise<void> {
    console.log(event.data);
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
          labelName="permissions"
          labelText="Permissions"
        >
          <Grid
            data={formState.appClients.get() || []}
            columns={appClientColumns}
            onRowClicked={onRowClicked}
            rowClass="ag-grid--row-pointer"
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

      {/* <Modal
        headerComponent={<ModalTitle title="App Client" />}
        footerComponent={<ModalFooterSubmit
          onCancel={onCloseHandler}
          onSubmit={deleteSubmit}
          disableSubmit={pageState.isSubmitting.get() || pageState.successAction.get()?.success}
        />}
        show={pageState.isDeleteConfirmationOpen.get()}
        onHide={onCloseHandler}
      >
        <DeleteComponent
          data={pageState.selected.get()}
          formErrors={pageState.formErrors.get()}
          successAction={pageState.successAction.get()}
          isSubmitting={pageState.isSubmitting.get()}
        />
      </Modal> */}
    </>
  );
}

export default AppSourceForm;

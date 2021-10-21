import { useHookstate } from '@hookstate/core';
import { Initial } from '@hookstate/initial';
import { Touched } from '@hookstate/touched';
import { Validation } from '@hookstate/validation';
import React, { FormEvent } from 'react';
import Form from '../../components/forms/Form/Form';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import TextInput from '../../components/forms/TextInput/TextInput';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { validateFolderName } from '../../utils/validation-utils';

export interface DocumentSpaceCreateEditFolderFormProps {
  folderName?: string;
  onSubmit: (dto: string) => void;
  onCancel: () => void;
  isFormSubmitting: boolean;
  formActionType: FormActionType;
  errorMessage?: string;
  showErrorMessage?: boolean;
  onCloseErrorMsg: () => void;
}

export default function DocumentSpaceCreateEditFolderForm(props: DocumentSpaceCreateEditFolderFormProps) {
  const formState = useHookstate<string>(props.folderName ?? '');

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  Validation(formState).validate(
    (name) => validateFolderName(name ?? ''),
    'Invalid Folder Name',
    'error'
  );

  function isFormModified(): boolean {
    return Initial(formState).modified();
  }

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (props.formActionType === FormActionType.ADD) {
      props.onSubmit(formState.get());
    }
  };

  return (
    <Form onSubmit={submitForm}>
      <FormGroup
        labelName="folder-name"
        labelText={props.formActionType === FormActionType.ADD ? 'New Folder Name' : 'Rename Folder'}
        isError={!Validation(formState).valid()}
        errorMessages={Validation(formState)
          .errors()
          .map((validationError) => validationError.message)}
      >
        <TextInput
          id="folder-name__input"
          name="folder-name__input"
          data-testid="foldername-name-field"
          type="text"
          onChange={(event) => formState.set(event.target.value)}
          defaultValue={formState.get() ?? ''}
        />
        <SuccessErrorMessage
          errorMessage={props?.errorMessage ?? ''}
          showErrorMessage={props?.showErrorMessage ?? false}
          showSuccessMessage={false}
          showCloseButton={true}
          onCloseClicked={props.onCloseErrorMsg}
        />
        <SubmitActions
          formActionType={FormActionType.ADD}
          onCancel={props.onCancel}
          isFormValid={Validation(formState).valid()}
          isFormModified={isFormModified()}
          isFormSubmitting={props.isFormSubmitting}
        />
      </FormGroup>
    </Form>
  );
}

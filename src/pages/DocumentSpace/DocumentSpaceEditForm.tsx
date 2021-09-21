import { useHookstate } from '@hookstate/core';
import { Initial } from '@hookstate/initial';
import { Touched } from '@hookstate/touched';
import { Validation } from '@hookstate/validation';
import React, { FormEvent } from 'react';
import Form from '../../components/forms/Form/Form';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import Label from '../../components/forms/Label/Label';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import TextInput from '../../components/forms/TextInput/TextInput';
import { DocumentSpaceInfoDto } from '../../openapi/models/document-space-info-dto';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { validateDocSpaceName } from '../../utils/validation-utils';

export interface DocumentSpaceEditFormProps {
  documentSpace?: DocumentSpaceInfoDto;
  onSubmit: (dto: DocumentSpaceInfoDto) => void;
  onCancel: () => void;
  isFormSubmitting: boolean;
  formActionType: FormActionType;
  errorMessage?: string;
  showErrorMessage?: boolean;
  onCloseErrorMsg: () => void;
}

export default function DocumentSpaceEditForm(
  props: DocumentSpaceEditFormProps
) {
  const formState = useHookstate<DocumentSpaceInfoDto>(
    props.documentSpace ?? { name: '' }
  );

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  Validation(formState.name).validate(
    (name) => validateDocSpaceName(name ?? ''),
    'Invalid Document Space Name',
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
        labelName="new-document-space"
        labelText="Document Space Details"
        isError={!Validation(formState).valid()}
        errorMessages={Validation(formState.name)
          .errors()
          .map((validationError) => validationError.message)}
      >
        <Label
          htmlFor="new-space-name__input"
          error={!Validation(formState).valid()}
        >
          Space Name
        </Label>
        <TextInput
          id="new-space-name__input"
          name="new-space-name__input"
          data-testid="new-space-name-field"
          type="text"
          onChange={(event) => formState.name.set(event.target.value)}
          defaultValue={formState.name.get() ?? ''}
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
          onSubmit={submitForm}
          isFormValid={Validation(formState).valid()}
          isFormModified={isFormModified()}
          isFormSubmitting={props.isFormSubmitting}
        />
      </FormGroup>
    </Form>
  );
}

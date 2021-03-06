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
import { DocumentSpaceRequestDto } from '../../openapi';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { validateDocSpaceName } from '../../utils/validation-utils';
import InfoNotice from '../../components/InfoNotice/InfoNotice';

export interface DocumentSpaceEditFormProps {
  documentSpace?: DocumentSpaceRequestDto;
  onSubmit: (dto: DocumentSpaceRequestDto) => void;
  onCancel: () => void;
  isFormSubmitting: boolean;
  formActionType: FormActionType;
  errorMessage?: string;
  showErrorMessage?: boolean;
  onCloseErrorMsg: () => void;
}

export default function DocumentSpaceEditForm(props: DocumentSpaceEditFormProps) {
  const formState = useHookstate<DocumentSpaceRequestDto>(
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
    <Form onSubmit={submitForm} style={{ minWidth: '100%'}}>
      <FormGroup
        labelName="new-document-space"
        labelText="Document Space Details"
        isError={!Validation(formState).valid() && Touched(formState).touched()}
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
          value={formState.name.get() ?? ''}
        />
        <br/>
        <InfoNotice type={'info'}>
          Valid Space Names:
          <ul>
            <li>Are not empty or blank</li>
            <li>Do not contain whitespace (spaces, tabs, etc)</li>
            <li>Are greater than 2 and less than 64 characters</li>
            <li>Have no uppercase letters</li>
            <li>Start and end with letter or number</li>
            <li>Cannot be an IP address</li>
            <li>Cannot contain any slashes</li>
          </ul>
        </InfoNotice>
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

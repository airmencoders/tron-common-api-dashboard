import { useHookstate } from '@hookstate/core';
import { Initial } from '@hookstate/initial';
import { Touched } from '@hookstate/touched';
import { Validation } from '@hookstate/validation';
import React, { FormEvent, useEffect } from 'react';
import Form from '../../components/forms/Form/Form';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import TextInput from '../../components/forms/TextInput/TextInput';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { CreateEditOperationType } from '../../state/document-space/document-space-utils';
import { validateFolderName } from '../../utils/validation-utils';
import InfoNotice from '../../components/InfoNotice/InfoNotice';

export interface DocumentSpaceCreateEditFormProps {
  opType: CreateEditOperationType;
  elementName?: string;
  onSubmit: (dto: string) => void;
  onCancel: () => void;
  isFormSubmitting: boolean;
  errorMessage?: string;
  showErrorMessage?: boolean;
  onCloseErrorMsg: () => void;
}

function getElementType(type: CreateEditOperationType) {
  switch (type) {
    case CreateEditOperationType.CREATE_FOLDER:
    case CreateEditOperationType.EDIT_FOLDERNAME:
      return "Folder";
    case CreateEditOperationType.EDIT_FILENAME:
      return "File";
    default:
      return "Unknown";
  }
}

export default function DocumentSpaceCreateEditForm(props: DocumentSpaceCreateEditFormProps) {
  const formState = useHookstate<string>(props.elementName ?? '');
  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  Validation(formState).validate(
    (name) => validateFolderName(name ?? ''),
    `Invalid ${getElementType(props.opType)} Name`,
    'error'
  );

  function isFormModified(): boolean {
    return Initial(formState).modified();
  }

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit(formState.get());
  };

  function resolveLabelText() {
    switch (props.opType) {
      case CreateEditOperationType.CREATE_FOLDER:
        return 'New Folder Name';
      case CreateEditOperationType.EDIT_FOLDERNAME:
        return 'Rename Folder';
      case CreateEditOperationType.EDIT_FILENAME:
        return 'Rename File';
      default:
        return 'Unknown Operation';
    }
  }

  return (
    <Form onSubmit={submitForm}>
      <FormGroup
        labelName="element-name"
        labelText={resolveLabelText()}
        isError={!Validation(formState).valid() && Touched(formState).touched()}
        errorMessages={Validation(formState)
          .errors()
          .map((validationError) => validationError.message)}
      >
        <TextInput
          id="element-name__input"
          name="element-name__input"
          data-testid="element-name-field"
          type="text"
          onChange={(event) => formState.set(event.target.value)}
          value={formState.get() ?? ''}
        />
        <br/>
        <InfoNotice type={'info'}>
          Valid folder and file names:
          <ul>
            <li>Are not empty or blank</li>
            <li>Are only alpha-numeric characters including spaces, parens, hyphens, underscores, and periods</li>
            <li>Have no spaces/whitespace before or after file extension</li>
            <li>One period (.) per name (e.g. file.txt)</li>
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
          formActionType={props.opType === CreateEditOperationType.CREATE_FOLDER 
            ? FormActionType.ADD 
            : FormActionType.UPDATE
          }
          onCancel={props.onCancel}
          isFormValid={Validation(formState).valid()}
          isFormModified={isFormModified()}
          isFormSubmitting={props.isFormSubmitting}
        />
      </FormGroup>
    </Form>
  );
}

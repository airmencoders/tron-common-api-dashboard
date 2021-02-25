import {FormActionType} from '../../../state/crud-page/form-action-type';
import {FormActionSuccess} from './FormActionSuccess';
import {FormEvent} from 'react';

export interface SubmitActionsProps {
  submitButtonLabel?: string;
  cancelButtonLabel?: string;
  formActionType: FormActionType;
  onCancel: (event: FormEvent<HTMLFormElement>) => void;
  onSubmit: <T>(event: FormEvent<HTMLFormElement>, data:T) => void;
  isFormValid: boolean;
  isFormModified: boolean;
  isFormSubmitting: boolean;
}

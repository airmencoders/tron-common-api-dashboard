import { FormActionType } from '../../../state/crud-page/form-action-type';
import {FormEvent} from 'react';

export interface SubmitActionsProps {
  submitButtonLabel?: string;
  cancelButtonLabel?: string;
  formActionType: FormActionType;
  onCancel?: (event: FormEvent<HTMLFormElement>) => void;
  isFormValid: boolean;
  isFormModified: boolean;
  isFormSubmitting: boolean;
}

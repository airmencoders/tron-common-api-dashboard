import {DataCrudFormErrors} from './data-crud-form-errors';
import {DataCrudSuccessAction} from './data-crud-success-action';
import {FormActionType} from '../../state/crud-page/form-action-type';

export interface CreateUpdateFormProps<T> {
  data?: T;
  formErrors?: DataCrudFormErrors;
  onSubmit: (updated: T) => void;
  onClose: () =>  void;
  successAction?: DataCrudSuccessAction;
  isSubmitting: boolean;
  formActionType: FormActionType;
}

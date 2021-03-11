import { DataCrudFormErrors } from './data-crud-form-errors';
import { DataCrudSuccessAction } from './data-crud-success-action';

export interface DeleteComponentProps<T> {
  data?: T;
  formErrors?: DataCrudFormErrors;
  successAction?: DataCrudSuccessAction;
  isSubmitting: boolean;
}

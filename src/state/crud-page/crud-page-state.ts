import {FormActionType} from './form-action-type';
import {DataCrudFormErrors} from '../../components/DataCrudFormPage/data-crud-form-errors';
import {DataCrudSuccessAction} from '../../components/DataCrudFormPage/data-crud-success-action';

export interface CrudPageState<T> {
  isOpen: boolean;
  formAction?: FormActionType;
  selected?: T
  formErrors?: DataCrudFormErrors;
  successAction?: DataCrudSuccessAction;
  isSubmitting: boolean;
  isDeleteConfirmationOpen: boolean;
}

export const getInitialCrudPageState = () => ({
  isOpen: false,
  formAction: undefined,
  selected: undefined,
  formErrors: undefined,
  successAction: undefined,
  isSubmitting: false,
  isDeleteConfirmationOpen: false
});

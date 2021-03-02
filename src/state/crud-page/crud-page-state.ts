import {AppClientFormActionType} from '../../pages/AppClient/AppClientFormActionType';
import {createState, State, StateMethodsDestroy, useState} from '@hookstate/core';
import {FormActionType} from './form-action-type';
import {DataCrudFormErrors} from '../../components/DataCrudFormPage/data-crud-form-errors';
import {DataCrudSuccessAction} from '../../components/DataCrudFormPage/data-crud-success-action';

export interface CrudPageState<T> {
  isOpen: boolean,
  formAction?: FormActionType,
  selected?: T,
  formErrors?: DataCrudFormErrors,
  successAction?: DataCrudSuccessAction;
  isSubmitting: boolean
}

export const getInitialCrudPageState = () => ({
  isOpen: false,
  formAction: undefined,
  selected: undefined,
  formErrors: undefined,
  isSubmitting: false
});


export function createCrudPageState<T>(): State<CrudPageState<T>> & StateMethodsDestroy {
  return createState<CrudPageState<T>>(getInitialCrudPageState());
}

export function useCrudPageState<T>(): State<CrudPageState<T>> {
    return useState(createCrudPageState<T>());
}

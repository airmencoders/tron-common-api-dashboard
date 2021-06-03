import { ReactText } from 'react';
import { toast, ToastOptions } from 'react-toastify';
import { ToastMessage } from '../ToastMessage/ToastMessage';
import { ToastType } from './toast-type';


/**
 * 
 * Creates most basic toast with just text
 * 
 * @param type the type of toast
 * @param message the message to show
 * @param options the toast options
 * @returns the id of the toast created
 */
export function createTextToast(type: ToastType, message: string, options?: ToastOptions): ReactText {
  const toastOptions: ToastOptions = {
    ...options,
    type
  }

  return toast(<ToastMessage message={message} />, toastOptions);
}

/**
 * Creates generic text toast with message for data fetching errors
 * 
 * @param dataType the name of the data type that failed
 * @returns the id of the toast created
 */
export function createFailedDataFetchToast(dataType?: string) {
  return createTextToast(ToastType.ERROR, `Failed trying to fetch ${dataType ? dataType + ' data!' : 'data!'}`);
}
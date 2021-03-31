import { DataCrudFormErrors } from "../../components/DataCrudFormPage/data-crud-form-errors";

export function prepareDataCrudErrorResponse(err: any): DataCrudFormErrors {
  if (err.response) { // Server responded with some error (4xx, 5xx)
    const validation = err.response.data.errors?.reduce((prev: any, current: any) => {
      const updated = { ...prev };
      updated[current.field] = current.defaultMessage;

      return updated;
    }, {});

    return {
      validation,
      general: err.response.data.message
    };
  } else if (err.request) { // Request never left
    return {
      general: 'Error contacting server. Try again later.'
    }
  } else { // Something else happened...
    return {
      general: err.message
    }
  }
}
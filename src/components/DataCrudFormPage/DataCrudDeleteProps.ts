import { DataCrudFormErrors } from "./data-crud-form-errors";
import { DataCrudDeleteComponentProps } from "./DataCrudDeleteComponentProps";

export interface DataCrudDeleteProps<T> extends React.HTMLAttributes<HTMLElement> {
  onCancel: () => void;
  onSubmit: () => void;
  /**
   * Data being sent for deletion
   */
  data: T;

  /**
   * The type name of the data being deleted
   */
  dataTypeName: string;

  /**
   * True to disable submit button. False to enable it.
   */
  disableSubmit: boolean;

  /**
   * True to show delete confirmation modal. False to hide.
   */
  show: boolean;

  /**
   * Any errors that may have occurred while trying to perform the action
   */
  errors?: DataCrudFormErrors;

  /**
   * The component to be shown in the delete confirmation modal
   */
  deleteComponent: (props: DataCrudDeleteComponentProps<T>) => JSX.Element;
}
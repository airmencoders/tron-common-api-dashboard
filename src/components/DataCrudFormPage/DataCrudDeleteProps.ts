import { DataCrudFormErrors } from "./data-crud-form-errors";
import { DataCrudDeleteComponentProps } from "./DataCrudDeleteComponentProps";

export interface DataCrudDeleteProps<T> extends React.HTMLAttributes<HTMLElement> {
  onCancel: () => void;
  onSubmit: () => void;
  data: T;
  dataTypeName: string;
  disableSubmit: boolean;
  show: boolean;
  errors?: DataCrudFormErrors;
  deleteComponent: (props: DataCrudDeleteComponentProps<T>) => JSX.Element;
}
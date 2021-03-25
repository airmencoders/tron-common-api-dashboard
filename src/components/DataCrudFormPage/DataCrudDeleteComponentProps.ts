export interface DataCrudDeleteComponentProps<T> extends React.HTMLAttributes<HTMLElement> {
  /**
   * Data being sent for deletion
   */
  data: T;

  /**
   * The type name of the data being deleted
   */
  dataTypeName: string;
}
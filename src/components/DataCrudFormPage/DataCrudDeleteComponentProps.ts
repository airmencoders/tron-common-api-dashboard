export interface DataCrudDeleteComponentProps<T> extends React.HTMLAttributes<HTMLElement> {
  data: T;
  dataTypeName: string;
}
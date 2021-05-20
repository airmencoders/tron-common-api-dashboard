
export interface FormGroupProps {
  labelName: string;
  labelText: string;
  children: React.ReactNode;
  isError?: boolean | null;
  errorMessages?: string[] | null;
}

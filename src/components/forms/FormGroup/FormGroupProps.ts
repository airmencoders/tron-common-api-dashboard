
export interface FormGroupProps {
  labelName: string;
  labelText: string;
  children: React.ReactNode;
  isError?: boolean;
  errorMessages?: string[];
  required?: boolean;
}

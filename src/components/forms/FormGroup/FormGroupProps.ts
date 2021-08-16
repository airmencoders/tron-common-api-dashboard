
export interface FormGroupProps {
  labelName: string;
  labelText: string;
  actionsNode?: React.ReactNode;
  children: React.ReactNode;
  isError?: boolean;
  errorMessages?: string[];
  required?: boolean;
  className?: string;
}

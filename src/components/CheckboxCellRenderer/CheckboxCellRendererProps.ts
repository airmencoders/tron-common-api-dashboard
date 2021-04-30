export interface CheckboxCellRendererProps {
  onChange: (data: any, event: React.ChangeEvent<HTMLInputElement>) => void;
  idPrefix: string;
}
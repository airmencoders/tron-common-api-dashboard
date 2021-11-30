
export interface ModalFooterSubmitProps {
  onCancel?: () => void;
  onSubmit: () => void;
  hideCancel?: boolean;
  disableSubmit?: boolean;
  submitText?: string;
  cancelText?: string;
  submitDanger?: boolean;  
}

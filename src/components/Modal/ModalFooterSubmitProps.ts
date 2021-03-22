
export interface ModalFooterSubmitProps {
  onCancel?: () => void;
  onSubmit: () => void;
  showCancel?: boolean;
  disableSubmit?: boolean;
  submitText?: string;
  cancelText?: string;
}

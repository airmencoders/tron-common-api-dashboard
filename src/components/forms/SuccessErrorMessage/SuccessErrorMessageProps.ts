
export interface SuccessErrorMessageProps {
  successMessage: string;
  errorMessage: string;
  showSuccessMessage: boolean;
  showErrorMessage: boolean;
  showCloseButton: boolean;
  onCloseClicked: (event: MouseEvent) => void;
}

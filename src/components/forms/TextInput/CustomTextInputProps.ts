import { TextInputRef } from "./TextInputRef";

export interface CustomTextInputProps {
  className?: string
  validationStatus?: 'error' | 'success'
  inputSize?: 'small' | 'medium'
  inputRef?: TextInputRef
}
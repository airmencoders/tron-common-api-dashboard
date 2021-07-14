import { ChangeEvent } from "react";
import { TextInputRef } from "./TextInputRef";

export interface CustomTextInputProps {
  className?: string
  validationStatus?: 'error' | 'success'
  inputSize?: 'small' | 'medium'
  inputRef?: TextInputRef
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  error?: boolean
  appendedText?: string
}
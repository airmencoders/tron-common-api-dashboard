import { ChangeEvent } from "react";

export interface CheckboxProps {
  id: string
  name: string
  className?: string
  label: React.ReactNode
  inputRef?:
  | string
  | ((instance: HTMLInputElement | null) => void)
  | React.RefObject<HTMLInputElement>
  checked?: boolean
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
}
import { ToastMessageProps } from './ToastMessageProps';

export function ToastMessage(props: ToastMessageProps): JSX.Element {
  return (
    <div className="toast-message">
      {props.message}
    </div>
  );
}
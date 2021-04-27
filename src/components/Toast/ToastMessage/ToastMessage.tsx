import { ToastMessageProps } from './ToastMessageProps';
import './ToastMessage.scss';

export function ToastMessage(props: ToastMessageProps): JSX.Element {
  return (
    <div className="toast-message">
      {props.message}
    </div>
  );
}
import { ToastContainer as Container } from 'react-toastify';
import { ToastContainerProps } from './ToastContainerProps';
import 'react-toastify/dist/ReactToastify.css';

export function ToastContainer(props: Partial<ToastContainerProps>): JSX.Element {
  return <Container {...props} />;
}
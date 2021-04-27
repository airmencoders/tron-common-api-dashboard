import { ToastContainerProps } from 'react-toastify';
import { ToastContainer as Container } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function ToastContainer(props: Partial<ToastContainerProps>): JSX.Element {
  return <Container {...props} />;
}
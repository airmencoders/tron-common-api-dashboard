import { Alert as UswdsAlert } from '@trussworks/react-uswds/lib/index'
import { AlertProps } from './AlertProps';

function Alert(props: AlertProps) {
  return (
    <UswdsAlert {...props} />
  );
}

export default Alert;
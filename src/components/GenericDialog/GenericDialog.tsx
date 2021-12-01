import Modal from '../Modal/Modal';
import ModalTitle from '../Modal/ModalTitle';
import ModalFooterSubmit from '../Modal/ModalFooterSubmit';


export interface GenericDialogProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitDanger?: boolean;
  title: string;
  submitText?: string;
  show: boolean;
  disableSubmit?: boolean;
  children: string | React.ReactNode;
}

export default function GenericDialog(props: GenericDialogProps) {

  return (
    <Modal
      headerComponent={<ModalTitle title={props.title} />}
      footerComponent={<ModalFooterSubmit
        submitDanger={props.submitDanger}
        onCancel={props.onCancel}
        onSubmit={props.onSubmit}
        submitText={props.submitText ?? 'Submit'}
        disableSubmit={props.disableSubmit}
      />}
      show={props.show}
      onHide={props.onCancel}
      width="auto"
      height="auto"
    >
      {props.children}
    </Modal>
  )
}
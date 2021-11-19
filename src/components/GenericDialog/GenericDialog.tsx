import Modal from '../Modal/Modal';
import ModalTitle from '../Modal/ModalTitle';
import ModalFooterSubmit from '../Modal/ModalFooterSubmit';


export interface GenericDialogProps {
  onCancel: () => void;
  onSubmit: () => void;
  title: string;
  submitText?: string;
  show: boolean;
  disableSubmit?: boolean;
  content: string | React.ReactNode;
}

export default function GenericDialog(props: GenericDialogProps) {

  return (
    <Modal
      headerComponent={<ModalTitle title={props.title} />}
      footerComponent={<ModalFooterSubmit
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
      {props.content}
    </Modal>
  )
}
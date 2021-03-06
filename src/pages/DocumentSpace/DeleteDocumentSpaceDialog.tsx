import { useHookstate } from '@hookstate/core';
import Form from '../../components/forms/Form/Form';
import TextInput from '../../components/forms/TextInput/TextInput';
import Modal from '../../components/Modal/Modal';
import ModalFooterSubmit from '../../components/Modal/ModalFooterSubmit';
import ModalIconTitle from '../../components/Modal/ModalIconTitle';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import RemoveIcon from '../../icons/RemoveIcon';
import {
  useDocumentSpaceState
} from '../../state/document-space/document-space-state';
import './DeleteDocumentSpaceDialog.scss';

export interface DeleteDocumentSpaceDialogProps {
  show: boolean;
  docSpaceId: string;
  docSpaceName: string;
  onClose: () => void;
  onDocumentSpaceDeleted: () => void;
}

interface DialogState {
  textFieldContents: string | undefined;
  isDeleting: boolean;
}

export default function DeleteDocumentSpaceDialog(props: DeleteDocumentSpaceDialogProps) {
  const dialogState = useHookstate<DialogState>({ textFieldContents: '', isDeleting: false });
  const documentSpaceService = useDocumentSpaceState();

  async function deleteSpace() {    
    try {
      // delete it from the backend
      await documentSpaceService.deleteDocumentSpace(props.docSpaceId);

      props.onDocumentSpaceDeleted && props.onDocumentSpaceDeleted();
    } catch (error) {
      createTextToast(ToastType.ERROR, (error as Error).message);
    }

    props.onClose();
  }

  return (
    <Modal
      headerComponent={<ModalIconTitle 
        icon={<RemoveIcon size={2} />}
        text="Permanently Remove Space?"
      />}
      width="auto"
      height="auto"
      footerComponent={
        <ModalFooterSubmit
          submitText="Yes, remove"
          onSubmit={deleteSpace}
          disableSubmit={dialogState.textFieldContents.get() != props.docSpaceName || dialogState.isDeleting.value}
          onCancel={props.onClose}
          submitDanger={true}
        />
      }
      show={props.show}
      onHide={props.onClose}
    >
      <h4>
        All documents, preferences, and memberships related to this document space will be<br/>
        <span data-testid="delete-space-red-text" className="red-text">permanently removed</span>.
      </h4>
      <h4>{`To confirm the removal of "${props.docSpaceName}", type the document space name below:`}</h4>
      <Form style={{ minWidth: '100%' }} onSubmit={(event) => { event.preventDefault() }}>
        <TextInput
          id="document-space-removal-field"
          style={{ width: '100%' }}
          type="text"
          name="document-space-removal-field"
          data-testid="document-space-removal-field"
          onChange={(event) => dialogState.textFieldContents.set(event.target.value)}
        />
      </Form>
    </Modal>
  );
}

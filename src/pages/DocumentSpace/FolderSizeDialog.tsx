import { useHookstate } from '@hookstate/core';
import React, { useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import ModalFooterSubmit from '../../components/Modal/ModalFooterSubmit';
import ModalIconTitle from '../../components/Modal/ModalIconTitle';
import Spinner from '../../components/Spinner/Spinner';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import InfoIcon from '../../icons/InfoIcon';
import { useDocumentSpaceState } from '../../state/document-space/document-space-state';
import { formatBytesToString } from '../../utils/file-utils';
import './FolderSizeDialog.scss';

export interface FolderSizeDialogProps {
  show: boolean;
  spaceId: string;
  folderPath: string;
  onClose: () => void;
}

enum StatusState {
  FETCHING,
  ERROR,
  DONE,
}

interface DialogState {
  status: StatusState;
  size: number;
  count: number;
}

export default function FolderSizeDialog(props: FolderSizeDialogProps) {
  const dialogState = useHookstate<DialogState>({
    status: StatusState.FETCHING,
    size: 0,
    count: 0,
  });
  const documentSpaceService = useDocumentSpaceState();

  useEffect(() => {
    async function getFolderSize() {
      try {
        dialogState.status.set(StatusState.FETCHING);
        const folderInfo = await documentSpaceService.getFolderSize(props.spaceId, props.folderPath);
        dialogState.merge({ status: StatusState.DONE, size: folderInfo.size, count: folderInfo.count });
      } catch (e) {
        dialogState.status.set(StatusState.ERROR);
        createTextToast(ToastType.ERROR, 'Could not get folder size');
      }
    }

    getFolderSize();
  }, []);

  function renderDialogContent() {
    if (dialogState.status.get() === StatusState.FETCHING) {
      return (<Spinner />)
    }
    else if (dialogState.status.get() === StatusState.DONE) {
      return (<div>
        <table className='folder-details-table'>
          <tbody>
          <tr><td>Folder:</td><td>{props.folderPath}</td></tr>
          <tr><td>Folder Size:</td><td>{formatBytesToString(dialogState.size.get())}</td></tr>
          <tr><td>Number of Files:</td><td>{dialogState.count.get()}</td></tr>
          </tbody>
        </table>
      </div>)
    }
    else {
      return (<h4>Unable to get folder size!</h4>)
    }
    
  }

  return (
    <Modal
      headerComponent={<ModalIconTitle icon={<InfoIcon size={1.2} />} text="Folder Size" />}
      width="auto"
      height="auto"
      footerComponent={
        <ModalFooterSubmit
          submitText="OK"
          onSubmit={props.onClose}
          hideCancel={true}
          disableSubmit={false}
          onCancel={props.onClose}
        />
      }
      show={props.show}
      onHide={props.onClose}
    >
      {renderDialogContent()}
    </Modal>
  );
}

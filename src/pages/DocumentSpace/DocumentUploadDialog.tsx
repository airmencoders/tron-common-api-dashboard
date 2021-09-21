import { useHookstate } from '@hookstate/core';
import React from 'react';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import ModalTitle from '../../components/Modal/ModalTitle';
import { useDocumentSpaceState } from '../../state/document-space/document-space-state';

interface UploadState {
  showDialog: boolean;
  fileCount: number;
  number: number;
  currentFile: string;
}

export interface DocumentUploadProps {
  onFinish: () => void;
}

export default function DocumentUploadDialog(props: DocumentUploadProps) {
  const documentSpaceService = useDocumentSpaceState();
  const uploadState = useHookstate<UploadState>({
    showDialog: false,
    fileCount: 0,
    number: 0,
    currentFile: '',
  });
  const inputFileRef = React.useRef<HTMLInputElement>(null);

  function uploadFiles(): void {
    if (inputFileRef && inputFileRef.current) {
      (inputFileRef.current as HTMLInputElement).click();
    }
  }

  function onCancelUpload(): void {
    uploadState.merge({ showDialog: false });
  }

  async function handleFileSelection(files: FileList): Promise<void> {
    if (files && files.length > 0) {
      uploadState.merge({
        showDialog: true,
        fileCount: files.length,
      });

      for (let i =0; i< files.length; i++) {
        uploadState.merge({ number: i+1, currentFile: files[i].name });
        await documentSpaceService.uploadFile('heather', files[i]);
      }

      uploadState.merge({
        showDialog: false,
      });

      props.onFinish();

    } else {
      uploadState.merge({
        showDialog: false,
      });
    }
  }
  return (
    <div>
      <input
        data-testid="file-uploader-input"
        type="file"
        onChange={(e) => handleFileSelection(e.target.files ?? new FileList())}
        ref={inputFileRef}
        multiple
        style={{ display: 'none' }}
      />
      <Button data-testid='upload-file__btn' onClick={uploadFiles} type='button'>Upload Files</Button>
      <Modal
        show={uploadState.showDialog.get()}
        headerComponent={<ModalTitle title="Uploading Files" />}
        footerComponent={
          <div className={'modal-footer-submit'}>
            <Button
              type="button"
              data-testid="upload-cancel__btn"
              className="add-app-client__btn"
              inverse
              outline
              onClick={onCancelUpload}
            >
              Cancel
            </Button>
          </div>
        }
        onHide={onCancelUpload}
        height="auto"
        width="30%"
      >
        <div>{`Uploading file #${uploadState.number.get()} of ${uploadState.fileCount.get()}: (${uploadState.currentFile.get()})`}
        <progress></progress>
        </div>
      </Modal>
    </div>
  );
}

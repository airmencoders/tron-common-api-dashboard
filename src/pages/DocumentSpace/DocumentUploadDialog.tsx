import { useHookstate } from '@hookstate/core';
import { CancelTokenSource } from 'axios';
import React from 'react';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import ModalTitle from '../../components/Modal/ModalTitle';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import { useDocumentSpaceState } from '../../state/document-space/document-space-state';
import './DocumentUploadDialog.scss';

interface UploadState {
  showDialog: boolean;
  fileCount: number;
  number: number;
  currentFile: string;
  progress: number;
  cancelToken: CancelTokenSource | undefined;
}

export interface DocumentUploadProps {
  documentSpaceId: string;
  currentPath: string;
  onFinish: () => void;
}

export default function DocumentUploadDialog(props: DocumentUploadProps) {
  const documentSpaceService = useDocumentSpaceState();
  const uploadState = useHookstate<UploadState>({
    showDialog: false,
    fileCount: 0,
    number: 0,
    currentFile: '',
    progress: 0,
    cancelToken: undefined,
  });
  const inputFileRef = React.useRef<HTMLInputElement>(null);

  function uploadFiles(): void {
    if (inputFileRef && inputFileRef.current) {
      (inputFileRef.current as HTMLInputElement).click();
    }
  }

  function onCancelUpload(): void {
    if (uploadState.cancelToken.get()) {
      uploadState.cancelToken.get()?.cancel();
    }

    uploadState.merge({ showDialog: false });
  }

  function updateProgress(percent: number) {
    uploadState.progress.set(percent / 100);
  }

  async function handleFileSelection(files: FileList): Promise<void> {
    console.log(files)
    if (files && files.length > 0) {
      uploadState.merge({
        showDialog: true,
        fileCount: files.length,
      });

      try {
        for (let i = 0; i < files.length; i++) {
          uploadState.merge({
            number: i + 1,
            currentFile: files[i].name,
            progress: 0,
          });
          const response = documentSpaceService.uploadFile(
            props.documentSpaceId,
            props.currentPath,
            files[i],
            updateProgress
          );
          uploadState.cancelToken.set(response.cancelTokenSource);
          await response.promise;
        }

        createTextToast(ToastType.SUCCESS, 'Upload Process completed', { autoClose: 3000 })
      } catch (e) {
        createTextToast(ToastType.ERROR, 'Upload Process cancelled', { autoClose: 3000 })
      }

      uploadState.merge({
        showDialog: false,
      });

      if (inputFileRef && inputFileRef.current) inputFileRef.current.value = '';
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
      <Button
        data-testid="upload-file__btn"
        onClick={uploadFiles}
        type="button"
      >
        Upload Files
      </Button>
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
        <div>
          {`Uploading file ${uploadState.number.get()} of ${uploadState.fileCount.get()}: (${uploadState.currentFile.get()})`}
          <progress className='upload-progress' value={uploadState.progress.get()}></progress>
        </div>
      </Modal>
    </div>
  );
}

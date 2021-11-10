import { useHookstate } from '@hookstate/core';
import { CancelTokenSource } from 'axios';
import React, { forwardRef } from 'react';
import { useDocumentSpaceState } from '../../../state/document-space/document-space-state';
import { ToastType } from '../../Toast/ToastUtils/toast-type';
import { createTextToast } from '../../Toast/ToastUtils/ToastUtils';
import Modal from '../../../components/Modal/Modal';
import ModalTitle from '../../../components/Modal/ModalTitle';
import Button from '../../../components/Button/Button'
import './FileUpload.scss';

interface UploadState {
  showDialog: boolean;
  fileCount: number;
  number: number;
  currentFile: string;
  progress: number;
  cancelToken: CancelTokenSource | undefined;
}

export interface FileUploadProps {
  documentSpaceId: string;
  currentPath: string;
  onFinish: () => void;
  value?: string | React.ReactNode;
}

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>((props, ref) => {
  const documentSpaceService = useDocumentSpaceState();
  const uploadState = useHookstate<UploadState>({
    showDialog: false,
    fileCount: 0,
    number: 0,
    currentFile: '',
    progress: 0,
    cancelToken: undefined,
  });

  function onCancelUpload(): void {
    uploadState.cancelToken.value?.cancel();
    uploadState.merge({ showDialog: false });
  }

  function updateProgress(percent: number) {
    uploadState.progress.set(percent / 100);
  }

  async function handleFileSelection(files: FileList): Promise<void> {
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

      props.onFinish();
    } else {
      uploadState.merge({
        showDialog: false,
      });
    }
  }

  return (
    <>
      <input
        data-testid="file-uploader-input"
        type="file"
        onChange={(e) => handleFileSelection(e.target.files ?? new FileList())}
        ref={ref}
        multiple
        style={{ display: 'none' }}
      />

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
    </>
  )
});

export default FileUpload;
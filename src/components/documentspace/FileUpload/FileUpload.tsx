import { Downgraded, none, useHookstate } from '@hookstate/core';
import { AnyD3Scale } from '@visx/scale';
import { AxiosError, CancelTokenSource } from 'axios';
import React, { forwardRef } from 'react';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';
import Button from '../../../components/Button/Button';
import Modal from '../../../components/Modal/Modal';
import ModalTitle from '../../../components/Modal/ModalTitle';
import { useDocumentSpaceState } from '../../../state/document-space/document-space-state';
import GenericDialog from '../../GenericDialog/GenericDialog';
import { ToastType } from '../../Toast/ToastUtils/toast-type';
import { createTextToast } from '../../Toast/ToastUtils/ToastUtils';
import './FileUpload.scss';

enum FileConflictStrategy {
  PROMPT,
  OVERWRITE_REMOTE,
  PRESERVE_REMOTE,
}

// OS meta files we dont want to pollute our space with
const blacklistedFiles: string[] = [
  ".DS_Store",
  "thumbs.db"
];

interface UploadState {
  showUploadDialog: boolean;
  showConfirmDialog: boolean;
  currentConflictStrategy: FileConflictStrategy; 
  backendFileInfo: string[];
  fileList: FileList | undefined;
  fileCount: number;
  fileIndex: number;
  currentFile: string;
  progress: number;
  cancelToken: CancelTokenSource | undefined;
  uploadErrors: Record<string, string>[],
  showErrorDialog: boolean;
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
    showUploadDialog: false,
    showConfirmDialog: false,
    currentConflictStrategy: FileConflictStrategy.PROMPT,
    backendFileInfo: [],
    fileList: undefined,
    fileCount: 0,
    fileIndex: 0,
    currentFile: '',
    progress: 0,
    cancelToken: undefined,
    uploadErrors: [],
    showErrorDialog: false,
  });

  const inputKeyState = useHookstate(Date.now());

  function onCancelUpload(): void {
    uploadState.cancelToken.value?.cancel();
    uploadState.merge({ 
      fileCount: 0,
      showUploadDialog: false,
      showConfirmDialog: false,
      uploadErrors: [],
      showErrorDialog: false,
    });


    // force react to re-render the hidden file input to clear its selection
    //  contents ... stackoverflow.com/a/55495449
    inputKeyState.set(Date.now());
  }

  function updateProgress(percent: number) {
    uploadState.progress.set(percent / 100);
  }

  async function uploadFile(fileIndex: number) {
    for (let i = fileIndex; i < uploadState.fileCount.value; i++) {
      const currentFile: string = uploadState.fileList?.get()?.[i].name ?? '';

      if (currentFile && !blacklistedFiles.includes(currentFile)) {  // skip over blacklisted files we don't want as well
        uploadState.merge({ fileIndex: i, currentFile });

        // if this current file is listed in the state's 'backendFileInfo'
        //  then we need to prompt (..maybe)
        if (uploadState.backendFileInfo.get().includes(currentFile)) {
          switch (uploadState.currentConflictStrategy.value) {
            case FileConflictStrategy.PROMPT:
              uploadState.merge({ showConfirmDialog: true });
              return; // done until next user interaction
            case FileConflictStrategy.OVERWRITE_REMOTE:
              break; // don't have to do anything for overwrites
            case FileConflictStrategy.PRESERVE_REMOTE:
              continue; // skip the upload below if we're preserving remote copy
            default:
              break;
          }
        }

        // if we get here, then the currentFile didn't collide with the backend
        //  and/or user chose to overwrite-all..
        const list = uploadState.fileList.attach(Downgraded).get();
        if (list) {
          try {
            const response = documentSpaceService.uploadFile(
              props.documentSpaceId,
              props.currentPath,
              list[i],
              updateProgress
            );

            uploadState.cancelToken.set(response.cancelTokenSource);
            await response.promise;
          } catch (e) {

            uploadState.uploadErrors.set([...uploadState.uploadErrors.attach(Downgraded).get(), 
              { file: list[i].name, reason: (e as AxiosError).response?.data.reason ??
                'Upload Process Cancelled' }]
            );
          }
        }
      }
    }

    if (uploadState.uploadErrors.get().length === 0) {
      createTextToast(ToastType.SUCCESS, uploadState.fileCount.value > 1 ? `Upload Process completed for ${uploadState.fileCount.value} files` : 'Upload Process completed successfully', { autoClose: 3000 });
    }
    else {
      uploadState.merge({ showErrorDialog: true });
    }

    uploadState.merge({
      showUploadDialog: false,
      showConfirmDialog: false,
    });

    // fire callback regardless of success
    props.onFinish();

    // force react to re-render the hidden file input to clear its selection
    //  contents ... stackoverflow.com/a/55495449
    inputKeyState.set(Date.now());
  }

  function onOverwriteFile() {
    // land here when user chooses to overwrite the current file..
    //  so remove it from the list of those that exist on the backend
    //  so next uploadFile() call succeeds
    uploadState.backendFileInfo[uploadState.backendFileInfo.value.findIndex(item => item === uploadState.currentFile.value)].set(none);
    uploadFile(uploadState.fileIndex.get());  
    uploadState.merge({ showConfirmDialog: false, });
  }

  function onSkipFile() {
    // land here when user choses to NOT overwrite the remote file..
    //  so we just increment the file index past it, and recall upload()
    //  for the next file
    uploadFile(uploadState.fileIndex.value + 1);
  }

  // this is what's called if a user clicks ok from the file browser dialog.... 
  async function handleFileSelection(files: FileList): Promise<void> {
    if (files && files.length > 0) {
      uploadState.merge({
        showUploadDialog: true,
        showConfirmDialog: false,
        currentConflictStrategy: FileConflictStrategy.PROMPT,
        fileCount: files.length,
        fileList: files,
        fileIndex: 0,
        uploadErrors: [],
        showErrorDialog: false,
        backendFileInfo: [],
      });

      console.log(files)

      // convert the selected files structure (a FileList type)
      //  to just array of strings (the filenames)
      const fileNames: string[] = [];
      for (let i = 0; i < files.length; i++) {

        // skip over blacklisted files
        if (blacklistedFiles.includes(files[i].name)) {
          continue;
        }

        if ((ref as React.RefObject<HTMLInputElement>).current?.hasAttribute('webkitdirectory')) {
          // if we're in directory selection mode send the while path+file to the backend
          console.log((files[i] as any).webkitRelativePath)
          fileNames.push((files[i] as any).webkitRelativePath);
        } else {
          // if we're just in file selection mode, send the name itself (which will be relative to our current directory)
          fileNames.push(files[i].name)
        }
      }

      // update file list count
      uploadState.merge({
        fileCount: fileNames.length,
      });

      // go ask the backend for the existence of any of these 
      //  about-to-be-uploaded files
      let itemsInfo: string[] = [];
      try {
        itemsInfo = await documentSpaceService.checkIfFileExistsAtPath(
          props.documentSpaceId, props.currentPath, fileNames);
      }
      catch (e) {
        createTextToast(ToastType.ERROR, (e as AxiosError).response?.data.reason ?? 'Could not determine existing file status', { autoClose: 5000 });
        uploadState.merge({
          showUploadDialog: false,
          showConfirmDialog: false,
        });
        return;
      }

      // kick off the process
      uploadState.merge({ backendFileInfo: itemsInfo, });
      uploadFile(0);
    } else {
      uploadState.merge({
        showUploadDialog: false,
        showConfirmDialog: false,
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
        key={inputKeyState.get()}
        multiple
        style={{ display: 'none' }}
      />
      <Modal
        show={uploadState.showUploadDialog.get()}
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
          {`Uploading file ${uploadState.fileIndex.get()} of ${uploadState.fileCount.get()}: (${uploadState.currentFile.get()})`}
          <progress className='upload-progress' value={uploadState.progress.get()}></progress>
        </div>
      </Modal>
      <Modal
        show={uploadState.showConfirmDialog.get()}
        headerComponent={<ModalTitle title="Confirm Overwrite" />}
        footerComponent={
          <div className={'modal-footer-submit'}>
            <Button
              type="button"
              data-testid="upload-overwrite-yes__btn"
              className="add-app-client__btn"
              inverse
              outline
              onClick={onOverwriteFile}
            >
              Yes
            </Button>
            <Button
              type="button"
              data-testid="upload-overwrite-all__btn"
              className="add-app-client__btn"
              inverse
              outline
              onClick={() => { uploadState.currentConflictStrategy.set(FileConflictStrategy.OVERWRITE_REMOTE); onOverwriteFile(); }}
            >
              Yes to All
            </Button>
            <Button
              type="button"
              data-testid="upload-overwrite-no__btn"
              className="add-app-client__btn"
              inverse
              outline
              onClick={onSkipFile}
            >
              No
            </Button>
            <Button
              type="button"
              data-testid="upload-overwrite-none__btn"
              className="add-app-client__btn"
              inverse
              outline
              onClick={() => { uploadState.currentConflictStrategy.set(FileConflictStrategy.PRESERVE_REMOTE); onSkipFile(); }}
            >
              No to All
            </Button>
          </div>
        }
        onHide={onCancelUpload}
        height="auto"
        width="30%"
      >
        <div>There is already a file named <strong>{uploadState.currentFile.value}</strong> on the server.</div>
        <div><br/> Do you want to replace it with this copy?</div>
      </Modal>
      <GenericDialog
        show={uploadState.showErrorDialog.get()}
        onCancel={() => uploadState.showErrorDialog.set(false)}
        onSubmit={() => uploadState.showErrorDialog.set(false)}
        submitText="OK"
        title="Upload File Errors"
      >
        <>
          <div>{`Successfully uploaded ${uploadState.fileCount.value - uploadState.uploadErrors.value.length} files.`}</div>
          <div>These files did not upload:</div>
          <ul>{uploadState.uploadErrors.get().map(item => <li key={item.file}>{item.file} - {item.reason}</li>)}</ul>
        </>
      </GenericDialog>
    </>
  )
});

export default FileUpload;
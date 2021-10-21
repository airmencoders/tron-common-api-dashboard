import React from 'react';
import Button from '../../components/Button/Button';
import {documentSpaceMembershipService} from '../../state/document-space/document-space-state';
import './DocumentUploadDialog.scss';
import {State} from "@hookstate/core";
import {BatchUploadState} from "./DocumentSpaceMemberships";
import {createTextToast} from "../../components/Toast/ToastUtils/ToastUtils";
import {ToastType} from "../../components/Toast/ToastUtils/toast-type";


export interface DocumentUploadProps {
  documentSpaceId: string;
  batchUploadState: State<BatchUploadState>;
  onFinish: () => void;
}

export default function BatchUserUploadDialog(props: DocumentUploadProps) {
  const membershipService = documentSpaceMembershipService();
  const inputFileRef = React.useRef<HTMLInputElement>(null);

  function uploadFiles(): void {
    props.batchUploadState.successErrorState.merge({errorMessage: '', showErrorMessage:false, showSuccessMessage: false})

    if (inputFileRef && inputFileRef.current) {
      (inputFileRef.current).click();
    }
  }

  async function handleFileSelection(file: File): Promise<void> {
    if (file) {
      try {
        await membershipService
          .batchAddUserToDocumentSpace(props.documentSpaceId, file)
          .then((response)=> {
            if(response.data && response.data.length){
              props.batchUploadState.successErrorState.merge({errorMessage: response.data, showErrorMessage:true})
            }else{
              props.batchUploadState.successErrorState.merge({showErrorMessage:false, showSuccessMessage: true})
            }
          });

      }catch(e){
        createTextToast(ToastType.ERROR, 'Unexpected error while uploading', { autoClose: 3000 })
      }

      if (inputFileRef && inputFileRef.current) inputFileRef.current.value = '';
      props.onFinish();
    }
  }
  return (
    <div id={'batch-add-users'} style={{marginLeft:'auto', marginRight:'3rem'}}>
      <input
        data-testid="user-file-uploader-input"
        type="file"
        accept={'text/csv'}
        onChange={(e) => {
          if(e.target.files && e.target.files.length){
            return handleFileSelection(e.target.files[0])
          }
        }}
        ref={inputFileRef}
        style={{ display: 'none' }}
      />
      <Button
        onClick={uploadFiles}
        type="button"
      >
        Upload Batch User CSV
      </Button>
    </div>
  );
}

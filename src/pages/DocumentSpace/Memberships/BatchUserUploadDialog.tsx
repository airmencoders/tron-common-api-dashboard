import React from 'react';
import Button from '../../../components/Button/Button';
import {documentSpaceMembershipService} from '../../../state/document-space/document-space-state';
import { State, useHookstate } from "@hookstate/core";
import {createTextToast} from "../../../components/Toast/ToastUtils/ToastUtils";
import {ToastType} from "../../../components/Toast/ToastUtils/toast-type";
import UploadIcon from '../../../icons/UploadIcon';
import QuestionIcon from '../../../icons/QuestionIcon';
import Modal from '../../../components/Modal/Modal';
import ModalTitle from '../../../components/Modal/ModalTitle';
import ModalFooterSubmit from '../../../components/Modal/ModalFooterSubmit';
import Accordion from '../../../components/Accordion/Accordion';
import './BatchUserUploadDialog.scss';
import InfoNotice from '../../../components/InfoNotice/InfoNotice';
import { BatchUploadState } from '../../../state/document-space/memberships-page/memberships-page-state';


export interface DocumentUploadProps {
  documentSpaceId: string;
  batchUploadState: State<BatchUploadState>;
  onFinish: () => void;
}

interface ExampleCsvState {
  isOpen: boolean;
}

export default function BatchUserUploadDialog(props: DocumentUploadProps) {
  const exampleCsvState = useHookstate<ExampleCsvState>({
    isOpen: false
  });
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

  function closeBatchCsvInfo() {
    exampleCsvState.isOpen.set(false);
  }

  return (
    <>
      <div className="batch-members-container" id="batch-add-users">
        <Button
          onClick={uploadFiles}
          type="button"
        >
          <UploadIcon
            iconTitle="Upload CSV file"
            size={1}
          />&nbsp;
          Upload
        </Button>
        <Button
          type="button"
          onClick={() => exampleCsvState.isOpen.set(true)}
          unstyled
          disableMobileFullWidth
        >
          <QuestionIcon
            size={1.5}
            iconTitle="Batch Member Upload Information"
            style="primary"
          />
        </Button>
      </div>

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
      
      <Modal
        headerComponent={<ModalTitle title="Batch Member Upload Information" />}
        footerComponent={<ModalFooterSubmit
          hideCancel
          onSubmit={closeBatchCsvInfo}
          submitText="Close"
        />}
        show={exampleCsvState.isOpen.value}
        onHide={closeBatchCsvInfo}
        width="auto"
        height="auto"
      >
        <InfoNotice className="batch-upload-notice" type="info" slim>
          Batch upload of users is done through an upload of a comma separated values(CSV) file. The headers are required (email, privilege). The possible values for the privilege column are: ADMIN, EDITOR, and VIEWER. Below you will find actions that each privilege allows a user to perform.
        </InfoNotice>
        <Accordion
          items={[
            {
              title: 'ADMIN',
              content: <ul>
                <li>Manage members and their privilege level</li>
                <li>Includes all actions from Editor and Viewer</li>
              </ul>,
              id: 'admin'
            },
            {
              title: 'EDITOR',
              content: <ul>
                <li>Upload files and folders</li>
                <li>Delete files and folders</li>
                <li>Includes all actions from Viewer</li>
              </ul>,
              id: 'Editor'
            },
            {
              title: 'VIEWER',
              content: <ul>
                <li>Browse all files and folders</li>
                <li>Download all files and folders</li>
              </ul>,
              id: 'Viewer'
            }
          ]}
        />
        <table className="table table-bordered table-hover table-condensed">
          <thead>
            <tr>
              <th title="Email">email</th>
              <th title="Privilege">privilege</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>username@example.com</td>
              <td>ADMIN</td>
            </tr>
            <tr>
              <td>first_last@example.net</td>
              <td>EDITOR</td>
            </tr>
            <tr>
              <td>last_first@example.com</td>
              <td>VIEWER</td>
            </tr>
          </tbody>
        </table>
      </Modal>
    </>
  );
}

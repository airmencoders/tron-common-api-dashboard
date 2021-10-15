import React from 'react';
import Modal from '../../components/Modal/Modal';
import ModalFooterSubmit from '../../components/Modal/ModalFooterSubmit';
import WarningIcon from '../../icons/WarningIcon';
import { DocumentSpaceMembershipsDeleteConfirmationProps } from './DocumentSpaceMembershipsDeleteConfirmationProps';
import './DocumentSpaceMembershipsDeleteConfirmation.scss';

function DocumentSpaceMembershipsDeleteConfirmation(props: DocumentSpaceMembershipsDeleteConfirmationProps) {
  return (
    <Modal
      headerComponent={<></>}
      footerComponent={<ModalFooterSubmit
        onSubmit={props.onMemberDeleteConfirmationSubmit}
        onCancel={props.onCancel}
        submitText="Delete"
      />}
      show={props.show}
      onHide={props.onCancel}
      width="50%"
      height="auto"
    >
      <div className="member-delete-confirm">
        <WarningIcon className="member-delete-confirm__warning-icon" iconTitle="Member Deletion Warning" size={3} />
        <p className="member-delete-confirm__message">Permanently delete ({props.selectedMemberCount}) members?</p>
      </div>
    </Modal>
  );
}

export default DocumentSpaceMembershipsDeleteConfirmation;
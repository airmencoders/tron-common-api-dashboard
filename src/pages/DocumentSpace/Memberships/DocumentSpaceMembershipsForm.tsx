import React, { useEffect, useRef } from 'react';
import './DocumentSpaceMembershipsForm.scss';
import AddDocumentSpaceAppClientMember from './AddMembershipSubForms/AddDocumentSpaceAppClientMember';
import AddDocumentSpaceUserMember from './AddMembershipSubForms/AddDocumentSpaceUserMember';
import { useDocumentSpaceMembershipsPageState } from '../../../state/document-space/document-space-state';

/**
 * Hosts the sub components for adding new users and appclients to a doc space
 */

export interface DocumentSpaceMembershipsFormProps {
  documentSpaceId: string;
  onCloseHandler?: () => void;
}

function DocumentSpaceMembershipsForm(props: DocumentSpaceMembershipsFormProps) {  
  const pageState = useDocumentSpaceMembershipsPageState();
  return (
    <>
      <AddDocumentSpaceUserMember documentSpaceId={props.documentSpaceId}
        onCloseHandler={props.onCloseHandler}
        onMemberChangeCallback={pageState.onMemberChangeCallback.bind(pageState)}
      />
      <AddDocumentSpaceAppClientMember documentSpaceId={props.documentSpaceId}
        onCloseHandler={props.onCloseHandler}
        onMemberChangeCallback={pageState.onMemberChangeCallback.bind(pageState)}
      />
    </>
  );
}

export default DocumentSpaceMembershipsForm;

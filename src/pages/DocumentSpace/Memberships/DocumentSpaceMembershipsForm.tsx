import React, { useEffect, useRef } from 'react';
import './DocumentSpaceMembershipsForm.scss';
import AddDocumentSpaceAppClientMember from './AddMembershipSubForms/AddDocumentSpaceAppClientMember';
import AddDocumentSpaceUserMember from './AddMembershipSubForms/AddDocumentSpaceUserMember';

/**
 * Hosts the sub components for adding new users and appclients to a doc space
 */

export interface DocumentSpaceMembershipsFormProps {
  documentSpaceId: string;
  onMemberChangeCallback: () => void;
  onCloseHandler?: () => void;
}

function DocumentSpaceMembershipsForm(props: DocumentSpaceMembershipsFormProps) {  
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return function cleanup() {
      mountedRef.current = false;
    };
  }, []); 

  return (
    <React.Fragment>
      <AddDocumentSpaceUserMember documentSpaceId={props.documentSpaceId}
        onCloseHandler={props.onCloseHandler}
        onMemberChangeCallback={props.onMemberChangeCallback}
      />
      <AddDocumentSpaceAppClientMember documentSpaceId={props.documentSpaceId}
        onCloseHandler={props.onCloseHandler}
        onMemberChangeCallback={props.onMemberChangeCallback}
      />
    </React.Fragment>
  );
}

export default DocumentSpaceMembershipsForm;

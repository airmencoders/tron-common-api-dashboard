import React from 'react';
import { ActionsProps } from './ActionsProps';
import DesktopActions from './DesktopActions/DesktopActions';
import { DocumentSpaceActionsProps } from './DocumentSpaceActionsProps';
import MobileActions from './MobileActions/MobileActions';

function DocumentSpaceActions(props: DocumentSpaceActionsProps & ActionsProps) {
  if (!props.show) {
    return null;
  }

  if (props.isMobile) {
    return (
      <MobileActions
        selectedSpace={props.selectedSpace}
        path={props.path}
        shouldUpdateInfiniteCache={props.shouldUpdateInfiniteCache}
        createEditElementOpType={props.createEditElementOpType}
        membershipsState={props.membershipsState}
        selectedFiles={props.selectedFiles}
        showDeleteSelectedDialog={props.showDeleteSelectedDialog}
        className={props.className}
      />
    );
  }

  return (
    <DesktopActions
      selectedSpace={props.selectedSpace}
      path={props.path}
      shouldUpdateInfiniteCache={props.shouldUpdateInfiniteCache}
      createEditElementOpType={props.createEditElementOpType}
      membershipsState={props.membershipsState}
      selectedFiles={props.selectedFiles}
      showDeleteSelectedDialog={props.showDeleteSelectedDialog}
      className={props.className}
    />
  );
}

export default DocumentSpaceActions;
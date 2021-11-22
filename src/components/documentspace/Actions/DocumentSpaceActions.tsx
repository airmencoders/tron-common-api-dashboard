import React from 'react';
import { DeviceSize, useDeviceDetect } from '../../../hooks/DeviceDetect';
import { ActionsProps } from './ActionsProps';
import DesktopActions from './DesktopActions/DesktopActions';
import { DocumentSpaceActionsProps } from './DocumentSpaceActionsProps';
import MobileActions from './MobileActions/MobileActions';

function DocumentSpaceActions(props: DocumentSpaceActionsProps & ActionsProps) {
  const deviceInfo = useDeviceDetect();

  if (deviceInfo.deviceBySize === DeviceSize.UNKNOWN || !props.show) {
    return null;
  }

  if (deviceInfo.deviceBySize <= DeviceSize.TABLET || deviceInfo.isMobile) {
    return (
      <MobileActions
        selectedSpace={props.selectedSpace}
        path={props.path}
        shouldUpdateDatasource={props.shouldUpdateDatasource}
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
      shouldUpdateDatasource={props.shouldUpdateDatasource}
      createEditElementOpType={props.createEditElementOpType}
      membershipsState={props.membershipsState}
      selectedFiles={props.selectedFiles}
      showDeleteSelectedDialog={props.showDeleteSelectedDialog}
      className={props.className}
    />
  );
}

export default DocumentSpaceActions;
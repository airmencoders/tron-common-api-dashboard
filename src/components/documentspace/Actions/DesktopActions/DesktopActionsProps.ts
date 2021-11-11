import { State } from '@hookstate/core';
import { DocumentDto } from '../../../../openapi';
import { ActionsProps } from '../ActionsProps';

export interface DesktopActionsProps extends ActionsProps {
  selectedFiles: State<DocumentDto[]>;
  showDeleteSelectedDialog: State<boolean>;
}
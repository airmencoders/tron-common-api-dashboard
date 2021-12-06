import { State } from '@hookstate/core';
import { DocumentDto, DocumentSpaceResponseDto } from '../../../openapi';
import { CreateEditOperationType } from '../../../state/document-space/document-space-utils';

export interface ActionsProps {
  selectedSpace: State<DocumentSpaceResponseDto | undefined>;
  path: State<string>;
  shouldUpdateInfiniteCache: State<boolean>;
  createEditElementOpType: State<CreateEditOperationType>;
  membershipsState: State<{ isOpen: boolean }>;
  selectedFiles: State<DocumentDto[]>;
  showDeleteSelectedDialog: State<boolean>;
  className?: string;
}
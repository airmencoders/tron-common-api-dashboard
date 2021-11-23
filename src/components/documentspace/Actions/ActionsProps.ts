import { State } from '@hookstate/core';
import { DocumentDto, DocumentSpaceResponseDto } from '../../../openapi';
import { CreateEditOperationType } from '../../../pages/DocumentSpace/DocumentSpacePage';

export interface ActionsProps {
  selectedSpace: State<DocumentSpaceResponseDto | undefined>;
  path: State<string>;
  shouldUpdateDatasource: State<boolean>;
  createEditElementOpType: State<CreateEditOperationType>;
  membershipsState: State<{ isOpen: boolean }>;
  selectedFiles: State<DocumentDto[]>;
  showDeleteSelectedDialog: State<boolean>;
  className?: string;
}
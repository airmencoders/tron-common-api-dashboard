import { State } from '@hookstate/core';
import { DocumentDto, DocumentSpaceResponseDto } from '../../../openapi';
import SpacesPageService from '../../../state/document-space/spaces-page/spaces-page-service';
import { CreateEditOperationType } from '../../../utils/document-space-utils';

export interface ActionsProps {
  selectedSpace: State<DocumentSpaceResponseDto | undefined>;
  path: State<string>;
  shouldUpdateDatasource: State<boolean>;
  createEditElementOpType: State<CreateEditOperationType>;
  membershipsState: State<{ isOpen: boolean }>;
  selectedFiles: State<DocumentDto[]>;
  showDeleteSelectedDialog: State<boolean>;
  className?: string;
  documentPageService: SpacesPageService;
}
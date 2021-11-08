import { State } from '@hookstate/core';
import { DocumentSpaceResponseDto } from '../../../openapi';

export interface ActionsProps {
  selectedSpace: State<DocumentSpaceResponseDto | undefined>;
  path: State<string>;
  shouldUpdateDatasource: State<boolean>;
  newFolderPrompt: State<boolean>;
  membershipsState: State<{ isOpen: boolean }>;
}
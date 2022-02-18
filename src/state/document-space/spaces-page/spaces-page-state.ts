import { IDatasource } from 'ag-grid-community';
import { SideDrawerSize } from '../../../components/SideDrawer/side-drawer-size';
import { DocumentDto, DocumentSpaceResponseDto, DocumentSpaceUserCollectionResponseDto, RecentDocumentDto } from '../../../openapi';
import { CreateEditOperationType } from '../document-space-utils';

export interface SpacesPageState {
  drawerOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string;
  showErrorMessage: boolean;
  selectedSpace?: DocumentSpaceResponseDto;
  shouldUpdateDatasource: boolean;
  datasource?: IDatasource;
  showUploadDialog: boolean;
  showDeleteDialog: boolean;
  fileToDelete: string;
  selectedFile?: DocumentDto;
  selectedFiles: DocumentDto[];
  recentUploads: RecentDocumentDto[];
  membershipsState: {
    isOpen: boolean;
  },
  createEditElementOpType: CreateEditOperationType;
  path: string;
  showDeleteSelectedDialog: boolean;
  isDefaultDocumentSpaceSettingsOpen: boolean;
  sideDrawerSize: SideDrawerSize;
  favorites: DocumentSpaceUserCollectionResponseDto[];
  spaceNotFound: boolean;
  showNoChosenSpace: boolean; // state we get into if we nav to an non-exist or private space
  showFolderSizeDialog: boolean;
  selectedItemForSize: DocumentDto | undefined;
}
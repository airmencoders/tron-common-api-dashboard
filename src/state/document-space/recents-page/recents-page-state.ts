import { IDatasource } from 'ag-grid-community';
import { RecentDocumentDto } from '../../../openapi';

export interface RecentsPageState {
  datasource?: IDatasource;
  shouldUpdateInfiniteCache: boolean;
  selectedFile?: RecentDocumentDto;
  showDeleteDialog: boolean;
  renameFormState: RenameFormState;
  pageStatus: PageStatus;
}

interface RenameFormState {
  isSubmitting: boolean;
  isOpen: boolean;
}

interface PageStatus {
  isLoading: boolean;
  isError: boolean;
  message?: string;
}
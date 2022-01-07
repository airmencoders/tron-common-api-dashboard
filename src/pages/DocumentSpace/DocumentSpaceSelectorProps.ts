import { DocumentSpaceResponseDto } from '../../openapi';
import DocumentSpaceService from "../../state/document-space/document-space-service";

export interface DocumentSpaceSelectorProps {
  isDocumentSpacesLoading: boolean;
  isDocumentSpacesErrored: boolean;
  documentSpaceService: DocumentSpaceService;
  selectedSpace?: DocumentSpaceResponseDto;
  onUnreachableSpace: boolean;
}
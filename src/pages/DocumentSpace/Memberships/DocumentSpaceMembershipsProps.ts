export interface DocumentSpaceMembershipsProps {
  documentSpaceId: string;
  isOpen: boolean;
  onCloseHandler: () => void;
  onSubmit: () => void;
}
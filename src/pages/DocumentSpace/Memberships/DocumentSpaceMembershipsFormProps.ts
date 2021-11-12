export interface DocumentSpaceMembershipsFormProps {
  documentSpaceId: string;
  onMemberChangeCallback: () => void;
  onCloseHandler?: () => void;
}
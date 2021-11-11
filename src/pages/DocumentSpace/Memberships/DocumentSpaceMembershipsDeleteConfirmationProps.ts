export interface DocumentSpaceMembershipsDeleteConfirmationProps {
  onMemberDeleteConfirmationSubmit: () => void;
  onCancel: () => void;
  show: boolean;
  selectedMemberCount: number;
}
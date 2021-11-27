export interface ArchiveDialogProps<T extends { key: string } | undefined> {
  show: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  items?: T[] | T;
}
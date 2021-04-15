export interface ScratchStoragePrivsFlat {
  readId?: string;
  read: boolean;
  writeId?: string;
  write: boolean;
  adminId?: string;
  admin: boolean;
}
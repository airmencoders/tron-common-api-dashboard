export interface ScratchStorageAppFlat {
  id: string;
  appName: string;
  appHasImplicitRead: boolean;
  scratchRead: boolean;
  scratchWrite: boolean;
  scratchAdmin: boolean;
}
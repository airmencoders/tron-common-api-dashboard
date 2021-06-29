import { ScratchStorageUserWithPrivsFlat } from "./scratch-storage-user-with-privs-flat";


export interface ScratchStorageFlat {
    id: string;
    appName: string;
    appHasImplicitRead?: boolean;
    aclMode?: boolean;
    userPrivs: Array<ScratchStorageUserWithPrivsFlat>;
    keyNames: Array<string>;
  }
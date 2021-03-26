import { ScratchStorageUserWithPrivsFlat } from "./scratch-storage-user-with-privs-flat";

export interface ScratchStorageFlat {
    id: string;
    appName: string;
    userPrivs?: Array<ScratchStorageUserWithPrivsFlat>;
  }
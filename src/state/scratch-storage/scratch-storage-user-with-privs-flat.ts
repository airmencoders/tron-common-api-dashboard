import { ScratchStoragePrivsFlat } from "./scratch-storage-privs-flat";

export interface ScratchStorageUserWithPrivsFlat extends ScratchStoragePrivsFlat {
    userId: string;
    email: string;
}
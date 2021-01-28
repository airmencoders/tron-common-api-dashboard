export default interface DiskSpaceDetails {
    total: number;
    free: number;
    threshold: number;
    exists: boolean;
}
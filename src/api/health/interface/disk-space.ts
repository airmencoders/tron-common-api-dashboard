import DiskSpaceDetails from "./disk-space-details";

export default interface DiskSpace {
    status: string;
    details: DiskSpaceDetails;
}
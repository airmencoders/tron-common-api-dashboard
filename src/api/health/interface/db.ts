import DbDetails from "./db-details";

export default interface Db {
    status: string;
    details: DbDetails;
}
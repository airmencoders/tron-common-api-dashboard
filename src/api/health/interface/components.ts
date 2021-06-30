import Db from "./db";
import DiskSpace from "./disk-space";
import Ping from "./ping";

export interface GenericComponent {
    status: string,
    details: Record<string, string>;
}

export default interface Components {
    [x: string]: GenericComponent | Db | DiskSpace | Ping;
}
